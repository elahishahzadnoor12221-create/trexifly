export type AlertEnv = {
  SUPABASE_URL?: string
  SUPABASE_SECRET_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  GEMINI_API_KEY?: string
  RESEND_API_KEY?: string
  ADMIN_ALERT_PASSWORD?: string
  ADMIN_ALERT_SESSION_SECRET?: string
  ADMIN_ALERT_EMAIL?: string
  APP_BASE_URL?: string
}
export type ApiReq = { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> }
export type ApiRes = { setHeader(name: string, value: string): void; status(code: number): ApiRes; json(body: unknown): ApiRes; send(body: string): ApiRes; end(): void }
declare const process: { env: AlertEnv }

export function envFor(_req: ApiReq, ctx?: { env?: AlertEnv }): AlertEnv {
  const runtime = ctx?.env ?? {}
  const out: AlertEnv = {}
  for (const k of ['SUPABASE_URL','SUPABASE_SECRET_KEY','SUPABASE_SERVICE_ROLE_KEY','GEMINI_API_KEY','RESEND_API_KEY','ADMIN_ALERT_PASSWORD','ADMIN_ALERT_SESSION_SECRET','ADMIN_ALERT_EMAIL','APP_BASE_URL'] as const) {
    out[k] = (process.env[k] || runtime[k] || '').trim()
  }
  return out
}
export function jsonHeaders(res: ApiRes) {
  res.setHeader('Content-Type','application/json; charset=utf-8')
  res.setHeader('Cache-Control','no-store')
  res.setHeader('X-Content-Type-Options','nosniff')
}
export function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = null } }
  return body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : {}
}
export function text(value: unknown, max = 300): string {
  return typeof value === 'string' ? value.trim().slice(0,max) : ''
}
export function emailValid(value: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254 }
export function phoneValid(value: string): boolean { return /^\+[1-9]\d{7,14}$/.test(value.replace(/[\s().-]/g,'')) }
export function supabaseReady(env: AlertEnv): boolean { return !!(env.SUPABASE_URL && (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY)) }
export async function db(env: AlertEnv, table: string, init: RequestInit = {}) {
  if (!supabaseReady(env)) throw new Error('Subscriber database is not configured')
  const url = env.SUPABASE_URL!.replace(/\/$/,'')
  const secretKey = (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const headers: Record<string, string> = {
    apikey: secretKey,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...(init.headers as Record<string, string> || {}),
  }
  // Supabase sb_secret_* keys are opaque API keys, not JWTs. PostgREST
  // must not receive them in Authorization; retain Bearer only for JWT keys.
  if (secretKey.startsWith('eyJ')) headers.Authorization = `Bearer ${secretKey}`
  else delete headers.Authorization
  const response = await fetch(`${url}/rest/v1/${table}`, {
    ...init,
    headers,
  })
  const raw = await response.text()
  if (!response.ok) throw new Error(`Database request failed (${response.status}): ${raw.slice(0,300)}`)
  return raw ? JSON.parse(raw) : null
}
function b64url(bytes: Uint8Array): string { let s=''; bytes.forEach(b=>s+=String.fromCharCode(b)); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') }
function fromB64url(value: string): Uint8Array { const s=value.replace(/-/g,'+').replace(/_/g,'/'); const raw=atob(s+'='.repeat((4-s.length%4)%4)); return Uint8Array.from(raw,c=>c.charCodeAt(0)) }
async function hmac(secret: string, data: string): Promise<string> {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign'])
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(data))))
}
export function header(req: ApiReq, name: string): string {
  const v=req.headers?.[name.toLowerCase()] ?? req.headers?.[name]
  return Array.isArray(v)?v[0]||'':v||''
}
export async function createSession(env: AlertEnv): Promise<string> {
  const payload=b64url(new TextEncoder().encode(JSON.stringify({ exp:Date.now()+8*60*60*1000, nonce:b64url(crypto.getRandomValues(new Uint8Array(16))) })))
  return payload+'.'+await hmac(env.ADMIN_ALERT_SESSION_SECRET!,payload)
}
export async function isAdmin(req: ApiReq, env: AlertEnv): Promise<boolean> {
  if (!env.ADMIN_ALERT_SESSION_SECRET) return false
  const cookie=header(req,'cookie').split(';').map(x=>x.trim()).find(x=>x.startsWith('trexifly_alert_admin='))
  if (!cookie) return false
  const token=cookie.slice('trexifly_alert_admin='.length), parts=token.split('.')
  if(parts.length!==2) return false
  const expected=await hmac(env.ADMIN_ALERT_SESSION_SECRET,parts[0])
  if(expected!==parts[1]) return false
  try { const payload=JSON.parse(new TextDecoder().decode(fromB64url(parts[0]))); return typeof payload.exp==='number' && payload.exp>Date.now() } catch { return false }
}
export function setSessionCookie(res: ApiRes, token: string) {
  res.setHeader('Set-Cookie',`trexifly_alert_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/alerts; Max-Age=28800`)
}
export function clearSessionCookie(res: ApiRes) {
  res.setHeader('Set-Cookie','trexifly_alert_admin=; HttpOnly; Secure; SameSite=Strict; Path=/api/alerts; Max-Age=0')
}
export function requireSameOrigin(req: ApiReq, env: AlertEnv): boolean {
  const origin=header(req,'origin')
  const base=env.APP_BASE_URL || ''
  if (!origin || !base) return false
  try { const o=new URL(origin); return o.host===new URL(base).host } catch { return false }
}
export async function rateLimit(env: AlertEnv, key: string, max=10, windowSeconds=900): Promise<boolean> {
  const rows=await db(env,'rpc/consume_alert_rate_limit',{method:'POST',body:JSON.stringify({p_key:key,p_max:max,p_window_seconds:windowSeconds})})
  return rows===true || (Array.isArray(rows) && rows[0]===true)
}
export async function adminWriteAllowed(req: ApiReq, env: AlertEnv, action: string, max = 40): Promise<boolean> {
  if (!requireSameOrigin(req, env)) return false
  const ip = header(req, 'x-forwarded-for').split(',')[0] || 'unknown'
  return rateLimit(env, 'admin:' + action + ':' + ip, max, 3600)
}
export function randomToken(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(32)))
}
export async function sha256(value: string): Promise<string> {
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')
}
export function csvCell(value: unknown): string {
  const s=String(value ?? '')
  return /[",\r\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s
}
export function corsNoop() {}
