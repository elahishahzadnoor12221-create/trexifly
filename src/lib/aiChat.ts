export const AI_CONNECTION_FALLBACK = "Sorry, I'm having trouble connecting right now. Please try again or click WhatsApp for instant booking help."
export const AI_SYSTEM_PROMPT = 'You are Trexifly AI, a careful travel-planning assistant. Help travelers compare routes, flights, hotels, car rentals, airport transfers, and trips in Northern Pakistan. Give practical planning guidance, ask for missing details when needed, and never invent live prices, schedules, availability, bookings, or visa guarantees. Tell users to confirm current details with the booking provider.'

type AiEnv = { OLLAMA_API_KEY?: string; OPENROUTER_API_KEY?: string }
type AiResult = { status: number; body: { reply: string; provider?: string; model?: string; error?: string } }

async function readJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.includes('application/json')) return null
  const text = await response.text()
  if (!text.trim()) return null
  try { return JSON.parse(text) as T } catch { return null }
}

function safeUpstreamError(payload: unknown, rawText: string, key?: string): string {
  let message = ''
  if (payload && typeof payload === 'object') {
    const error = (payload as { error?: unknown }).error
    if (typeof error === 'string') message = error
    else if (error && typeof error === 'object') {
      const candidate = (error as { message?: unknown; code?: unknown }).message
      if (typeof candidate === 'string') message = candidate
      else if (typeof (error as { code?: unknown }).code === 'string') message = String((error as { code: string }).code)
    }
  }
  if (!message) message = rawText.trim().slice(0, 500)
  if (!message) message = 'No error message returned by upstream.'
  if (key) message = message.split(key).join('[redacted]')
  return message.replace(/[\\r\\n]+/g, ' ').slice(0, 500)
}

async function responseError(response: Response, key?: string): Promise<string> {
  const rawText = await response.text()
  let payload: unknown = null
  try { payload = rawText ? JSON.parse(rawText) : null } catch { /* retain bounded raw error text */ }
  return safeUpstreamError(payload, rawText, key)
}

function logUpstreamFailure(provider: string, status: number | string, model: string, message: string) {
  console.warn('[Trexifly AI upstream]', { provider, status, model, error: message })
}

export async function runAiChat(prompt: string, env: AiEnv): Promise<AiResult> {
  if (!prompt) return { status: 400, body: { reply: AI_CONNECTION_FALLBACK, error: 'Please enter a travel question.' } }
  if (prompt.length > 2000) return { status: 413, body: { reply: AI_CONNECTION_FALLBACK, error: 'Please keep your question under 2,000 characters.' } }

  const messages = [
    { role: 'system', content: AI_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]
  const ollamaKey = env.OLLAMA_API_KEY?.trim()
  if (ollamaKey) {
    const model = 'glm-5.3-flash'
    try {
      const response = await fetch('https://ollama.com/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${ollamaKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false }),
        signal: AbortSignal.timeout(45000),
      })
      if (response.ok) {
        const data = await readJson<{ message?: { content?: string } }>(response)
        const reply = data?.message?.content?.trim()
        if (reply) return { status: 200, body: { reply, provider: 'ollama', model } }
        logUpstreamFailure('ollama', response.status, model, 'HTTP success but response contained no message.content.')
      } else {
        logUpstreamFailure('ollama', response.status, model, await responseError(response, ollamaKey))
      }
    } catch (error) {
      logUpstreamFailure('ollama', 'NETWORK_ERROR', model, error instanceof Error ? error.message : String(error))
    }
  } else {
    logUpstreamFailure('ollama', 'SKIPPED', 'glm-5.3-flash', 'OLLAMA_API_KEY is not configured in the runtime environment.')
  }

  const openRouterKey = env.OPENROUTER_API_KEY?.trim()
  if (!openRouterKey) {
    logUpstreamFailure('openrouter', 'SKIPPED', 'openrouter/free', 'OPENROUTER_API_KEY is not configured in the runtime environment.')
    return { status: 200, body: { reply: AI_CONNECTION_FALLBACK } }
  }

  const freeModels = [
    'openrouter/free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-3-27b-it:free',
  ]
  for (const model of freeModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://trexifly.com',
          'X-Title': 'Trexifly AI Travel Assistant',
        },
        body: JSON.stringify({ model, messages, stream: false, max_tokens: 900 }),
        signal: AbortSignal.timeout(45000),
      })
      if (!response.ok) {
        logUpstreamFailure('openrouter', response.status, model, await responseError(response, openRouterKey))
        continue
      }
      const data = await readJson<{
        model?: string
        choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>
      }>(response)
      const content = data?.choices?.[0]?.message?.content
      const reply = typeof content === 'string' ? content.trim()
        : Array.isArray(content) ? content.map((part) => part.text ?? '').join('').trim() : ''
      if (reply) return { status: 200, body: { reply, provider: 'openrouter-free', model: data?.model ?? model } }
      logUpstreamFailure('openrouter', response.status, model, 'HTTP success but response contained no choices[0].message.content.')
    } catch (error) {
      logUpstreamFailure('openrouter', 'NETWORK_ERROR', model, error instanceof Error ? error.message : String(error))
    }
  }
  return { status: 200, body: { reply: AI_CONNECTION_FALLBACK, provider: 'openrouter-free' } }
}
