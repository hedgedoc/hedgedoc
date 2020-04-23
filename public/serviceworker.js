self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('static-files').then(cache => {
      return cache.addAll([
        // cache static assets
        'build/font-pack.css',
        'build/index-styles-pack.css',
        'build/index-styles.css',
        'build/index.css',
        'build/cover-styles-pack.css',
        'build/cover.css',
        'favicon.png',
        // cache mathjax static files
        'js/mathjax-config-extra.js',
        'build/MathJax/MathJax.js',
        'build/MathJax/config/TeX-AMS-MML_HTMLorMML.js',
        'build/MathJax/config/Safe.js'
      ])
    })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})
