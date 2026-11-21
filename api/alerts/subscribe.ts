import { db, emailValid, envFor, jsonHeaders, parseBody, phoneValid, randomToken, sha256, text, type ApiReq, type ApiRes, header, rateLimit } from '../../src/lib/alertsServer.js'
export default async function handler(req:ApiReq,res:ApiRes,ctx?:{env?:import('../../src/lib/alertsServer.js').AlertEnv}) {
 jsonHeaders(res);if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 try{
  const env=envFor(req,ctx),ip=header(req,'x-forwarded-for').split(',')[0]||'unknown'
  if(!await rateLimit(env,'subscribe:'+ip,12,3600))return res.status(429).json({error:'Too many subscription attempts. Please try later.'})
  const b=parseBody(req.body),name=text(b.name,120),agency=text(b.agency,160),type=b.type==='agent'?'agent':'client'
  const email=text(b.email,254).toLowerCase(),whatsapp=text(b.whatsapp,30).replace(/[\s().-]/g,'')
  const language=['en','ur','ar'].includes(text(b.language,5))?text(b.language,5):'en',city=text(b.city,100)
  const interests=Array.isArray(b.interests)?b.interests.filter(x=>typeof x==='string').slice(0,8):[]
  const emailConsent=b.emailConsent===true,whatsappConsent=b.whatsappConsent===true,source=text(b.source,120)||'website_subscription'
  if(!name||!emailValid(email)||!phoneValid(whatsapp)||(!emailConsent&&!whatsappConsent))return res.status(400).json({error:'Enter a valid name, email, international WhatsApp number, and at least one marketing consent.'})
  if(type==='agent'&&!agency)return res.status(400).json({error:'Agency name is required for travel agents.'})
  const token=randomToken(),tokenHash=await sha256(token)
  const existing=await db(env,'alert_contacts?select=id&or=(email.eq.'+encodeURIComponent(email)+',whatsapp.eq.'+encodeURIComponent(whatsapp)+')&limit=1')
  const previous=Array.isArray(existing)?existing[0]:null
  const payload={name,agency:agency||null,type,email,whatsapp,city:city||null,language,interests,email_consent:emailConsent,whatsapp_consent:whatsappConsent,email_consent_at:emailConsent?new Date().toISOString():null,whatsapp_consent_at:whatsappConsent?new Date().toISOString():null,consent_source:source,unsubscribed:false,unsubscribed_at:null,updated_at:new Date().toISOString()}
  let contactId:string
  if(previous?.id){await db(env,'alert_contacts?id=eq.'+previous.id,{method:'PATCH',body:JSON.stringify(payload)});contactId=previous.id}
  else{const created=await db(env,'alert_contacts',{method:'POST',body:JSON.stringify(payload)});contactId=created?.[0]?.id}
  await db(env,'alert_unsubscribe_tokens',{method:'POST',body:JSON.stringify({contact_id:contactId,token_hash:tokenHash})})
  return res.status(200).json({ok:true,message:'Your preferences have been saved.',unsubscribeUrl:(env.APP_BASE_URL||'https://trexifly.com')+'/api/alerts/unsubscribe?token='+encodeURIComponent(token)})
 }catch(e){return res.status(503).json({error:e instanceof Error?e.message:'Subscription service unavailable'})}
}
