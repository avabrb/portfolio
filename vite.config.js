import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        easyread: resolve(__dirname, 'easyread.html'),
        fatalattraction: resolve(__dirname, 'fatalattraction.html'),
        chinaai: resolve(__dirname, 'chinaai.html'),
        ccohwebsite: resolve(__dirname, 'ccohwebsite.html'),
        taiwanenergy: resolve(__dirname, 'taiwanenergy.html')
      }
    }
  }
})
