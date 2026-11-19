import { Hono } from 'hono'

type Env = {
  ASSETS: Fetcher
  OLLAMA_API_KEY?: string
  OPENROUTER_API_KEY?: string
}

const app = new Hono<{ Bindings: Env }>()

const SYSTEM_PROMPT = 'You are Trexifly AI, a careful travel-planning assistant. Help travelers compare routes, flights, hotels, car rentals, airport transfers, and trips in Northern Pakistan. Give practical planning guidance, ask for missing details when needed, and never invent live prices, schedules, availability, bookings, or visa guarantees. Tell users to confirm current details with the booking provider.'

app.get('/api/health', (c) => c.json({ ok: true, service: 'trexifly' }))

app.post('/api/ai-chat', async (c) => {
  const body = await c.req.json<{ message?: string }>().catch((): { message?: string } => ({}))
  const prompt = typeof body.message === 'string' ? body.message.trim() : ''
  if (!prompt) return c.json({ error: 'Please enter a travel question.' }, 400)
  if (prompt.length > 2000) return c.json({ error: 'Please keep your question under 2,000 characters.' }, 413)

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]

  const ollamaKey = c.env.OLLAMA_API_KEY?.trim()
  if (ollamaKey) {
    try {
      const ollamaResponse = await fetch('https://ollama.com/api/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ollamaKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: 'glm-5.3-flash', messages, stream: false }),
        signal: AbortSignal.timeout(45000),
      })

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json() as { message?: { content?: string } }
        const reply = data.message?.content?.trim()
        if (reply) return c.json({ reply, provider: 'ollama', model: 'glm-5.3-flash' })
        return c.json({ error: 'Ollama Cloud returned an empty response. Please try again.' }, 502)
      }

      if (ollamaResponse.status !== 402) {
        return c.json({
          error: `Ollama Cloud returned HTTP ${ollamaResponse.status}. Please check model access or account usage.`,
          upstreamStatus: ollamaResponse.status,
          provider: 'ollama',
        }, 502)
      }
      // Only an explicit no-balance response triggers the free-provider fallback.
    } catch {
      return c.json({ error: 'Could not connect to Ollama Cloud. Please try again shortly.', provider: 'ollama' }, 502)
    }
  }

  const openRouterKey = c.env.OPENROUTER_API_KEY?.trim()
  if (!openRouterKey) {
    return c.json({
      error: ollamaKey
        ? 'Ollama Cloud has no remaining usage balance. Add an OpenRouter API key as the server secret OPENROUTER_API_KEY to enable the free AI fallback.'
        : 'No AI provider is configured. Set OLLAMA_API_KEY or OPENROUTER_API_KEY as a server secret.',
      upstreamStatus: ollamaKey ? 402 : 503,
    }, ollamaKey ? 402 : 503)
  }

  try {
    const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://trexifly.com',
        'X-Title': 'Trexifly AI Travel Assistant',
      },
      // openrouter/free only selects free models; no paid fallback is configured.
      body: JSON.stringify({
        model: 'openrouter/free',
        messages,
        stream: false,
        max_tokens: 900,
      }),
      signal: AbortSignal.timeout(45000),
    })

    if (!fallbackResponse.ok) {
      const status = fallbackResponse.status
      const message = status === 429
        ? 'OpenRouter free-tier limit has been reached. Please try again later.'
        : status === 401
          ? 'OpenRouter rejected the server API key. Please verify OPENROUTER_API_KEY.'
          : `OpenRouter free service returned HTTP ${status}. Please try again later.`
      return c.json({ error: message, upstreamStatus: status, provider: 'openrouter-free' }, status === 429 ? 429 : 502)
    }

    const data = await fallbackResponse.json() as {
      model?: string
      choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>
    }
    const content = data.choices?.[0]?.message?.content
    const reply = typeof content === 'string'
      ? content.trim()
      : Array.isArray(content)
        ? content.map((part) => part.text ?? '').join('').trim()
        : ''
    if (!reply) return c.json({ error: 'OpenRouter free model returned an empty response. Please try again.' }, 502)

    return c.json({ reply, provider: 'openrouter-free', model: data.model ?? 'openrouter/free' })
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError'
    return c.json({
      error: timedOut
        ? 'The free AI fallback took too long to respond. Please try again.'
        : 'Could not connect to the free AI fallback. Please try again shortly.',
      provider: 'openrouter-free',
    }, 502)
  }
})

app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404))
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
