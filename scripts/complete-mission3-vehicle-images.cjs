const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root=path.resolve(__dirname,'..'), out=path.join(root,'public','vehicles'), reports=path.join(root,'reports');
const manifestPath=path.join(reports,'mission3_vehicle_image_sources.json');
const UA='TrexiflyVehicleAssetCollector/1.0 (Wikimedia Commons; Chromium)';
const cars=['Toyota Yaris','Suzuki Swift','Kia Picanto','Nissan Micra','Hyundai i10','Toyota Corolla','Honda Civic','Toyota Camry','BMW 3 Series','Mercedes-Benz C-Class','Audi A4','Hyundai Elantra','Hyundai Tucson','Toyota Fortuner','Toyota Prado','Toyota Land Cruiser','Range Rover Sport','Nissan X-Trail','Kia Sportage','Mitsubishi Pajero','Mercedes-Benz E-Class','Mercedes-Benz S-Class','Audi A6','Porsche 911','BMW 5 Series','Hyundai Staria','Kia Carnival','Toyota HiAce','Toyota Innova','Honda Odyssey'];
const transfers=['Toyota Camry airport sedan','Mercedes-Benz E-Class business sedan','Toyota Sienna minivan','Lexus RX executive SUV','Mercedes-Benz Sprinter minibus','Toyota HiAce passenger van','Lexus ES premium sedan','Mercedes-Benz S-Class chauffeur sedan','Kia Carnival family MPV','Toyota Land Cruiser 4x4','Mercedes-Benz Sprinter Tourer','Nissan NV200 passenger van','Honda Accord comfort sedan','BMW 7 Series VIP sedan','Hyundai Staria MPV','Range Rover luxury SUV','Ford Transit minibus','Volkswagen Caravelle shuttle','Toyota Crown airport sedan','Mercedes-Benz Sprinter long wheelbase'];
function jpegSize(b){if(b[0]!==255||b[1]!==216)return null;let i=2;while(i<b.length-9){if(b[i]!==255){i++;continue;}const m=b[i+1],n=b.readUInt16BE(i+2);if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(m))return{width:b.readUInt16BE(i+7),height:b.readUInt16BE(i+5)};if(n<2)break;i+=2+n;}return null;}
function thumbUrl(murl){try{const u=new URL(murl);if(u.hostname!=='upload.wikimedia.org')return '';const p=u.pathname.split('/').filter(Boolean);if(p.length<5||p[0]!=='wikipedia'||p[1]!=='commons')return '';if(p[2]==='thumb'){const file=p[p.length-2],base=p.slice(0,-1).join('/');return 'https://thumb.wikimedia.org/'+base+'/960px-'+file;}const rel=p.slice(2,-1).join('/'),file=p[p.length-1];return 'https://thumb.wikimedia.org/wikipedia/commons/thumb/'+rel+'/'+file+'/960px-'+file;}catch{return '';}}
function titleOf(m){const t=(m.t||'').replace(/\s+-\s+Wikimedia Commons.*$/i,'').trim();if(/^File:/i.test(t))return t.slice(5).trim();try{return decodeURIComponent(new URL(m.murl).pathname.split('/').pop());}catch{return 'Vehicle photo';}}
async function search(page,q){const url='https://www.bing.com/images/search?q='+encodeURIComponent(q+' site:commons.wikimedia.org');try{await page.goto(url,{waitUntil:'commit',timeout:12000});}catch{}await page.waitForSelector('a.iusc',{timeout:6000}).catch(()=>{});return page.locator('a.iusc').evaluateAll(es=>es.slice(0,30).map(e=>{try{return JSON.parse(e.getAttribute('m')||'{}')}catch{return {}}}).filter(m=>m.murl&&m.murl.includes('upload.wikimedia.org/wikipedia/commons/')&&m.purl&&m.purl.includes('commons.wikimedia.org')));}
async function main(){
 fs.mkdirSync(out,{recursive:true});fs.mkdirSync(reports,{recursive:true});
 let manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):[];
 const recorded=new Set(manifest.map(x=>x.file)), seen=new Set(manifest.map(x=>x.sha256));
 const browser=await chromium.launch({headless:true}), context=await browser.newContext({userAgent:UA,viewport:{width:1440,height:900}}),page=await context.newPage();
 const jobs=[...cars.map((query,index)=>({kind:'car',index,query})),...transfers.map((query,index)=>({kind:'transfer',index,query}))];
 try{
  for(const job of jobs){
   const file=(job.kind==='car'?'car-':'transfer-')+String(job.index+1).padStart(2,'0')+'.jpg';
   if(recorded.has(file)){console.log('RECORDED '+file);continue;}
   let saved=false;
   for(const q of [job.query,job.query+' vehicle photo']){
    const candidates=await search(page,q);
    for(const m of candidates){
     const url=thumbUrl(m.murl);if(!url)continue;
     try{
      const r=await context.request.get(url,{timeout:16000,headers:{'User-Agent':UA,'Referer':'https://commons.wikimedia.org/'}});
      if(!r.ok()||!(r.headers()['content-type']||'').toLowerCase().includes('image/jpeg'))continue;
      const b=await r.body(),dim=jpegSize(b);if(b.length<30000||!dim||dim.width<700||dim.height<350)continue;
      const hash=crypto.createHash('sha256').update(b).digest('hex');if(seen.has(hash))continue;
      const title=titleOf(m),sourcePage=m.purl.startsWith('https://commons.wikimedia.org/wiki/File:')?m.purl:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(title.replace(/ /g,'_'));
      fs.writeFileSync(path.join(out,file),b);
      const record={file,kind:job.kind,index:job.index+1,requestedModelOrClass:job.query,sourceFile:title,sourceUrl:url,sourcePage,sourcePlatform:'Wikimedia Commons',contentType:'image/jpeg',bytes:b.length,width:dim.width,height:dim.height,sha256:hash,licenseNote:'Check linked Commons file page for exact free license/public-domain status and attribution requirements.'};
      manifest.push(record);recorded.add(file);seen.add(hash);fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
      console.log('SAVED '+file+' '+dim.width+'x'+dim.height+' '+title);saved=true;break;
     }catch(e){console.log('TRY '+file+' '+e.message);}
    }
    if(saved)break;
   }
   if(!saved)console.log('MISSING '+file+' '+job.query);
  }
 }finally{await browser.close();}
 const credits=['# Vehicle image credits','','Images are Wikimedia Commons JPEGs. Each source page identifies the author, exact license/public-domain status, and required attribution.','',...manifest.map(x=>'- '+x.file+' — '+x.requestedModelOrClass+' — ['+x.sourceFile+']('+x.sourcePage+') — '+x.width+'×'+x.height+' px')];
 fs.writeFileSync(path.join(out,'IMAGE-CREDITS.md'),credits.join('\n')+'\n');
 console.log('SUMMARY total='+manifest.length+' unique='+seen.size+' missing='+(50-manifest.length));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
