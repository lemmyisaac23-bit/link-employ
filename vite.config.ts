import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Known client routes — copy index.html so GitHub Pages returns 200 (not 404). */
const SPA_ROUTES = [
  'signup',
  'signin',
  'admin',
  'jobs',
  'jobs/positions',
  'jobs/applications',
  'jobs/team',
  'jobs/about',
  'jobs/account',
  'jobs/help',
]

function spaRouteHtml(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-route-html',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    async writeBundle() {
      const indexPath = path.join(outDir, 'index.html')
      for (let attempt = 0; attempt < 40; attempt++) {
        if (fs.existsSync(indexPath)) break
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      if (!fs.existsSync(indexPath)) {
        throw new Error(`spa-route-html: missing ${indexPath}`)
      }
      const html = fs.readFileSync(indexPath, 'utf8')
      for (const route of SPA_ROUTES) {
        const dir = path.join(outDir, route)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), html)
      }
    },
  }
}

// Custom domain: https://worklinkus.com
export default defineConfig({
  plugins: [react(), spaRouteHtml()],
  base: '/',
})
