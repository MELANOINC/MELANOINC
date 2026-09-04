import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  plugins: [
    {
      name: 'melano-os-console',
      transformIndexHtml() {
        return [
          {
            tag: 'script',
            attrs: { src: '/melano-os.js', defer: true },
            injectTo: 'body'
          }
        ]
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    minify: 'esbuild'
  },
  server: {
    port: 3000,
    host: true,
    open: false
  },
  preview: {
    port: 4173,
    host: true
  }
})
