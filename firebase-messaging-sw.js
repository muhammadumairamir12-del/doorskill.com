// DoorSkill Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase App in service worker context
firebase.initializeApp({
  apiKey:            "AIzaSyDLPAfokHz2ZHdRh8ppAEsdWHCkeloI1g0",
  authDomain:        "doorskill-beff1.firebaseapp.com",
  databaseURL:       "https://doorskill-beff1-default-rtdb.firebaseio.com",
  projectId:         "doorskill-beff1",
  storageBucket:     "doorskill-beff1.firebasestorage.app",
  messagingSenderId: "620272735898",
  appId:             "1:620272735898:web:b35d24737ef79c01a67123"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message payload:', payload);

  const title = payload.notification?.title || payload.data?.title || 'DoorSkill Update';
  const body = payload.notification?.body || payload.data?.body || 'You have a new message.';
  const clickUrl = payload.data?.clickUrl || '/';
  
  // Customise notification options
  const options = {
    body: body,
    icon: '/assets/logo.png',
    badge: '/assets/logo.png', // Badge icon shown on mobile device status bars
    tag: 'doorskill-notification',
    renotify: true,
    data: {
      clickUrl: clickUrl
    }
  };

  self.registration.showNotification(title, options);
});

// Handle notification click (redirects to the target page)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Grab relative or absolute URL to redirect to
  let targetUrl = event.notification.data?.clickUrl || '/';
  
  // Resolve relative URLs to absolute URLs
  if (targetUrl.startsWith('.')) {
    targetUrl = new URL(targetUrl, self.location.origin).href;
  } else if (targetUrl.startsWith('/')) {
    targetUrl = self.location.origin + targetUrl;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus if an open window already has the same target
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open a new tab/window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
