import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temp = path.join(root, '.local-api-test');
const transpile = (sourcePath, outputPath) => {
  const source = fs.readFileSync(path.join(root, sourcePath), 'utf8');
  let js = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
  }).outputText;
  if (sourcePath === 'api/ai-chat.ts') js = js.replace("../src/lib/aiChat", "../src/lib/aiChat.js");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, js, 'utf8');
};
transpile('src/lib/aiChat.ts', path.join(temp, 'src/lib/aiChat.js'));
transpile('api/ai-chat.ts', path.join(temp, 'api/ai-chat.js'));
transpile('api/health.ts', path.join(temp, 'api/health.js'));
const { default: aiHandler } = await import(pathToFileURL(path.join(temp, 'api/ai-chat.js')));
const { default: healthHandler } = await import(pathToFileURL(path.join(temp, 'api/health.js')));
const dist = path.join(root, 'dist/client');
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2', '.json':'application/json; charset=utf-8' };

// Load .env first, .env.local second, and .dev.vars last (highest priority).
// Strip UTF-8 BOM and never print or log secret values.
for (const envFile of ['.env', '.env.local', '.dev.vars']) {
  const envPath = path.join(root, envFile);
  if (!fs.existsSync(envPath)) continue;
  const source = fs.readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || !['OLLAMA_API_KEY', 'OPENROUTER_API_KEY'].includes(match[1])) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '').trim();
    if (value) process.env[match[1]] = value;
  }
}
console.log('[Local API harness env]', {
  envFile: fs.existsSync(path.join(root, '.env')),
  envLocalFile: fs.existsSync(path.join(root, '.env.local')),
  devVarsFile: fs.existsSync(path.join(root, '.dev.vars')),
  ollamaKeyLoaded: Boolean(process.env.OLLAMA_API_KEY?.trim()),
  openRouterKeyLoaded: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
});
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
  const responseAdapter = {
    setHeader: (name, value) => res.setHeader(name, value),
    status(code) { res.statusCode = code; return this; },
    json(body) { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)); return this; }
  };
  if (pathname === '/api/health') return healthHandler({ method: req.method }, responseAdapter);
  if (pathname === '/api/ai-chat') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');
    let body = raw;
    try { body = raw ? JSON.parse(raw) : {}; } catch { body = raw; }
    return aiHandler({ method: req.method, body }, responseAdapter);
  }
  let file = path.join(dist, decodeURIComponent(pathname).replace(/^[/\\]+/, ''));
  if (!file.startsWith(dist)) { res.writeHead(403); return res.end('Forbidden'); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (pathname.startsWith('/assets/')) { res.writeHead(404); return res.end('Not found'); }
    file = path.join(dist, 'index.html');
  }
  res.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
server.listen(4173, '127.0.0.1', () => console.log('Local API/browser harness ready at http://127.0.0.1:4173'));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => { fs.rmSync(temp, { recursive: true, force: true }); process.exit(0); }));