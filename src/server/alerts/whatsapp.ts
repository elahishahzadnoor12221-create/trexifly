import { adminWriteAllowed, db, envFor, isAdmin, jsonHeaders, parseBody, text, type ApiReq, type ApiRes } from '../../lib/alertsServer.js'
export default async function handler(req:ApiReq,res:ApiRes,ctx?:{env?:import('../../lib/alertsServer.js').AlertEnv}) {
 jsonHeaders(res);const env=envFor(req,ctx)
 if(!await isAdmin(req,env))return res.status(401).json({error:'Admin login required'})
 try{
  if(req.method==='GET'){
   const rows=await db(env,'alert_whatsapp_status?select=contact_id,status,updated_at&order=updated_at.desc&limit=5000')
   return res.status(200).json({statuses:rows})
  }
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
  if(!await adminWriteAllowed(req,env,'whatsapp'))return res.status(403).json({error:'Request origin or rate limit rejected'})
  const b=parseBody(req.body),contactId=text(b.contactId,80),status=b.status==='sent'?'sent':'not_sent'
  if(!contactId)return res.status(400).json({error:'Contact ID is required'})
  await db(env,'alert_whatsapp_status?on_conflict=contact_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({contact_id:contactId,status,updated_at:new Date().toISOString()})})
  return res.status(200).json({ok:true,status})
 }catch(e){return res.status(503).json({error:e instanceof Error?e.message:'WhatsApp status update failed'})}
}
