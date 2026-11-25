import { clearSessionCookie, createSession, envFor, header, isAdmin, jsonHeaders, parseBody, rateLimit, requireSameOrigin, setSessionCookie, type ApiReq, type ApiRes } from '../../lib/alertsServer.js'
export default async function handler(req:ApiReq,res:ApiRes,ctx?:{env?:import('../../lib/alertsServer.js').AlertEnv}) {
 jsonHeaders(res); const env=envFor(req,ctx)
 if(req.method==='GET') return res.status(200).json({authenticated:await isAdmin(req,env)})
 if(req.method==='DELETE'){if(!requireSameOrigin(req,env))return res.status(403).json({error:'Invalid request origin'});clearSessionCookie(res);return res.status(200).json({ok:true})}
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
 if(!requireSameOrigin(req,env)) return res.status(403).json({error:'Invalid request origin'})
 try {
  const ip=header(req,'x-forwarded-for').split(',')[0]||'unknown'
  if(!await rateLimit(env,'login:'+ip,5,900)) return res.status(429).json({error:'Too many login attempts. Try again later.'})
  const b=parseBody(req.body), password=typeof b.password==='string'?b.password:''
  if(!env.ADMIN_ALERT_PASSWORD||!env.ADMIN_ALERT_SESSION_SECRET) return res.status(503).json({error:'Admin credentials are not configured'})
  const a=new TextEncoder().encode(password), z=new TextEncoder().encode(env.ADMIN_ALERT_PASSWORD)
  const ah=await crypto.subtle.digest('SHA-256',a), zh=await crypto.subtle.digest('SHA-256',z)
  const aa=new Uint8Array(ah), zz=new Uint8Array(zh); let diff=aa.length^zz.length
  for(let i=0;i<Math.max(aa.length,zz.length);i++) diff|=(aa[i%aa.length]||0)^(zz[i%zz.length]||0)
  if(diff!==0) return res.status(401).json({error:'Incorrect password'})
  setSessionCookie(res,await createSession(env))
  return res.status(200).json({ok:true})
 } catch { return res.status(503).json({error:'Admin authentication unavailable'}) }
}
