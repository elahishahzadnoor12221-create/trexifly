import { runAiChat } from '../src/lib/aiChat'
type ApiEnv = { OLLAMA_API_KEY?: string; OPENROUTER_API_KEY?: string }
type VercelRequest = { method?: string; body?: unknown; env?: ApiEnv }
type VercelResponse = {
  setHeader(name: string, value: string): void
  status(code: number): VercelResponse
  json(body: unknown): VercelResponse
}
declare const process: { env: ApiEnv }

export default async function handler(req: VercelRequest, res: VercelResponse, c?: { env?: ApiEnv }) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  const fallback = "Sorry, I'm having trouble connecting right now. Please try again or click WhatsApp for instant booking help."
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed', reply: fallback })
  try {
    let body = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { body = null }
    }
    const message = body && typeof body === 'object' && 'message' in body && typeof (body as { message?: unknown }).message === 'string'
      ? (body as { message: string }).message.trim() : ''
    const runtimeEnv = c?.env ?? req.env
    const result = await runAiChat(message, {
      OLLAMA_API_KEY: process.env.OLLAMA_API_KEY?.trim() || runtimeEnv?.OLLAMA_API_KEY?.trim(),
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY?.trim() || runtimeEnv?.OPENROUTER_API_KEY?.trim(),
    })
    return res.status(result.status).json(result.body)
  } catch {
    return res.status(200).json({ reply: fallback })
  }
}