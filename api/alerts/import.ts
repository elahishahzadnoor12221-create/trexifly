import { adminWriteAllowed, db, emailValid, envFor, isAdmin, jsonHeaders, parseBody, phoneValid, text, type ApiReq, type ApiRes } from '../../src/lib/alertsServer.js'
export default async function handler(req:ApiReq,res:ApiRes,ctx?:{env?:import('../../src/lib/alertsServer.js').AlertEnv}) {
 jsonHeaders(res);const env=envFor(req,ctx)
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 if(!await isAdmin(req,env))return res.status(401).json({error:'Admin login required'})
 if(!await adminWriteAllowed(req,env,'import',12))return res.status(403).json({error:'Request origin or rate limit rejected'})
 try{
  const b=parseBody(req.body),rows=Array.isArray(b.rows)?b.rows.slice(0,100):[]
  if(!rows.length)return res.status(400).json({error:'No rows supplied; maximum 100 rows per import batch.'})
  const invalidRows:string[]=[],payloads:Record<string,unknown>[]=[]
  let consentMissing=0
  for(let i=0;i<rows.length;i++){
   const r=rows[i] as Record<string,unknown>,name=text(r.name,120),agency=text(r.agency,160),email=text(r.email,254).toLowerCase(),whatsapp=text(r.whatsapp,30).replace(/[\s().-]/g,'')
   if(!name||!agency||!emailValid(email)||!phoneValid(whatsapp)){invalidRows.push('Row '+(i+2)+': invalid name, agency, email or WhatsApp');continue}
   const ec=r.email_consent===true||r.email_consent==='true'||r.email_consent==='yes',wc=r.whatsapp_consent===true||r.whatsapp_consent==='true'||r.whatsapp_consent==='yes'
   if(!ec&&!wc)consentMissing++
   payloads.push({name,agency,email,whatsapp,type:'agent',city:text(r.city,100)||null,language:['en','ur','ar'].includes(text(r.language,5))?text(r.language,5):'en',interests:Array.isArray(r.interests)?r.interests:(typeof r.interests==='string'?r.interests.split(/[;|]/).map(x=>x.trim()).filter(Boolean):[]),email_consent:ec,whatsapp_consent:wc,email_consent_at:ec?new Date().toISOString():null,whatsapp_consent_at:wc?new Date().toISOString():null,consent_source:text(r.source,120)||'csv_import_unverified',notes:text(r.notes,500)||null})
  }
  let created=0,updated=0
  if(payloads.length){
   const result=await db(env,'rpc/upsert_alert_contacts',{method:'POST',body:JSON.stringify({p_contacts:payloads})})
   created=Number(result?.created)||0;updated=Number(result?.updated)||0
  }
  return res.status(200).json({ok:true,created,updated,invalid:invalidRows.length,consentMissing,errors:invalidRows,notice:'Rows without explicit consent remain non-marketable. Previously unsubscribed contacts remain unsubscribed.'})
 }catch(e){return res.status(503).json({error:e instanceof Error?e.message:'CSV import failed'})}
}
