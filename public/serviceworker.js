self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('static-files').then(cache => {
      return cache.addAll([
        'build/font-pack.css',
        'build/cover-styles-pack.css',
        'build/cover.css',
        'favicon.png'
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
