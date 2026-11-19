const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'vehicles');
const reportDir = path.join(root, 'reports');
const UA = 'TrexiflyVehicleAssetCollector/1.0 (Wikimedia Commons image retrieval; browser-based)';
const carQueries = [
  'Toyota Yaris','Suzuki Swift','Kia Picanto','Nissan Micra','Hyundai i10',
  'Toyota Corolla','Honda Civic','Toyota Camry','BMW 3 Series','Mercedes-Benz C-Class',
  'Audi A4','Hyundai Elantra','Hyundai Tucson','Toyota Fortuner','Toyota Prado',
  'Toyota Land Cruiser','Range Rover Sport','Nissan X-Trail','Kia Sportage','Mitsubishi Pajero',
  'Mercedes-Benz E-Class','Mercedes-Benz S-Class','Audi A6','Porsche 911','BMW 5 Series',
  'Hyundai Staria','Kia Carnival','Toyota HiAce','Toyota Innova','Honda Odyssey'
];
const transferQueries = [
  'Toyota Camry airport sedan','Mercedes-Benz E-Class business sedan','Toyota Sienna minivan',
  'Lexus RX executive SUV','Mercedes-Benz Sprinter minibus','Toyota HiAce passenger van',
  'Lexus ES premium sedan','Mercedes-Benz S-Class chauffeur sedan','Kia Carnival family MPV',
  'Toyota Land Cruiser 4x4','Mercedes-Benz Sprinter Tourer','Nissan NV200 passenger van',
  'Honda Accord comfort sedan','BMW 7 Series VIP sedan','Hyundai Staria MPV',
  'Range Rover luxury SUV','Ford Transit minibus','Volkswagen Caravelle shuttle',
  'Toyota Crown airport sedan','Mercedes-Benz Sprinter long wheelbase'
];

