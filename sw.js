importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
importScripts('firebase-config.js');

firebase.initializeApp(self.GHOST.firebase);
const messaging = firebase.messaging();

// A buzz arrives while the app is closed: show it with a short heartbeat vibration.
messaging.onBackgroundMessage(p => {
  const d = p.data || {};
  return self.registration.showNotification(d.title || 'Thinking of you', {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [80, 60, 140],
    tag: 'thought',
    renotify: true
  });
});

// Keeps the app opening quickly and offline-friendly.
const C = 'ghost-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './firebase-config.js', './icon-192.png', './icon-512.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
