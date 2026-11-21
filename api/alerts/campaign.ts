import { adminWriteAllowed, db, envFor, isAdmin, jsonHeaders, parseBody, randomToken, sha256, text, type ApiReq, type ApiRes } from '../../src/lib/alertsServer.js'
const FROM='Trexifly <info@trexifly.com>', REPLY='info@trexifly.com'
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
async function sendTest(env:import('../../src/lib/alertsServer.js').AlertEnv,to:string,subject:string,html:string){
 if(!env.RESEND_API_KEY)throw new Error('RESEND_API_KEY is not configured')
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:FROM,to:[to],reply_to:REPLY,subject,html})})
 if(!r.ok)throw new Error('Resend rejected the test email ('+r.status+')')
 return r.json()
}
export default async function handler(req:ApiReq,res:ApiRes,ctx?:{env?:import('../../src/lib/alertsServer.js').AlertEnv}) {
 jsonHeaders(res);const env=envFor(req,ctx)
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 if(!await isAdmin(req,env))return res.status(401).json({error:'Admin login required'})
 if(!await adminWriteAllowed(req,env,'campaign',10))return res.status(403).json({error:'Request origin or rate limit rejected'})
 try{
  const b=parseBody(req.body),action=b.action==='test'?'test':'broadcast'
  if(action==='test'){
   if(!env.ADMIN_ALERT_EMAIL)return res.status(400).json({error:'Set ADMIN_ALERT_EMAIL to your own verified inbox first.'})
   const subject=text(b.subject,150)||'Trexifly campaign test',message=text(b.message,5000)
   if(!message)return res.status(400).json({error:'Message is required'})
   await sendTest(env,env.ADMIN_ALERT_EMAIL,subject,'<div style="font-family:Arial,sans-serif;white-space:pre-wrap">'+esc(message)+'</div><p>Test message from Trexifly.</p>')
   return res.status(200).json({ok:true,sentToAdmin:true})
  }
  if(b.confirm!==true)return res.status(400).json({error:'Explicit final campaign confirmation is required.'})
  const mode=b.mode==='agent'?'agent':'client',subject=text(b.subject,150)||'Trexifly travel update',items=Array.isArray(b.messages)?b.messages.slice(0,100):[]
  if(!items.length)return res.status(400).json({error:'No prepared messages.'})
  const candidates=items.map(item=>item as Record<string,unknown>).filter(m=>text(m.contactId,80)&&text(m.message,5000))
  const ids=[...new Set(candidates.map(m=>text(m.contactId,80)))]
  const contactRows=await db(env,'alert_contacts?select=id,email,email_consent,unsubscribed&id=in.('+ids.join(',')+')')
  const byId=new Map((Array.isArray(contactRows)?contactRows:[]).map((c:any)=>[c.id,c]))
  const eligible=candidates.filter(m=>{const c=byId.get(text(m.contactId,80)) as any;return c&&c.unsubscribed===false&&c.email_consent===true})
  if(!eligible.length)return res.status(400).json({error:'No current contacts have valid email marketing consent.'})
  const campaignRows=await db(env,'alert_campaigns',{method:'POST',body:JSON.stringify({mode,subject,status:'sending',recipient_count:eligible.length})})
  const campaignId=Array.isArray(campaignRows)?campaignRows[0]?.id:null
  if(!campaignId)throw new Error('Could not create campaign record')
  const base=env.APP_BASE_URL||'https://trexifly.com',tokenRows:{contact_id:string;token_hash:string}[]=[]
  const emailPayloads=[]
  for(const m of eligible){
   const contact=byId.get(text(m.contactId,80)) as any,token=randomToken(),hash=await sha256(token)
   tokenRows.push({contact_id:contact.id,token_hash:hash})
   const url=base+'/api/alerts/unsubscribe?token='+encodeURIComponent(token),message=text(m.message,5000)
   emailPayloads.push({from:FROM,to:[contact.email],reply_to:REPLY,subject,html:'<div style="font-family:Arial,sans-serif;line-height:1.6;white-space:pre-wrap">'+esc(message)+'</div><hr><p style="font-size:12px;color:#64748b">You are receiving this because you subscribed to Trexifly updates. <a href="'+esc(url)+'">Unsubscribe</a>.</p>',headers:{'List-Unsubscribe':'<'+url+'>, <mailto:info@trexifly.com?subject=unsubscribe>','List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}})
  }
  await db(env,'alert_unsubscribe_tokens',{method:'POST',body:JSON.stringify(tokenRows)})
  if(!env.RESEND_API_KEY)throw new Error('RESEND_API_KEY is not configured')
  const response=await fetch('https://api.resend.com/emails/batch',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(emailPayloads)})
  if(!response.ok){await db(env,'alert_campaigns?id=eq.'+campaignId,{method:'PATCH',body:JSON.stringify({status:'failed',failed_count:eligible.length,completed_at:new Date().toISOString()})});throw new Error('Resend batch request failed ('+response.status+')')}
  const logs=eligible.map(m=>({campaign_id:campaignId,contact_id:text(m.contactId,80),channel:'email',status:'accepted_by_resend',sent_at:new Date().toISOString()}))
  await db(env,'alert_campaign_messages',{method:'POST',body:JSON.stringify(logs)})
  await db(env,'alert_campaigns?id=eq.'+campaignId,{method:'PATCH',body:JSON.stringify({status:'accepted_by_resend',sent_count:eligible.length,completed_at:new Date().toISOString()})})
  return res.status(200).json({ok:true,campaignId,accepted:eligible.length,requested:items.length,note:'Accepted by Resend; final inbox delivery and bounce status are provider-reported.'})
 }catch(e){return res.status(503).json({error:e instanceof Error?e.message:'Campaign service unavailable'})}
}
