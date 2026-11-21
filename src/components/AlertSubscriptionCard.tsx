import { useState } from 'react'

const INTERESTS=['Flights','Hotels','Umrah & Hajj','Car Rentals','Northern Pakistan Tours','B2B Portal Access']
export function AlertSubscriptionCard(){
 const [type,setType]=useState<'client'|'agent'>('client'),[name,setName]=useState(''),[agency,setAgency]=useState(''),[whatsapp,setWhatsapp]=useState(''),[email,setEmail]=useState(''),[city,setCity]=useState(''),[language,setLanguage]=useState(()=>{const l=navigator.language.toLowerCase();return l.startsWith('ur')?'ur':l.startsWith('ar')?'ar':'en'}),[interests,setInterests]=useState<string[]>([]),[emailConsent,setEmailConsent]=useState(false),[whatsappConsent,setWhatsappConsent]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[unsubscribeUrl,setUnsubscribeUrl]=useState('')
 const toggle=(v:string)=>setInterests(old=>old.includes(v)?old.filter(x=>x!==v):[...old,v])
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setNotice('');setUnsubscribeUrl('')
  try{
   const r=await fetch('/api/alerts/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,name,agency,whatsapp,email,city,language,interests,emailConsent,whatsappConsent,source:'homepage_subscription'})})
   const data=await r.json() as any;if(!r.ok)throw new Error(data.error||'Subscription could not be saved')
   setNotice(data.message||'Thank you. Your preferences have been saved.');setUnsubscribeUrl(data.unsubscribeUrl||'');setName('');setAgency('');setWhatsapp('');setEmail('');setCity('');setInterests([]);setEmailConsent(false);setWhatsappConsent(false)
  }catch(err){setNotice(err instanceof Error?err.message:'Please try again.')}finally{setBusy(false)}
 }
 return <section id="smart-travel-alerts" className="mx-auto my-12 max-w-[1120px] px-4 sm:px-6">
  <div className="overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-white via-orange-50 to-amber-50 p-6 shadow-xl shadow-orange-900/5 sm:p-9 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
   <div className="grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
    <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#FF5500]">Trexifly intelligence updates</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Get Smart AI Travel &amp; Partner Alerts</h2><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Choose the travel updates that matter to you. Travelers receive relevant travel alerts; agencies can register interest in Trexifly partnerships.</p><div className="mt-5 flex flex-wrap gap-2">{['Flight opportunities','Hotel updates','Car hire','Umrah & Hajj','Pakistan tours'].map(x=><span key={x} className="rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">{x}</span>)}</div></div>
    <form onSubmit={submit} className="grid gap-4">
     <div className="grid grid-cols-2 gap-2 rounded-xl bg-orange-100 p-1 dark:bg-slate-800">
      <button type="button" onClick={()=>setType('client')} aria-pressed={type==='client'} className={'rounded-lg px-3 py-3 text-sm font-bold '+(type==='client'?'bg-white text-[#C2410C] shadow dark:bg-slate-700 dark:text-orange-300':'text-slate-600 dark:text-slate-300')}>Online Traveler / B2C</button>
      <button type="button" onClick={()=>setType('agent')} aria-pressed={type==='agent'} className={'rounded-lg px-3 py-3 text-sm font-bold '+(type==='agent'?'bg-white text-[#C2410C] shadow dark:bg-slate-700 dark:text-orange-300':'text-slate-600 dark:text-slate-300')}>Travel Agent / B2B</button>
     </div>
     <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{type==='agent'?'Contact Person Name':'Full Name'}<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" maxLength={120} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-950 dark:text-white"/></label>
      {type==='agent'&&<label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">Agency Name<input required value={agency} onChange={e=>setAgency(e.target.value)} maxLength={160} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-950 dark:text-white"/></label>}
      <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">WhatsApp Number (with country code)<input required value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+92 300 1234567" inputMode="tel" className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-950 dark:text-white"/></label>
      <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">Email Address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-950 dark:text-white"/></label>
      <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">City (optional)<input value={city} onChange={e=>setCity(e.target.value)} maxLength={100} placeholder="Lahore, Karachi, Islamabad..." className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-600 dark:bg-slate-950 dark:text-white"/></label>
      <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">Preferred Language<select value={language} onChange={e=>setLanguage(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"><option value="en">English</option><option value="ur">Urdu</option><option value="ar">Arabic</option></select></label>
     </div>
     <fieldset><legend className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-200">Travel interests</legend><div className="flex flex-wrap gap-2">{INTERESTS.map(x=><label key={x} className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"><input type="checkbox" checked={interests.includes(x)} onChange={()=>toggle(x)} className="accent-[#FF5500]"/>{x}</label>)}</div></fieldset>
     <div className="grid gap-2 rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/60">
      <label className="flex items-start gap-2 text-xs leading-5 text-slate-700 dark:text-slate-200"><input type="checkbox" checked={emailConsent} onChange={e=>setEmailConsent(e.target.checked)} className="mt-1 accent-[#FF5500]"/>I agree to receive relevant Trexifly marketing and travel updates by email. I can unsubscribe at any time.</label>
      <label className="flex items-start gap-2 text-xs leading-5 text-slate-700 dark:text-slate-200"><input type="checkbox" checked={whatsappConsent} onChange={e=>setWhatsappConsent(e.target.checked)} className="mt-1 accent-[#FF5500]"/>I agree to receive relevant Trexifly updates on WhatsApp. I can withdraw this consent at any time.</label>
     </div>
     {notice&&<div role="status" className="rounded-xl bg-slate-100 p-3 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100">{notice}{unsubscribeUrl&&<div className="mt-2 break-all text-xs"><a className="underline" href={unsubscribeUrl}>Your unsubscribe link</a></div>}</div>}
     <button disabled={busy||(!emailConsent&&!whatsappConsent)} className="rounded-xl bg-[#FF5500] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#E64A00] disabled:cursor-not-allowed disabled:opacity-50">{busy?'Saving preferences…':'Subscribe to Trexifly Alerts'}</button>
     <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">Your contact details are used only for the communication channels you select. Consent is optional and can be withdrawn.</p>
    </form>
   </div>
  </div>
 </section>
}
