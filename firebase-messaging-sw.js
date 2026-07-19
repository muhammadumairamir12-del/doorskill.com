// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Updated Firebase config for Food New York
const firebaseConfig = {
  apiKey: "AIzaSyDkOlJ-9fID5ZueTkwY8Qxv8GUFzNkkDAQ",
  authDomain: "food-new-york.firebaseapp.com",
  projectId: "food-new-york",
  storageBucket: "food-new-york.firebasestorage.app",
  messagingSenderId: "657168364944",
  appId: "1:657168364944:web:b03313fbe8ced9a4d3af15",
  measurementId: "G-LEPZHDYYPD"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Use the restaurant logo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const click_action = event.notification.data ? event.notification.data.FCM_MSG.notification.click_action : null;
  if (click_action) {
    event.waitUntil(
      clients.openWindow(click_action)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});