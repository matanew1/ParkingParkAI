// Service Worker for ParkingParkAI Notifications
// Kept minimal — no fetch interception so it can never cache a broken HTML
// response for a JS/CSS asset and lock users into a white screen.

const SW_VERSION = 'parking-notifications-v2';

self.addEventListener('install', (event) => {
  // Activate this SW as soon as it finishes installing.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Wipe any caches left over from the old v1 SW that cached everything.
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

// Handle notification click — focus the app or open it.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const spotId = event.notification.tag;
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus();
          if (spotId && 'postMessage' in client) {
            client.postMessage({ type: 'navigate-to-spot', spotId });
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(spotId ? `/?spot=${spotId}` : '/');
      }
    })()
  );
});

// Handle push notifications (for future implementation).
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/me.png',
      badge: '/me.png',
      tag: data.spotId,
      requireInteraction: data.priority === 'high',
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (e) {
    // ignore malformed push payloads
  }
});
