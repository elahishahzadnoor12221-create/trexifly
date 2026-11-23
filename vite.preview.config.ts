import { defineConfig } from 'vite'

// Cloudflare's production build writes the browser bundle to dist/client.
// Keep the Playwright preview server aligned with that exact output directory.
export default defineConfig({
  build: { outDir: 'dist/client' },
})
