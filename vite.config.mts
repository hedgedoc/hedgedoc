import { defineConfig } from 'vite'
import { resolve } from 'path'

// Vite is used here purely as an asset bundler. Express + EJS still render HTML.
// We mirror the old webpack entries so EJS templates can load the built assets
// via the Vite manifest.

export default defineConfig({
  root: resolve(__dirname, 'public'),
  base: '/build/',
  build: {
    outDir: resolve(__dirname, 'public/build'),
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'public/js/index.js'),
        cover: resolve(__dirname, 'public/js/cover.js'),
        pretty: resolve(__dirname, 'public/js/pretty.js'),
        slide: resolve(__dirname, 'public/js/slide.js'),
        htmlExport: resolve(__dirname, 'public/js/htmlExport.js'),
        // CSS entry points
        'css-index': resolve(__dirname, 'public/css/index.css'),
        'css-extra': resolve(__dirname, 'public/css/extra.css'),
        'css-site': resolve(__dirname, 'public/css/site.css'),
        'css-slide-preview': resolve(__dirname, 'public/css/slide-preview.css'),
        'css-cover': resolve(__dirname, 'public/css/cover.css'),
        'css-font': resolve(__dirname, 'public/css/font.css'),
        'css-markdown': resolve(__dirname, 'public/css/markdown.css'),
        'css-github-extract': resolve(__dirname, 'public/css/github-extract.css'),
        'css-toolbar': resolve(__dirname, 'public/css/ui/toolbar.css'),
      },
      output: {
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js'
      }
    }
  }
})
