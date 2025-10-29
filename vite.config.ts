import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), cloudflare(), ssrPlugin()]
})