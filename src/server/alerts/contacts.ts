import { adminWriteAllowed, db, emailValid, envFor, isAdmin, jsonHeaders, parseBody, phoneValid, randomToken, sha256, text, type ApiReq, type ApiRes } from '../../lib/alertsServer.js'
export default async function handler(req:ApiReq,res:ApiRes,ctx?:{env?:import('../../lib/alertsServer.js').AlertEnv}) {
 jsonHeaders(res); const env=envFor(req,ctx)
 if(!await isAdmin(req,env)) return res.status(401).json({error:'Admin login required'})
 try {
  if(req.method==='GET') {
   const q=req.query?.type, type=Array.isArray(q)?q[0]:q
   const rows=await db(env,'alert_contacts?select=id,name,agency,type,email,whatsapp,city,language,interests,email_consent,whatsapp_consent,unsubscribed,created_at&order=created_at.desc&limit=5000'+(type==='agent'||type==='client'?'&type=eq.'+type:''))
   return res.status(200).json({contacts:rows})
  }
  if(req.method==='POST') {
   if(!await adminWriteAllowed(req,env,'contacts'))return res.status(403).json({error:'Request origin or rate limit rejected'})
   const b=parseBody(req.body), name=text(b.name,120), email=text(b.email,254).toLowerCase(), whatsapp=text(b.whatsapp,30).replace(/[\s().-]/g,''), type=b.type==='agent'?'agent':'client', agency=text(b.agency,160)
   if(!name||!emailValid(email)||!phoneValid(whatsapp)||(type==='agent'&&!agency)) return res.status(400).json({error:'Invalid contact details'})
   const token=randomToken(), hash=await sha256(token), ec=b.emailConsent===true, wc=b.whatsappConsent===true
   if(!ec&&!wc) return res.status(400).json({error:'At least one consent is required'})
   const existing=await db(env,'alert_contacts?select=id&or=(email.eq.'+encodeURIComponent(email)+',whatsapp.eq.'+encodeURIComponent(whatsapp)+')&limit=1')
   const row={name,agency:agency||null,email,whatsapp,type,city:text(b.city,100)||null,language:['en','ur','ar'].includes(text(b.language,5))?text(b.language,5):'en',interests:Array.isArray(b.interests)?b.interests.filter(x=>typeof x==='string').slice(0,8):[],email_consent:ec,whatsapp_consent:wc,email_consent_at:ec?new Date().toISOString():null,whatsapp_consent_at:wc?new Date().toISOString():null,consent_source:'admin_manual',unsubscribe_token_hash:hash,unsubscribed:false,unsubscribed_at:null}
   if(Array.isArray(existing)&&existing[0]) await db(env,'alert_contacts?id=eq.'+existing[0].id,{method:'PATCH',body:JSON.stringify(row)})
   else await db(env,'alert_contacts',{method:'POST',body:JSON.stringify(row)})
   return res.status(200).json({ok:true})
  }
  return res.status(405).json({error:'Method not allowed'})
 } catch(e){return res.status(503).json({error:e instanceof Error?e.message:'Contacts service unavailable'})}
}
