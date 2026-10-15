import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Caminhos relativos: a build funciona no GitHub Pages (subpasta do repositório)
  // e também empacotada pelo Capacitor.
  base: './',
})
