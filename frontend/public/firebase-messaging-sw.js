// Dhanvikk Blooms - Firebase Cloud Messaging Service Worker
// Handles background web push notifications when tab is not active

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Initialize Firebase App within Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyC1hipp0dBNuKNRcT11fb-yj9KHZjFAQdE",
  authDomain: "auth-checker-1-main.firebaseapp.com",
  projectId: "auth-checker-1-main",
  storageBucket: "auth-checker-1-main.firebasestorage.app",
  messagingSenderId: "160660053649",
  appId: "1:160660053649:web:3133a668cc3085163e6930",
  measurementId: "G-0Q9KCWM5N5"
});

const messaging = firebase.messaging();

// Handle background notification reception
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const title = payload.notification?.title || payload.data?.title || 'Dhanvikk Blooms Notice';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'You have an update regarding your floral arrangement order.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    image: payload.notification?.image || payload.data?.image || undefined,
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/',
      ...payload.data
    },
    actions: [
      { action: 'open', title: 'View Order' }
    ]
  };

  self.registration.showNotification(title, options);
});

// Handle notification click to navigate to destination URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
