const CACHE_NAME = 'kraamweek-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon.svg',
  '/_next/static/css/',
  '/_next/static/js/',
];

const DYNAMIC_CACHE = 'kraamweek-dynamic-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS.filter(url => !url.includes('/_next/')));
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }

        // Clone the request for caching
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if response is valid
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          // Cache dynamic content
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              // Only cache specific types of requests
              if (event.request.url.includes('/_next/') || 
                  event.request.url.includes('/api/') ||
                  event.request.url.endsWith('.js') ||
                  event.request.url.endsWith('.css') ||
                  event.request.url.endsWith('.json')) {
                console.log('Service Worker: Caching dynamic content', event.request.url);
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch((error) => {
          console.log('Service Worker: Fetch failed, serving offline fallback', error);
          
          // Return a simple offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return new Response(`
              <!DOCTYPE html>
              <html lang="nl">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - Kraamweek App</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background-color: #f3f4f6;
                    color: #374151;
                  }
                  .container {
                    max-width: 400px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  }
                  .icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                  }
                  h1 { color: #4f46e5; margin-bottom: 10px; }
                  p { margin-bottom: 20px; line-height: 1.5; }
                  button {
                    background-color: #4f46e5;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                  }
                  button:hover {
                    background-color: #3730a3;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="icon">📱</div>
                  <h1>Offline</h1>
                  <p>Je bent momenteel offline. De Kraamweek app werkt het beste met een internetverbinding.</p>
                  <p>Controleer je internetverbinding en probeer opnieuw.</p>
                  <button onclick="window.location.reload()">Opnieuw proberen</button>
                </div>
              </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' }
            });
          }
          
          throw error;
        });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Here you could sync any offline data
      console.log('Service Worker: Performing background sync')
    );
  }
});

// Push notification support with enhanced handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    console.log('Service Worker: Failed to parse push data', error);
  }
  
  const defaultOptions = {
    body: 'Nieuwe melding van Kraamweek App',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: Math.random().toString(36).substr(2, 9),
      ...notificationData.data
    },
    actions: [
      {
        action: 'explore',
        title: 'Bekijk app',
        icon: '/icons/icon-96x96.svg'
      },
      {
        action: 'close',
        title: 'Sluiten'
      }
    ]
  };

  const options = {
    ...defaultOptions,
    ...notificationData,
    data: {
      ...defaultOptions.data,
      ...notificationData.data
    }
  };

  // Add category-specific actions
  if (notificationData.category) {
    switch (notificationData.category) {
      case 'feedingReminders':
        options.actions = [
          { action: 'log_feeding', title: 'Voeding registreren', icon: '/icons/icon-96x96.svg' },
          { action: 'snooze_feeding', title: 'Uitstellen (30 min)', icon: '/icons/icon-96x96.svg' },
          { action: 'close', title: 'Sluiten' }
        ];
        break;
      case 'healthAlerts':
        options.actions = [
          { action: 'view_alert', title: 'Bekijk details', icon: '/icons/icon-96x96.svg' },
          { action: 'acknowledge', title: 'Bevestigen', icon: '/icons/icon-96x96.svg' },
          { action: 'close', title: 'Sluiten' }
        ];
        break;
      case 'taskReminders':
        options.actions = [
          { action: 'complete_task', title: 'Markeer als voltooid', icon: '/icons/icon-96x96.svg' },
          { action: 'snooze_task', title: 'Uitstellen (1 uur)', icon: '/icons/icon-96x96.svg' },
          { action: 'close', title: 'Sluiten' }
        ];
        break;
      case 'emergencyAlerts':
        options.actions = [
          { action: 'view_emergency', title: 'Bekijk details', icon: '/icons/icon-96x96.svg' },
          { action: 'call_help', title: 'Bel hulp', icon: '/icons/icon-96x96.svg' },
          { action: 'close', title: 'Sluiten' }
        ];
        options.requireInteraction = true;
        break;
    }
  }

  event.waitUntil(
    self.registration.showNotification('Kraamweek App', options)
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received', event.action);
  
  event.notification.close();

  const notificationData = event.notification.data || {};
  
  // Handle different actions
  switch (event.action) {
    case 'explore':
    case 'view_alert':
    case 'view_emergency':
      event.waitUntil(
        clients.openWindow('/')
      );
      break;
      
    case 'log_feeding':
      event.waitUntil(
        clients.openWindow('/?action=log_feeding')
      );
      break;
      
    case 'complete_task':
      if (notificationData.taskId) {
        event.waitUntil(
          clients.openWindow(`/?action=complete_task&taskId=${notificationData.taskId}`)
        );
      }
      break;
      
    case 'snooze_feeding':
      // Handle snooze logic - could store in IndexedDB or send message to clients
      console.log('Service Worker: Snoozing feeding reminder for 30 minutes');
      break;
      
    case 'snooze_task':
      // Handle task snooze
      console.log('Service Worker: Snoozing task reminder for 1 hour');
      break;
      
    case 'acknowledge':
      // Handle alert acknowledgment
      console.log('Service Worker: Acknowledging alert');
      break;
      
    case 'call_help':
      // Handle emergency call - could open tel: link
      console.log('Service Worker: Emergency call requested');
      break;
      
    case 'close':
    default:
      // Just close the notification - no action needed
      break;
  }
  
  // Send message to open clients about the action
  event.waitUntil(
    clients.matchAll().then(clientsList => {
      clientsList.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_ACTION',
          action: event.action,
          data: notificationData
        });
      });
    })
  );
});