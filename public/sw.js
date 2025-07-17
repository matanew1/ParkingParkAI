// Service Worker for ParkingParkAI Notifications

const CACHE_NAME = 'parking-notifications-v1';
const urlsToCache = [
  '/',
  '/me.png',
  '/me.svg',
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const spotId = event.notification.tag;

  if (action === 'view' || !action) {
    // Open the app and navigate to the parking spot
    event.waitUntil(
      clients.openWindow(`/?spot=${spotId}`)
    );
  }
});

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/me.png',
      badge: '/me.png',
      tag: data.spotId,
      requireInteraction: data.priority === 'high',
      actions: [
        {
          action: 'view',
          title: 'View Parking Spot',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'parking-status-sync') {
    event.waitUntil(syncParkingStatus());
  }
});

async function syncParkingStatus() {
  // This would sync parking status when coming back online
  try {
    // Implementation would go here for background sync
    console.log('Background sync: Checking parking status updates');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
