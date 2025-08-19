import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configure base so assets load correctly on GitHub Pages project site: https://<user>.github.io/progress/
// Output to docs/ so GitHub Pages (Deploy from branch: main / docs) can serve the built site without extra tooling.
export default defineConfig({
  base: '/progress/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
