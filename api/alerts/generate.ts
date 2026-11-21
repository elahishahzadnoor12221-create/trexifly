import { adminWriteAllowed, db, envFor, isAdmin, jsonHeaders, parseBody, randomToken, sha256, text, type ApiReq, type ApiRes } from '../../src/lib/alertsServer.js'
export default async function handler(req:ApiReq,res:ApiRes,ctx?:{env?:import('../../src/lib/alertsServer.js').AlertEnv}) {
 jsonHeaders(res);if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 try{
  const env=envFor(req,ctx);if(!await isAdmin(req,env))return res.status(401).json({error:'Admin login required'})
  if(!await adminWriteAllowed(req,env,'generate',20))return res.status(403).json({error:'Request origin or rate limit rejected'})
  const b=parseBody(req.body),mode=b.mode==='agent'?'agent':'client',brief=text(b.brief,2500)
  if(!brief)return res.status(400).json({error:'Campaign brief is required'})
  const offset=typeof b.offset==='number'&&Number.isInteger(b.offset)?Math.max(0,Math.min(500000,b.offset)):0
  const rows=await db(env,'alert_contacts?select=id,name,agency,email,whatsapp,city,language,interests,email_consent,whatsapp_consent,unsubscribed&type=eq.'+mode+'&unsubscribed=eq.false&order=created_at.asc,id.asc&offset='+offset+'&limit=101')
  if(!Array.isArray(rows))throw new Error('Unable to load audience')
  const hasMore=rows.length>100, page=rows.slice(0,100)
  const eligible=page.filter(x=>x.email_consent===true||x.whatsapp_consent===true)
  if(!env.GEMINI_API_KEY)return res.status(503).json({error:'Gemini API key is not configured'})
  const languages=[...new Set(eligible.map(x=>['en','ur','ar'].includes(x.language)?x.language:'en'))] as string[]
  const templates:Record<string,string>={}
  for(const language of languages){
   const prompt=mode==='agent'
    ?`Create a professional, concise B2B partnership outreach message for Pakistani travel agencies inviting them to use Trexifly for comparing global flights, hotels and car rentals. Write in language code ${language}. Use placeholders exactly: {{agency}}, {{name}}, {{city}}. Context: ${brief}. No invented pricing, discounts, guarantees or integrations. Return only the message.`
    :`Create a helpful, concise personalized travel alert for a Trexifly subscriber. Write in language code ${language}. Use placeholders exactly: {{name}}, {{city}}, {{interests}}. Context: ${brief}. Do not invent prices, availability, discounts or guarantees. Return only the message.`
   const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key='+encodeURIComponent(env.GEMINI_API_KEY),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.45,maxOutputTokens:400}})})
   if(!response.ok)throw new Error('Gemini generation failed ('+response.status+')')
   const data=await response.json() as {candidates?:{content?:{parts?:{text?:string}[]} }[]}
   templates[language]=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim()||''
   if(!templates[language])throw new Error('Gemini returned an empty message')
  }
  const optOutRows:{contact_id:string;token_hash:string}[]=[],optOutLinks:Record<string,string>={}
  for(const contact of eligible.filter(x=>x.whatsapp_consent===true)){
   const token=randomToken();optOutRows.push({contact_id:contact.id,token_hash:await sha256(token)})
   optOutLinks[contact.id]=(env.APP_BASE_URL||'https://trexifly.com')+'/api/alerts/unsubscribe?token='+encodeURIComponent(token)
  }
  if(optOutRows.length)await db(env,'alert_unsubscribe_tokens',{method:'POST',body:JSON.stringify(optOutRows)})
  const messages=eligible.map(contact=>{
   const language=['en','ur','ar'].includes(contact.language)?contact.language:'en'
   let message=templates[language]
   const values:Record<string,string>={name:contact.name||'',agency:contact.agency||contact.name||'',city:contact.city||'',interests:Array.isArray(contact.interests)?contact.interests.join(', '):''}
   for(const [key,value] of Object.entries(values))message=message.replaceAll('{{'+key+'}}',value)
   if(contact.whatsapp_consent===true&&optOutLinks[contact.id]){const label=language==='ur'?'اپ ڈیٹس بند کرنے کے لیے: ':language==='ar'?'لإيقاف التحديثات: ':'To stop updates: ';message+='\n\n'+label+optOutLinks[contact.id]}
   return {contactId:contact.id,email:contact.email,whatsapp:contact.whatsapp,name:contact.name,language,mode,message,emailEligible:contact.email_consent===true,whatsappEligible:contact.whatsapp_consent===true}
  })
  return res.status(200).json({ok:true,mode,offset,hasMore,eligibleCount:eligible.length,emailRecipientCount:messages.filter(m=>m.emailEligible).length,whatsappRecipientCount:messages.filter(m=>m.whatsappEligible).length,limit:100,messages})
 }catch(e){return res.status(503).json({error:e instanceof Error?e.message:'Message generation failed'})}
}
