/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'scorescroll-cache-v1';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    // For API requests, try network first, then fall back to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a clone of the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response(JSON.stringify({
              error: 'Network request failed and no cached response available'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
  } else {
    // For non-API requests, try cache first, then fall back to network
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache responses that aren't successful
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Cache the response for future use
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          
          return response;
        });
      })
    );
  }
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Custom function to cache a sheet music file
async function cacheSheetMusic(sheetId: string, fileData: string, fileType: string) {
  const cache = await caches.open(CACHE_NAME);
  
  // Create a response with the file data
  const response = new Response(fileData, {
    headers: {
      'Content-Type': fileType === 'pdf' ? 'application/pdf' : 'image/png',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
  
  // Cache the response with a custom URL
  await cache.put(`/sheet-music/${sheetId}`, response);
}

// Listen for requests to cache sheet music
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_SHEET_MUSIC') {
    const { sheetId, fileData, fileType } = event.data;
    cacheSheetMusic(sheetId, fileData, fileType);
  }
});
