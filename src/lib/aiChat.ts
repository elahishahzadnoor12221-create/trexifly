export const AI_CONNECTION_FALLBACK = "Sorry, I'm having trouble connecting right now. Please try again or click WhatsApp for instant booking help."

const BASE_SYSTEM_PROMPT = [
  'You are Trexifly AI, a careful, friendly travel advisor.',
  'Help travelers compare routes, flights, hotels, car rentals, airport transfers, and trips in Northern Pakistan.',
  'Automatically identify the language and writing system of the latest user message. Reply in exactly that same language and script, without asking the user to choose a language.',
  'Support English, Urdu, Roman Urdu, Arabic, French, Spanish, and other languages. If the user writes Roman Urdu, reply in Roman Urdu; if they write Urdu script, reply in Urdu script.',
  'Use the visitor country as optional context for relevant regional travel advice, but never assume their nationality or departure city.',
  'Give practical planning guidance, ask for missing details when needed, and never invent live prices, schedules, availability, bookings, or visa guarantees.',
  'Clearly tell users to confirm current details with the booking provider.'
].join(' ')

type AiEnv = {
  GEMINI_API_KEY?: string
  GEMINI_MODEL?: string
  GEMINI_FALLBACK_MODEL?: string
  OLLAMA_API_KEY?: string
  OPENROUTER_API_KEY?: string
}
type AiResult = { status: number; body: { reply: string; provider?: string; model?: string; error?: string } }
type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }

async function readJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.includes('application/json')) return null
  const text = await response.text()
  if (!text.trim()) return null
  try { return JSON.parse(text) as T } catch { return null }
}

function logUpstreamFailure(provider: string, status: number | string, model: string, message: string) {
  console.warn('[Trexifly AI upstream]', { provider, status, model, error: message.slice(0, 240) })
}

async function requestGemini(model: string, apiKey: string, systemPrompt: string, prompt: string): Promise<{ reply?: string; status: number; error?: string }> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
      }),
      signal: AbortSignal.timeout(25000),
    })
    if (response.ok) {
      const data = await readJson<GeminiResponse>(response)
      const reply = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
      return reply ? { reply, status: response.status } : { status: response.status, error: 'No candidate text returned.' }
    }
    const detail = await response.text()
    return { status: response.status, error: detail.replace(apiKey, '[redacted]').slice(0, 240) }
  } catch (error) {
    return { status: 0, error: error instanceof Error ? error.message : String(error) }
  }
}

const TRANSIENT_GEMINI_STATUSES = new Set([429, 500, 502, 503, 504])

export async function runAiChat(prompt: string, env: AiEnv, country = 'XX'): Promise<AiResult> {
  if (!prompt) return { status: 400, body: { reply: AI_CONNECTION_FALLBACK, error: 'Please enter a travel question.' } }
  if (prompt.length > 2000) return { status: 413, body: { reply: AI_CONNECTION_FALLBACK, error: 'Please keep your question under 2,000 characters.' } }

  const countryContext = country !== 'XX' ? `The visitor's approximate country/region is ${country}. Use this only when it helps with regional travel context.` : 'The visitor country is unknown.'
  const systemPrompt = `${BASE_SYSTEM_PROMPT} ${countryContext}`
  const geminiKey = env.GEMINI_API_KEY?.trim()
  const geminiModel = env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash'

  if (geminiKey) {
    const first = await requestGemini(geminiModel, geminiKey, systemPrompt, prompt)
    if (first.reply) return { status: 200, body: { reply: first.reply, provider: 'gemini', model: geminiModel } }
    logUpstreamFailure('gemini', first.status || 'NETWORK_ERROR', geminiModel, first.error || 'Empty response')

    let shouldFallback = first.status === 404 || first.status === 0 || TRANSIENT_GEMINI_STATUSES.has(first.status)
    if (TRANSIENT_GEMINI_STATUSES.has(first.status)) {
      // One short retry for transient capacity/rate-limit/server errors before changing models.
      await new Promise((resolve) => setTimeout(resolve, 350))
      const retry = await requestGemini(geminiModel, geminiKey, systemPrompt, prompt)
      if (retry.reply) return { status: 200, body: { reply: retry.reply, provider: 'gemini', model: geminiModel } }
      logUpstreamFailure('gemini-retry', retry.status || 'NETWORK_ERROR', geminiModel, retry.error || 'Empty response')
      shouldFallback = true
    }

    if (shouldFallback) {
      const configuredFallback = env.GEMINI_FALLBACK_MODEL?.trim()
      const fallbackModels = [...new Set([configuredFallback, 'gemini-3.8-flash-lite', 'gemini-3.1-flash-lite'].filter((model): model is string => Boolean(model) && model !== geminiModel))]
      for (const model of fallbackModels) {
        const fallback = await requestGemini(model, geminiKey, systemPrompt, prompt)
        if (fallback.reply) return { status: 200, body: { reply: fallback.reply, provider: 'gemini', model } }
        logUpstreamFailure('gemini-fallback', fallback.status || 'NETWORK_ERROR', model, fallback.error || 'Empty response')
        // 3.8 Flash Lite may not be enabled on this API key yet; move on to the known listed lite model.
        if (fallback.status !== 404 && !TRANSIENT_GEMINI_STATUSES.has(fallback.status) && fallback.status !== 0) break
      }
    }
  } else {
    logUpstreamFailure('gemini', 'SKIPPED', geminiModel, 'GEMINI_API_KEY is not configured in the runtime environment.')
  }

  const ollamaKey = env.OLLAMA_API_KEY?.trim()
  if (ollamaKey) {
    const model = 'glm-5.3-flash'
    try {
      const response = await fetch('https://ollama.com/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${ollamaKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], stream: false }),
        signal: AbortSignal.timeout(45000),
      })
      if (response.ok) {
        const data = await readJson<{ message?: { content?: string } }>(response)
        const reply = data?.message?.content?.trim()
        if (reply) return { status: 200, body: { reply, provider: 'ollama', model } }
      } else {
        logUpstreamFailure('ollama', response.status, model, (await response.text()).replace(ollamaKey, '[redacted]'))
      }
    } catch (error) {
      logUpstreamFailure('ollama', 'NETWORK_ERROR', model, error instanceof Error ? error.message : String(error))
    }
  }

  const openRouterKey = env.OPENROUTER_API_KEY?.trim()
  if (openRouterKey) {
    for (const model of ['openrouter/free', 'meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-3-27b-it:free']) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${openRouterKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://trexifly.com', 'X-Title': 'Trexifly AI Travel Assistant' },
          body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], stream: false, max_tokens: 900 }),
          signal: AbortSignal.timeout(45000),
        })
        if (!response.ok) {
          logUpstreamFailure('openrouter', response.status, model, (await response.text()).replace(openRouterKey, '[redacted]'))
          continue
        }
        const data = await readJson<{ model?: string; choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }> }>(response)
        const content = data?.choices?.[0]?.message?.content
        const reply = typeof content === 'string' ? content.trim() : Array.isArray(content) ? content.map((part) => part.text ?? '').join('').trim() : ''
        if (reply) return { status: 200, body: { reply, provider: 'openrouter-free', model: data?.model ?? model } }
      } catch (error) {
        logUpstreamFailure('openrouter', 'NETWORK_ERROR', model, error instanceof Error ? error.message : String(error))
      }
    }
  }

  return { status: 200, body: { reply: AI_CONNECTION_FALLBACK } }
}
