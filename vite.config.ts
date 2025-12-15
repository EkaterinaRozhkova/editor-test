import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat math-field as a custom element
          isCustomElement: (tag) => tag === 'math-field'
        }
      }
    }),
    vueDevTools(),
    svgLoader(),
  ],
  server: {
    proxy: {
      '/upload/': {
        target: process.env.NUXT_ENV_API_URL_S3,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
