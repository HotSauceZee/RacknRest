import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
)
const buildStamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
const appVersion = `${packageJson.version}+${buildStamp}`
const builtAt = new Date().toISOString()

const versionManifestPlugin = {
  name: 'version-manifest',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify(
        {
          version: appVersion,
          builtAt,
        },
        null,
        2
      ),
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionManifestPlugin],
  base: '/RacknRest/',
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
})
