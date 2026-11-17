import { Hono } from 'hono'

// The Worker in front of Trexifly. Market data is generated in the app for now;
// this route is the place to add a live metasearch proxy or affiliate redirect
// (e.g. `/api/go/:provider` issuing a tracked 302) without touching the UI.
type Env = { ASSETS: Fetcher }

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ ok: true, service: 'trexifly' }))

app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404))

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
