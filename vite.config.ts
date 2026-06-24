import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// O backend RoadControl expõe /v1/* em http://localhost:5254 e https://localhost:7131.
// Em dev usamos proxy para evitar CORS (o backend está com AllowedOrigins vazio).
//
// Apontamos direto para o HTTPS (7131): o backend faz UseHttpsRedirection, e um
// redirect http->https faz o navegador descartar o header Authorization, quebrando
// as requisições autenticadas (/auth/me e afins). `secure: false` aceita o
// certificado self-signed de desenvolvimento.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/v1': {
        target: 'https://localhost:7131',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
