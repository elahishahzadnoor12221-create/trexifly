import { db, envFor, jsonHeaders, sha256, type ApiReq, type ApiRes } from '../../src/lib/alertsServer.js'
export default async function handler(req:ApiReq,res:ApiRes,ctx?:{env?:import('../../src/lib/alertsServer.js').AlertEnv}) {
 jsonHeaders(res)
 if(req.method!=='GET'&&req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 try{
  const env=envFor(req,ctx),raw=req.query?.token,queryToken=Array.isArray(raw)?raw[0]||'':raw||''
  let token=queryToken
  if(req.method==='POST'&&!token){
   if(typeof req.body==='string'){const params=new URLSearchParams(req.body);token=params.get('token')||'';if(!token){try{const b=JSON.parse(req.body);token=typeof b.token==='string'?b.token:''}catch{}}}
   else {const b=req.body as Record<string,unknown>;token=typeof b?.token==='string'?b.token:''}
  }
  if(token.length<32||token.length>100)return res.status(400).json({error:'Invalid unsubscribe link'})
  if(req.method==='GET'){
   res.setHeader('Content-Type','text/html; charset=utf-8')
   return res.status(200).send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trexifly unsubscribe</title><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px;color:#172033"><main style="max-width:520px;margin:auto;background:white;padding:32px;border-radius:18px"><h1>Unsubscribe from Trexifly updates</h1><p>Confirm below to stop promotional email and WhatsApp updates for this contact.</p><form method="post" action="/api/alerts/unsubscribe?token='+encodeURIComponent(token)+'"><button style="background:#f50;color:white;border:0;border-radius:10px;padding:14px 20px;font-weight:bold">Confirm unsubscribe</button></form></main></body></html>')
  }
  const hash=await sha256(token),rows=await db(env,'alert_unsubscribe_tokens?select=id,contact_id&token_hash=eq.'+hash+'&used_at=is.null&limit=1')
  if(!Array.isArray(rows)||!rows[0])return res.status(404).json({error:'This unsubscribe link is invalid or already used.'})
  await db(env,'alert_unsubscribe_tokens?id=eq.'+rows[0].id,{method:'PATCH',body:JSON.stringify({used_at:new Date().toISOString()})})
  await db(env,'alert_contacts?id=eq.'+rows[0].contact_id,{method:'PATCH',body:JSON.stringify({unsubscribed:true,email_consent:false,whatsapp_consent:false,unsubscribed_at:new Date().toISOString(),updated_at:new Date().toISOString()})})
  res.setHeader('Content-Type','text/html; charset=utf-8')
  return res.status(200).send('<!doctype html><html lang="en"><meta charset="utf-8"><title>Unsubscribed</title><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px;color:#172033"><main style="max-width:520px;margin:auto;background:white;padding:32px;border-radius:18px"><h1>You are unsubscribed</h1><p>Trexifly promotional email and WhatsApp updates have been turned off for this contact.</p></main></body></html>')
 }catch{return res.status(503).json({error:'Unsubscribe service temporarily unavailable'})}
}
