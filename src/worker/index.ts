import { Hono } from 'hono'
import { CAR_ROWS, TRANSFER_ROWS, HOME_SHOWCASE_CARS } from '../data/vehicleInventory'

type Env = {
  ASSETS: Fetcher
  OLLAMA_API_KEY?: string
  OPENROUTER_API_KEY?: string
  CARSXE_API_KEY?: string
}

const app = new Hono<{ Bindings: Env }>()

const SYSTEM_PROMPT = 'You are Trexifly AI, a careful travel-planning assistant. Help travelers compare routes, flights, hotels, car rentals, airport transfers, and trips in Northern Pakistan. Give practical planning guidance, ask for missing details when needed, and never invent live prices, schedules, availability, bookings, or visa guarantees. Tell users to confirm current details with the booking provider.'

const VEHICLE_BRANDS = ['Mercedes-Benz', 'Land Rover', 'Volkswagen', 'Mitsubishi', 'Toyota', 'Honda', 'Hyundai', 'Nissan', 'Suzuki', 'Kia', 'BMW', 'Audi', 'Porsche', 'Lexus', 'Ford', 'MG']
const VEHICLE_TITLES = [
  ...CAR_ROWS.map((row) => row[0]),
  ...TRANSFER_ROWS.map((row) => row[0]),
  ...HOME_SHOWCASE_CARS.map((row) => row.name),
]
function parseVehicleTitle(title: string) {
  const brand = VEHICLE_BRANDS.find((name) => title.toLowerCase().startsWith(name.toLowerCase()))
  if (!brand) return null
  const model = title.slice(brand.length).replace(/^\s+/, '').split(/\s*\/\s*/)[0].trim()
  return model ? { make: brand.toLowerCase(), model: model.toLowerCase() } : null
}

app.get('/api/health', (c) => c.json({ ok: true, service: 'trexifly' }))

// Public-domain-only vehicle imagery. CarsXE's license filter narrows candidates;
// its contextLink still needs to be retained for provenance and manual verification.
app.get('/api/vehicle-image', async (c) => {
  const make = (c.req.query('make') ?? '').trim()
  const model = (c.req.query('model') ?? '').trim()
  const fallback = (c.req.query('fallback') ?? '').trim()
  const safeFallback = /^\/vehicles\/[a-z0-9-]+\.jpg$/i.test(fallback)
    ? fallback
    : '/vehicles/economy-hatchback.jpg'

  const isInventoryVehicle = VEHICLE_TITLES.some((title) => {
    const parsed = parseVehicleTitle(title)
    return parsed?.make === make.toLowerCase() && parsed.model === model.toLowerCase()
  })
  if (!isInventoryVehicle || !make || !model || make.length > 48 || model.length > 72 ||
      !/^[a-z0-9 .&'-]+$/i.test(make) || !/^[a-z0-9 .&'()/-]+$/i.test(model)) {
    return c.redirect(safeFallback, 302)
  }

  const cacheKey = new Request(new URL(
    '/api/vehicle-image?make=' + encodeURIComponent(make.toLowerCase()) +
    '&model=' + encodeURIComponent(model.toLowerCase()),
    c.req.url,
  ).toString(), { method: 'GET' })
  const cache = (caches as unknown as { default: Cache }).default
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  const apiKey = c.env.CARSXE_API_KEY?.trim()
  if (!apiKey) return c.redirect(safeFallback, 302)

  try {
    const endpoint = new URL('https://api.carsxe.com/images')
    endpoint.searchParams.set('key', apiKey)
    endpoint.searchParams.set('make', make)
    endpoint.searchParams.set('model', model)
    endpoint.searchParams.set('license', 'Public')
    endpoint.searchParams.set('size', 'Large')
    endpoint.searchParams.set('angle', 'front')
    endpoint.searchParams.set('transparent', 'true')
    endpoint.searchParams.set('validate', 'true')
    const lookup = await fetch(endpoint, { signal: AbortSignal.timeout(12000) })
    if (!lookup.ok) return c.redirect(safeFallback, 302)

    const payload = await lookup.json() as {
      success?: boolean
      images?: Array<{
        link?: string
        contextLink?: string
        mime?: string
        width?: string | number
        height?: string | number
      }>
    }
    const candidate = payload.images?.find((image) =>
      typeof image.link === 'string' &&
      image.link.startsWith('https://') &&
      typeof image.contextLink === 'string' &&
      image.contextLink.startsWith('https://') &&
      (image.mime === 'image/jpeg' || image.mime === 'image/png' || image.mime === 'image/webp') &&
      Number(image.width) >= 700 &&
      Number(image.height) >= 350,
    )
    if (!payload.success || !candidate?.link) return c.redirect(safeFallback, 302)

    const photo = await fetch(candidate.link, { signal: AbortSignal.timeout(12000) })
    const contentType = photo.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
    const length = Number(photo.headers.get('content-length') ?? '0')
    if (!photo.ok || !contentType?.startsWith('image/') || (length > 0 && length > 8_000_000)) {
      return c.redirect(safeFallback, 302)
    }

    const sourceLink = candidate.contextLink ?? candidate.link ?? ""
    const response = new Response(photo.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'X-Content-Type-Options': 'nosniff',
        'X-Trexifly-Image-Provider': 'CarsXE',
        'X-Trexifly-Image-Source': sourceLink,
      },
    })
    await cache.put(cacheKey, response.clone())
    return response
  } catch {
    return c.redirect(safeFallback, 302)
  }
})

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