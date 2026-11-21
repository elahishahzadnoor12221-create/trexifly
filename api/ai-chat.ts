import { runAiChat } from '../src/lib/aiChat.js'

type ApiEnv = { GEMINI_API_KEY?: string; GEMINI_MODEL?: string; GEMINI_FALLBACK_MODEL?: string; OLLAMA_API_KEY?: string; OPENROUTER_API_KEY?: string }
type VercelRequest = {
  method?: string
  body?: unknown
  env?: ApiEnv
  headers?: Record<string, string | string[] | undefined>
}
type VercelResponse = {
  setHeader(name: string, value: string): void
  status(code: number): VercelResponse
  json(body: unknown): VercelResponse
}
declare const process: { env: ApiEnv }

const REGION_WELCOME: Record<string, string> = {
  PK: 'Welcome to Trexifly! Planning a journey in Pakistan or exploring Northern Pakistan? I can help you plan routes, stays, flights, car hire and airport transfers.',
  GB: 'Welcome to Trexifly! Planning a UK getaway or an international journey? I can help you explore flights, stays, routes and transfers.',
  US: 'Welcome to Trexifly! Where would you like your next journey to take you? I can help with flights, stays, routes and airport transfers.',
  AE: 'Welcome to Trexifly! Planning a trip from the UAE or discovering somewhere new? I can help with flights, stays and smooth airport transfers.',
  SA: 'Welcome to Trexifly! Planning your next journey from Saudi Arabia or beyond? I can help you explore routes, stays and travel options.',
  FR: 'Bienvenue chez Trexifly ! Où souhaitez-vous voyager ? Je peux vous aider à organiser vos vols, hébergements et transferts.',
  ES: '¡Te damos la bienvenida a Trexifly! ¿Adónde te gustaría viajar? Puedo ayudarte con vuelos, alojamientos y traslados.',
  CA: 'Welcome to Trexifly! Planning a Canadian escape or an international trip? I can help you explore flights, stays and transfers.',
  AU: 'Welcome to Trexifly! Planning your next Australian or international adventure? I can help with flights, stays and transfers.',
}
const DEFAULT_WELCOME = 'Welcome to Trexifly! Where are you dreaming of travelling? I can help you explore routes, flights, stays, car hire and airport transfers.'

function getCountry(req: VercelRequest): string {
  const raw = req.headers?.['x-vercel-ip-country']
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && /^[A-Z]{2}$/i.test(value.trim()) ? value.trim().toUpperCase() : 'XX'
}

export default async function handler(req: VercelRequest, res: VercelResponse, c?: { env?: ApiEnv }) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Vary', 'x-vercel-ip-country')
  const country = getCountry(req)

  if (req.method === 'GET') {
    return res.status(200).json({ reply: REGION_WELCOME[country] ?? DEFAULT_WELCOME, country })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    let body = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { body = null }
    }
    const message = body && typeof body === 'object' && 'message' in body && typeof (body as { message?: unknown }).message === 'string'
      ? (body as { message: string }).message.trim() : ''
    const runtimeEnv = c?.env ?? req.env
    const result = await runAiChat(message, {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim() || runtimeEnv?.GEMINI_API_KEY?.trim(),
      GEMINI_MODEL: process.env.GEMINI_MODEL?.trim() || runtimeEnv?.GEMINI_MODEL?.trim(),
      GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL?.trim() || runtimeEnv?.GEMINI_FALLBACK_MODEL?.trim(),
      OLLAMA_API_KEY: process.env.OLLAMA_API_KEY?.trim() || runtimeEnv?.OLLAMA_API_KEY?.trim(),
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY?.trim() || runtimeEnv?.OPENROUTER_API_KEY?.trim(),
    }, country)
    return res.status(result.status).json(result.body)
  } catch {
    return res.status(200).json({ reply: "Sorry, I'm having trouble connecting right now. Please try again or click WhatsApp for instant booking help." })
  }
}
