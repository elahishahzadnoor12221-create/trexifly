const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'vehicles');
const reportDir = path.join(root, 'reports');
const UA = 'TrexiflyVehicleAssetCollector/1.0 (Wikimedia Commons; Playwright Chromium)';
const carQueries = [
  'Toyota Yaris','Suzuki Swift','Kia Picanto','Nissan Micra','Hyundai i10','Toyota Corolla','Honda Civic','Toyota Camry','BMW 3 Series','Mercedes-Benz C-Class','Audi A4','Hyundai Elantra','Hyundai Tucson','Toyota Fortuner','Toyota Prado','Toyota Land Cruiser','Range Rover Sport','Nissan X-Trail','Kia Sportage','Mitsubishi Pajero','Mercedes-Benz E-Class','Mercedes-Benz S-Class','Audi A6','Porsche 911','BMW 5 Series','Hyundai Staria','Kia Carnival','Toyota HiAce','Toyota Innova','Honda Odyssey'
];
const transferQueries = [
  'Toyota Camry airport sedan','Mercedes-Benz E-Class business sedan','Toyota Sienna minivan','Lexus RX executive SUV','Mercedes-Benz Sprinter minibus','Toyota HiAce passenger van','Lexus ES premium sedan','Mercedes-Benz S-Class chauffeur sedan','Kia Carnival family MPV','Toyota Land Cruiser 4x4','Mercedes-Benz Sprinter Tourer','Nissan NV200 passenger van','Honda Accord comfort sedan','BMW 7 Series VIP sedan','Hyundai Staria MPV','Range Rover luxury SUV','Ford Transit minibus','Volkswagen Caravelle shuttle','Toyota Crown airport sedan','Mercedes-Benz Sprinter long wheelbase'
];
function jpegSize(b) {
  if (b.length < 4 || b[0] !== 255 || b[1] !== 216) return null;
  let i=2;
  while(i<b.length-9) {
    if(b[i]!==255){i++;continue;}
    const marker=b[i+1], len=b.readUInt16BE(i+2);
    if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) return {width:b.readUInt16BE(i+7),height:b.readUInt16BE(i+5)};
    if(len<2) break; i+=2+len;
  }
  return null;
}
function commonsThumb(murl) {
  try {
    const u=new URL(murl);
    if(u.hostname!=='upload.wikimedia.org') return '';
    const parts=u.pathname.split('/').filter(Boolean);
    if(parts.length<5 || parts[0]!=='wikipedia' || parts[1]!=='commons') return '';
    if(parts[2]==='thumb') {
      const filename=parts[parts.length-2];
      const wanted='960px-'+filename;
      const base=parts.slice(0,-1).join('/');
      return 'https://thumb.wikimedia.org/'+base+'/'+wanted;
    }
    const rel=parts.slice(2,-1).join('/');
    const filename=parts[parts.length-1];
    return 'https://thumb.wikimedia.org/wikipedia/commons/thumb/'+rel+'/'+filename+'/960px-'+filename;
  } catch { return ''; }
}
function fileTitle(m) {
  const t=(m.t||'').replace(/\s+-\s+Wikimedia Commons.*$/i,'').trim();
  if(/^File:/i.test(t)) return t.replace(/^File:/i,'').trim();
  try { return decodeURIComponent(new URL(m.murl).pathname.split('/').pop()); } catch { return 'Vehicle photograph'; }
}
async function searchCommons(page, query) {
  const url='https://www.bing.com/images/search?q='+encodeURIComponent(query+' site:commons.wikimedia.org');
  try { await page.goto(url,{waitUntil:'commit',timeout:15000}); } catch {}
  await page.waitForSelector('a.iusc',{timeout:9000}).catch(()=>{});
  return await page.locator('a.iusc').evaluateAll(els=>els.slice(0,25).map(e=>{
    try{return JSON.parse(e.getAttribute('m')||'{}')}catch{return {}}
  }).filter(m=>m.murl&&m.murl.includes('upload.wikimedia.org/wikipedia/commons/')&&m.purl&&m.purl.includes('commons.wikimedia.org')));
}
async function main(){
  fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(reportDir,{recursive:true});
  const manifestPath=path.join(reportDir,'mission3_vehicle_image_sources.json');
  let manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):[];
  const seen=new Set();
  for(const item of manifest){const p=path.join(outDir,item.file);if(fs.existsSync(p))seen.add(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'));}
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({userAgent:UA,viewport:{width:1440,height:900}});
  const page=await context.newPage();
  const jobs=[...carQueries.map((query,index)=>({kind:'car',index,query})),...transferQueries.map((query,index)=>({kind:'transfer',index,query}))];
  try{
    for(const job of jobs){
      const prefix=job.kind==='car'?'car':'transfer';
      const filename=prefix+'-'+String(job.index+1).padStart(2,'0')+'.jpg';
      const target=path.join(outDir,filename);
      if(fs.existsSync(target)){console.log('PRESERVED '+filename);continue;}
      let saved=false;
      for(const q of [job.query,job.query+' vehicle front side photo']){
        const candidates=await searchCommons(page,q);
        for(const m of candidates){
          const thumb=commonsThumb(m.murl);if(!thumb)continue;
          try{
            const response=await context.request.get(thumb,{timeout:18000,headers:{'User-Agent':UA,'Referer':'https://commons.wikimedia.org/'}});
            if(!response.ok())continue;
            if(!(response.headers()['content-type']||'').toLowerCase().includes('image/jpeg'))continue;
            const bytes=await response.body();if(bytes.length<30000)continue;
            const dim=jpegSize(bytes);if(!dim||dim.width<700||dim.height<350)continue;
            const hash=crypto.createHash('sha256').update(bytes).digest('hex');if(seen.has(hash))continue;
            const title=fileTitle(m);
            const pageUrl=m.purl.startsWith('https://commons.wikimedia.org/wiki/File:')?m.purl:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(title.replace(/ /g,'_'));
            fs.writeFileSync(target,bytes);seen.add(hash);
            manifest.push({file:filename,kind:job.kind,index:job.index+1,requestedModelOrClass:job.query,sourceFile:title,sourceUrl:thumb,sourcePage:pageUrl,sourcePlatform:'Wikimedia Commons',contentType:'image/jpeg',bytes:bytes.length,width:dim.width,height:dim.height,sha256:hash,licenseNote:'Check linked Commons file page for the exact free license/public-domain status and attribution requirements.'});
            console.log('SAVED '+filename+' '+dim.width+'x'+dim.height+' '+title);saved=true;break;
          }catch(e){console.log('CANDIDATE_ERROR '+filename+' '+e.message);}
        }
        if(saved)break;
      }
      if(!saved)console.log('MISSING '+filename+' '+job.query);
    }
  }finally{await browser.close();}
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
  const credits=['# Vehicle image credits','','All images are Wikimedia Commons JPEGs. Open each source file page to confirm the author, specific license/public-domain status, and attribution requirements.','',...manifest.map(x=>'- '+x.file+' — '+x.requestedModelOrClass+' — ['+x.sourceFile+']('+x.sourcePage+') — '+x.width+'×'+x.height+' px')];
  fs.writeFileSync(path.join(outDir,'IMAGE-CREDITS.md'),credits.join('\n')+'\n');
  console.log('SUMMARY total='+manifest.length+' unique='+seen.size+' missing='+(50-manifest.length));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