function decodeBraveSource(proxyUrl) {
  const marker = '/g:ce/';
  const at = proxyUrl.indexOf(marker);
  if (at < 0) return '';
  const encoded = proxyUrl.slice(at + marker.length).replace(/\//g, '');
  try { return Buffer.from(encoded, 'base64').toString('utf8'); } catch { return ''; }
}
function as960Thumb(source) {
  try {
    const u = new URL(source);
    if (u.hostname === 'thumb.wikimedia.org') return source;
    if (u.hostname !== 'upload.wikimedia.org') return '';
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 5 || parts[0] !== 'wikipedia' || parts[1] !== 'commons') return '';
    const rel = parts.slice(2, -1).join('/');
    const file = decodeURIComponent(parts[parts.length - 1]);
    return 'https://thumb.wikimedia.org/wikipedia/commons/thumb/' + rel + '/' + encodeURIComponent(file).replace(/%2F/gi, '/') + '/960px-' + encodeURIComponent(file);
  } catch { return ''; }
}
function jpegSize(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    }
    if (len < 2) break;
    i += 2 + len;
  }
  return null;
}
function sourceFileName(source, alt) {
  if (alt && /^File:/i.test(alt)) return alt.replace(/^File:/i, '').trim();
  try {
    const u = new URL(source);
    const parts = u.pathname.split('/').filter(Boolean);
    const last = decodeURIComponent(parts[parts.length - 1] || '');
    if (/^\d+px-/.test(last) && parts.length > 1) return decodeURIComponent(parts[parts.length - 2]);
    return last.replace(/^\d+px-/, '');
  } catch { return 'Wikimedia Commons image'; }
}
async function findImages(page, query) {
  const searchUrl = 'https://search.brave.com/images?q=' + encodeURIComponent(query + ' Wikimedia Commons');
  try { await page.goto(searchUrl, { waitUntil: 'commit', timeout: 15000 }); } catch {}
  await page.waitForTimeout(650);
  return await page.locator('img').evaluateAll((els) => els.map((e) => ({
    url: e.currentSrc || e.src || '',
    alt: e.alt || ''
  })).filter((x) => x.url.startsWith('https://imgs.search.brave.com/') && x.url.includes('/g:ce/')));
}
async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(reportDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const seen = new Set();
  const manifest = [];
  const jobs = [
    ...carQueries.map((query, index) => ({ kind: 'car', index, query })),
    ...transferQueries.map((query, index) => ({ kind: 'transfer', index, query }))
  ];
  try {
    for (const job of jobs) {
      const prefix = job.kind === 'car' ? 'car' : 'transfer';
      const target = path.join(outDir, prefix + '-' + String(job.index + 1).padStart(2, '0') + '.jpg');
      const queries = [job.query, job.query + ' front side vehicle photo'];
      let saved = false;
      for (const q of queries) {
        const candidates = await findImages(page, q);
        for (const candidate of candidates) {
          const decoded = decodeBraveSource(candidate.url);
          if (!decoded) continue;
          let parsed;
          try { parsed = new URL(decoded); } catch { continue; }
          if (!['thumb.wikimedia.org','upload.wikimedia.org'].includes(parsed.hostname)) continue;
          if (!/\.(jpe?g)(?:$|[?#])/i.test(parsed.pathname)) continue;
          const imageUrl = as960Thumb(decoded);
          if (!imageUrl) continue;
          try {
            const response = await context.request.get(imageUrl, {
              timeout: 18000,
              headers: { 'User-Agent': UA, 'Referer': 'https://commons.wikimedia.org/' }
            });
            if (!response.ok()) continue;
            const type = (response.headers()['content-type'] || '').toLowerCase();
            if (!type.includes('image/jpeg')) continue;
            const bytes = await response.body();
            if (bytes.length < 30000) continue;
            const dimensions = jpegSize(bytes);
            if (!dimensions || dimensions.width < 700 || dimensions.height < 350) continue;
            const hash = crypto.createHash('sha256').update(bytes).digest('hex');
            if (seen.has(hash)) continue;
            const fileName = sourceFileName(decoded, candidate.alt);
            const licensePage = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(fileName.replace(/ /g, '_'));
            fs.writeFileSync(target, bytes);
            seen.add(hash);
            manifest.push({
              file: path.basename(target), kind: job.kind, index: job.index + 1,
              requestedModelOrClass: job.query, sourceFile: fileName, sourceUrl: imageUrl,
              sourcePage: licensePage, sourcePlatform: 'Wikimedia Commons',
              contentType: type, bytes: bytes.length, width: dimensions.width,
              height: dimensions.height, sha256: hash,
              licenseNote: 'See the linked Wikimedia Commons file page for the specific license and required attribution.'
            });
            console.log('SAVED ' + path.basename(target) + ' ' + dimensions.width + 'x' + dimensions.height + ' ' + fileName);
            saved = true;
            break;
          } catch (e) {
            console.log('CANDIDATE_ERROR ' + job.kind + ' ' + job.index + ' ' + e.message);
          }
        }
        if (saved) break;
      }
      if (!saved) console.log('MISSING ' + prefix + '-' + String(job.index + 1).padStart(2, '0') + ' ' + job.query);
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(reportDir, 'mission3_vehicle_image_sources.json'), JSON.stringify(manifest, null, 2));
  const credits = [
    '# Vehicle image credits',
    '',
    'Vehicle photographs are retrieved from Wikimedia Commons. Each linked file page contains its author, exact license/public-domain status, and attribution requirements.',
    '',
    ...manifest.map((x) => '- ' + x.file + ' — ' + x.requestedModelOrClass + ' — [' + x.sourceFile + '](' + x.sourcePage + ') — ' + x.width + '×' + x.height + ' px')
  ];
  fs.writeFileSync(path.join(outDir, 'IMAGE-CREDITS.md'), credits.join('\n') + '\n');
  console.log('SUMMARY total=' + manifest.length + ' unique=' + seen.size + ' missing=' + (50 - manifest.length));
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
