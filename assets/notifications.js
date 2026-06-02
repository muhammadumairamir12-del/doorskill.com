// DoorSkill FCM Notification System & Dynamic Bell UI Injection
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage, isSupported } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// Initialize Firebase App checking for pre-existing instances
let app;
try {
  app = getApp();
} catch (e) {
  app = initializeApp({
    apiKey:            "AIzaSyDLPAfokHz2ZHdRh8ppAEsdWHCkeloI1g0",
    authDomain:        "doorskill-beff1.firebaseapp.com",
    databaseURL:       "https://doorskill-beff1-default-rtdb.firebaseio.com",
    projectId:         "doorskill-beff1",
    storageBucket:     "doorskill-beff1.firebasestorage.app",
    messagingSenderId: "620272735898",
    appId:             "1:620272735898:web:b35d24737ef79c01a67123"
  });
}

const auth = getAuth(app);
const db = getFirestore(app);

// Enable Offline Persistence for Background Sync
try {
  enableIndexedDbPersistence(db).catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore offline persistence failed: Multiple tabs open.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore offline persistence unimplemented in this browser.");
    }
  });
} catch(e) {
  console.warn("IndexedDB offline persistence setup warning:", e);
}

// Global Variables
let currentUid = null;
let currentNotifications = [];
let fcmToken = null;
let activeListenerUnsubscribe = null;
let initialLoad = true;

// Optional Local server key (if client-side direct push is desired)
window.FCM_SERVER_KEY = window.FCM_SERVER_KEY || "";

// ── LISTEN FOR AUTHENTICATION STATE ──
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUid = user.uid;
    
    // Request permission, get token and register
    initFcmMessaging(user.uid);
    
    // Start notifications listener
    setupNotificationsListener(user.uid);
    
    // Ensure dashboard specific variables are hooked
    hookDashboardOverrides(user.uid);
  } else {
    currentUid = null;
    if (activeListenerUnsubscribe) {
      activeListenerUnsubscribe();
      activeListenerUnsubscribe = null;
    }
    clearNotificationsUI();
  }
});

// ── REGISTER / REFRESH FCM TOKEN ──
async function initFcmMessaging(uid) {
  const supported = await isSupported();
  if (!supported) {
    console.warn("FCM Messaging is not supported on this browser.");
    return;
  }

  const messaging = getMessaging(app);
  
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered for FCM:', reg.scope);
    } catch(err) {
      console.error('Service Worker registration failed:', err);
    }
  }

  // Attempt to get Token (prompts for permission if default)
  try {
    if (Notification.permission === 'default') {
      // Prompt will happen in auth/login or when they interact
      console.log("FCM Notifications permission is default. Requesting permission...");
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn("Notification permission was denied.");
        return;
      }
    }

    if (Notification.permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BFu8WBoBYwtMM91wy6UJq_x81OYFy1mY0uifASGa1ae94dY0Ask7UnEjAHIECnedraW8JBKOcoP4ggZypbnd1qE'
      });
      if (token) {
        fcmToken = token;
        // Save to Firestore under users/{uid}/fcmToken = token
        await setDoc(doc(db, 'users', uid), {
          fcmToken: token,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log("FCM Token registered and saved to Firestore.");
      }
    }
  } catch(err) {
    console.error("FCM Token retrieval failed:", err);
  }

  // Handle Foreground Messages
  onMessage(messaging, (payload) => {
    console.log("FCM Foreground Message received:", payload);
    // Explicitly show toast as the browser won't show service worker notifications in foreground
    showInAppToast({
      title: payload.notification?.title || payload.data?.title || 'Notification',
      message: payload.notification?.body || payload.data?.body || '',
      icon: '🔔',
      clickUrl: payload.data?.clickUrl || '/'
    });
  });
}

// ── SETUP FIRESTORE REALTIME LISTENER ──
function setupNotificationsListener(uid) {
  if (activeListenerUnsubscribe) {
    activeListenerUnsubscribe();
  }

  initialLoad = true;
  const q = query(
    collection(db, 'notifications', uid, 'items'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  activeListenerUnsubscribe = onSnapshot(q, (snap) => {
    currentNotifications = [];
    snap.forEach((d) => {
      currentNotifications.push({ id: d.id, ...d.data() });
    });

    // Check for new notifications to trigger in-app toast
    snap.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const notif = change.doc.data();
        if (!initialLoad && !notif.read) {
          showInAppToast({ id: change.doc.id, ...notif });
        }
      }
    });

    initialLoad = false;

    // Render Notifications in Bell UI
    updateNotificationsBadgeAndDropdown();
    
    // Update Badge Count on Browser PWA/Tab Title
    updateBrowserTabBadge();
  }, (err) => {
    console.error("Notifications listener error:", err);
  });
}

// ── OVERRIDE DASHBOARD SPECIFIC NOTIFICATION FUNCTIONS ──
function hookDashboardOverrides(uid) {
  // If the dashboard functions exist, override them to use our new subcollection
  if (typeof window.loadNotifications === 'function' || document.getElementById('notifPanel')) {
    window.loadNotifications = async function() {
      // Overridden to let onSnapshot handle real-time sync
    };
    
    // Bind mark all read
    window.markAllRead = async function() {
      try {
        const unread = currentNotifications.filter(n => !n.read);
        const promises = unread.map(n => 
          updateDoc(doc(db, 'notifications', uid, 'items', n.id), { read: true })
        );
        await Promise.all(promises);
        showToastAlert("✅ All notifications marked as read");
      } catch(e) {
        console.error("Mark all read failed:", e);
      }
    };

    // Bind open notification details
    window.openNotif = async function(nid) {
      try {
        await updateDoc(doc(db, 'notifications', uid, 'items', nid), { read: true });
        const target = currentNotifications.find(n => n.id === nid);
        const panel = document.getElementById('notifPanel');
        if (panel) panel.classList.remove('show');
        
        if (target && target.clickUrl) {
          // Adjust relative redirect if needed depending on current location
          window.location.href = target.clickUrl;
        }
      } catch(e) {
        console.error(e);
      }
    };
  }
}

// ── INJECT CUSTOM NAVBAR BELL WIDGET ──
function injectNavbarBell() {
  // If the page already has a dashboard notif-btn or a custom bell already exists, skip
  if (document.querySelector('.notif-btn') || document.getElementById('customNotifBell')) {
    return;
  }

  // Find navbar container
  const navbarRight = document.querySelector('.nav-btns') || document.querySelector('.nav-right') || document.getElementById('navbar');
  if (!navbarRight) return;

  // Insert styles
  const styles = document.createElement('style');
  styles.textContent = `
    .custom-notif-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      margin-right: 16px;
    }
    .custom-notif-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
      color: var(--dark, #1A0A14);
    }
    .custom-notif-btn:hover {
      background: var(--rose-lt, #FFE4EC);
    }
    .custom-notif-count {
      position: absolute;
      top: 2px;
      right: 2px;
      background: var(--rose, #F43F5E);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid #fff;
    }
    .custom-notif-panel {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      width: 330px;
      background: #fff;
      border: 1px solid var(--border, #F3D6E0);
      border-radius: 12px;
      box-shadow: 0 10px 35px rgba(26,10,20,0.12);
      z-index: 1200;
      margin-top: 10px;
      overflow: hidden;
      font-family: 'DM Sans', sans-serif;
    }
    .custom-notif-panel.show {
      display: block;
    }
    .custom-notif-panel-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border, #F3D6E0);
      background: var(--cream, #FFFAF9);
      font-size: 14px;
      font-weight: 700;
      color: var(--dark, #1A0A14);
    }
    .custom-notif-panel-head button {
      background: none;
      border: none;
      color: var(--rose, #F43F5E);
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    .custom-notif-panel-body {
      max-height: 290px;
      overflow-y: auto;
    }
    .custom-notif-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border, #F3D6E0);
      cursor: pointer;
      transition: background 0.15s;
      text-align: left;
    }
    .custom-notif-item:hover {
      background: var(--pink-bg, #FFF0F5);
    }
    .custom-notif-item.unread {
      background: var(--rose-lt, #FFE4EC);
      font-weight: 700;
    }
    .custom-notif-item-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .custom-notif-item-content {
      flex: 1;
      min-width: 0;
    }
    .custom-notif-item-title {
      font-size: 13px;
      color: var(--dark, #1A0A14);
      font-weight: 700;
      margin-bottom: 2px;
    }
    .custom-notif-item-msg {
      font-size: 12px;
      color: var(--mid, #5C3D4E);
      line-height: 1.4;
      margin-bottom: 4px;
    }
    .custom-notif-item-time {
      font-size: 10px;
      color: var(--muted, #9D7589);
    }
    .custom-empty-notifs {
      text-align: center;
      padding: 32px 16px;
      color: var(--muted, #9D7589);
      font-size: 13px;
    }
  `;
  document.head.appendChild(styles);

  // Insert notification bell HTML
  const container = document.createElement('div');
  container.className = 'custom-notif-container';
  container.id = 'customNotifBell';
  container.style.display = 'none'; // Hidden until logged in
  
  container.innerHTML = `
    <button class="custom-notif-btn" id="customNotifBtn">
      🔔
      <span class="custom-notif-count" id="customNotifCount" style="display:none;">0</span>
    </button>
    <div class="custom-notif-panel" id="customNotifPanel">
      <div class="custom-notif-panel-head">
        <strong>🔔 Notifications</strong>
        <button id="customMarkAllReadBtn">Mark all read</button>
      </div>
      <div class="custom-notif-panel-body" id="customNotifPanelBody">
        <div class="custom-empty-notifs">📭 No notifications</div>
      </div>
    </div>
  `;

  // Place it before hamburger if it exists, otherwise prepend inside container
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.parentNode.insertBefore(container, hamburger);
  } else if (navbarRight.children.length > 0) {
    navbarRight.insertBefore(container, navbarRight.firstChild);
  } else {
    navbarRight.appendChild(container);
  }

  // Attach toggle click events
  const notifBtn = document.getElementById('customNotifBtn');
  const notifPanel = document.getElementById('customNotifPanel');
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel.classList.toggle('show');
  });

  // Mark all read button
  const markReadBtn = document.getElementById('customMarkAllReadBtn');
  markReadBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!currentUid) return;
    try {
      const unread = currentNotifications.filter(n => !n.read);
      const promises = unread.map(n => 
        updateDoc(doc(db, 'notifications', currentUid, 'items', n.id), { read: true })
      );
      await Promise.all(promises);
      showToastAlert("✅ Marked all read");
    } catch(err) {
      console.error(err);
    }
  });

  // Close panel on window click
  document.addEventListener('click', (e) => {
    if (notifPanel && !notifPanel.contains(e.target) && e.target !== notifBtn) {
      notifPanel.classList.remove('show');
    }
  });
}

// ── INJECT IN-APP NOTIFICATION TOAST WIDGET ──
function injectInAppToast() {
  if (document.getElementById('customInAppToast')) return;

  const styles = document.createElement('style');
  styles.textContent = `
    .custom-inapp-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 320px;
      background: #fff;
      border: 1.5px solid var(--rose, #F43F5E);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(244,63,94,0.15);
      z-index: 9999;
      padding: 16px;
      display: flex;
      flex-direction: column;
      animation: slideInNotif 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      font-family: 'DM Sans', sans-serif;
    }
    @keyframes slideInNotif {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .custom-toast-close {
      position: absolute;
      top: 6px;
      right: 12px;
      font-size: 20px;
      font-weight: 700;
      color: var(--muted, #9D7589);
      cursor: pointer;
    }
    .custom-toast-close:hover {
      color: var(--rose, #F43F5E);
    }
    .custom-toast-body {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .custom-toast-icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    .custom-toast-content {
      flex: 1;
      min-width: 0;
      text-align: left;
    }
    .custom-toast-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--dark, #1A0A14);
      margin-bottom: 4px;
      padding-right: 16px;
    }
    .custom-toast-msg {
      font-size: 12px;
      color: var(--mid, #5C3D4E);
      line-height: 1.4;
      margin-bottom: 10px;
    }
    .custom-toast-btn {
      background: var(--rose, #F43F5E);
      color: #fff;
      border: none;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .custom-toast-btn:hover {
      background: #e11d48;
    }
  `;
  document.head.appendChild(styles);

  const container = document.createElement('div');
  container.className = 'custom-inapp-toast';
  container.id = 'customInAppToast';
  container.style.display = 'none';

  container.innerHTML = `
    <span class="custom-toast-close" id="customToastClose">&times;</span>
    <div class="custom-toast-body">
      <div class="custom-toast-icon" id="customToastIcon">📢</div>
      <div class="custom-toast-content">
        <div class="custom-toast-title" id="customToastTitle">Notification</div>
        <div class="custom-toast-msg" id="customToastMsg">Details...</div>
        <button class="custom-toast-btn" id="customToastBtn">View Details</button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  document.getElementById('customToastClose').addEventListener('click', () => {
    container.style.display = 'none';
  });
}

// ── SHOW IN-APP TOAST ALERT ──
function showInAppToast(notif) {
  const container = document.getElementById('customInAppToast');
  if (!container) return;

  const iconEl = document.getElementById('customToastIcon');
  const titleEl = document.getElementById('customToastTitle');
  const msgEl = document.getElementById('customToastMsg');
  const btnEl = document.getElementById('customToastBtn');

  if (iconEl) iconEl.textContent = notif.icon || '🔔';
  if (titleEl) titleEl.textContent = notif.title || 'New Notification';
  if (msgEl) msgEl.textContent = notif.message || notif.body || '';

  container.style.display = 'flex';

  // Play audio beep securely
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.08, context.currentTime);
    osc.frequency.setValueAtTime(587.33, context.currentTime); // D5 note
    osc.start();
    osc.stop(context.currentTime + 0.12);
  } catch(e){}

  // Handle CTA Click
  btnEl.onclick = async () => {
    container.style.display = 'none';
    if (notif.id && currentUid) {
      try {
        await updateDoc(doc(db, 'notifications', currentUid, 'items', notif.id), { read: true });
      } catch(e){}
    }
    if (notif.clickUrl) {
      window.location.href = notif.clickUrl;
    }
  };

  // Auto dismiss after 5 seconds
  if (window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    container.style.display = 'none';
  }, 5000);
}

// ── RENDER BELL UI AND UPDATE BADGES ──
function updateNotificationsBadgeAndDropdown() {
  const unreadCount = currentNotifications.filter(n => !n.read).length;
  
  // 1. Dashboard natively elements
  const dbCountEl = document.getElementById('notifCount');
  const dbBodyEl = document.getElementById('notifPanelBody');
  if (dbCountEl) {
    if (unreadCount > 0) {
      dbCountEl.style.display = 'flex';
      dbCountEl.textContent = unreadCount > 9 ? '9+' : unreadCount;
    } else {
      dbCountEl.style.display = 'none';
    }
  }
  if (dbBodyEl) {
    if (currentNotifications.length === 0) {
      dbBodyEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px;">📭 No notifications yet</div>';
    } else {
      dbBodyEl.innerHTML = currentNotifications.map(n => {
        const ts = n.createdAt?.seconds ? ntTimeAgo(n.createdAt.seconds) : '';
        return `
          <div class="notif-item ${n.read ? '' : 'unread'}" onclick="openNotif('${n.id}')">
            <div class="notif-item-icon">${n.icon || '📢'}</div>
            <div class="notif-item-content">
              <div class="notif-item-title">${n.title || 'Notification'}</div>
              <div class="notif-item-msg">${n.message || n.body || ''}</div>
              <div class="notif-item-time">${ts}</div>
            </div>
          </div>`;
      }).join('');
    }
  }

  // 2. Custom injected Bell Elements (Public Pages)
  const bellContainer = document.getElementById('customNotifBell');
  const countEl = document.getElementById('customNotifCount');
  const bodyEl = document.getElementById('customNotifPanelBody');
  
  if (bellContainer) {
    bellContainer.style.display = currentUid ? 'inline-flex' : 'none';
  }
  
  if (countEl) {
    if (unreadCount > 0) {
      countEl.style.display = 'flex';
      countEl.textContent = unreadCount;
    } else {
      countEl.style.display = 'none';
    }
  }

  if (bodyEl) {
    if (currentNotifications.length === 0) {
      bodyEl.innerHTML = '<div class="custom-empty-notifs">📭 No notifications yet</div>';
    } else {
      bodyEl.innerHTML = currentNotifications.map(n => {
        const ts = n.createdAt?.seconds ? ntTimeAgo(n.createdAt.seconds) : '';
        return `
          <div class="custom-notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
            <div class="custom-notif-item-icon">${n.icon || '📢'}</div>
            <div class="custom-notif-item-content">
              <div class="custom-notif-item-title">${n.title || 'Notification'}</div>
              <div class="custom-notif-item-msg">${n.message || n.body || ''}</div>
              <div class="custom-notif-item-time">${ts}</div>
            </div>
          </div>`;
      }).join('');

      // Add click events to dropdown items
      bodyEl.querySelectorAll('.custom-notif-item').forEach(item => {
        item.addEventListener('click', async (e) => {
          const nid = item.getAttribute('data-id');
          const target = currentNotifications.find(n => n.id === nid);
          if (nid && currentUid) {
            try {
              await updateDoc(doc(db, 'notifications', currentUid, 'items', nid), { read: true });
            } catch(err) {
              console.error(err);
            }
          }
          const panel = document.getElementById('customNotifPanel');
          if (panel) panel.classList.remove('show');
          
          if (target && target.clickUrl) {
            window.location.href = target.clickUrl;
          }
        });
      });
    }
  }
}

// ── UTILITIES ──
function clearNotificationsUI() {
  const bellContainer = document.getElementById('customNotifBell');
  if (bellContainer) bellContainer.style.display = 'none';
  
  const countEl = document.getElementById('customNotifCount');
  if (countEl) countEl.style.display = 'none';
  
  const bodyEl = document.getElementById('customNotifPanelBody');
  if (bodyEl) bodyEl.innerHTML = '<div class="custom-empty-notifs">📭 No notifications</div>';
  
  const dbCountEl = document.getElementById('notifCount');
  if (dbCountEl) dbCountEl.style.display = 'none';
}

function ntTimeAgo(seconds) {
  const diff = Math.floor(Date.now() / 1000 - seconds);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function showToastAlert(msg) {
  // Leverage existing page toasts if they exist, or trigger alert
  if (typeof window.showToast === 'function') {
    window.showToast(msg);
  } else {
    const toast = document.createElement('div');
    toast.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#1A0A14; color:#fff; padding:10px 20px; border-radius:30px; font-size:13px; font-weight:700; z-index:99999; border-left:3.5px solid #F43F5E;";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// ── TAB TITLE & APP BADGE UPDATING ──
let originalTitle = document.title;
function updateBrowserTabBadge() {
  const unreadCount = currentNotifications.filter(n => !n.read).length;
  
  // Browser title badge e.g. (3) DoorSkill
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) ${originalTitle}`;
  } else {
    document.title = originalTitle;
  }

  // Web PWA Badge
  if ('setAppBadge' in navigator) {
    if (unreadCount > 0) {
      navigator.setAppBadge(unreadCount).catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }
}

// ── TRIGGER NOTIFICATION (FIRESTORE & FCM SEND W/ SERVER KEY) ──
window.triggerNotification = async function(recipientId, notifData) {
  try {
    const docRef = await addDoc(collection(db, 'notifications', recipientId, 'items'), {
      title: notifData.title || 'DoorSkill Update',
      message: notifData.message || notifData.body || '',
      icon: notifData.icon || '📢',
      clickUrl: notifData.clickUrl || '/',
      read: false,
      createdAt: serverTimestamp()
    });
    
    // Check if recipient has an FCM token
    const userSnap = await getDoc(doc(db, 'users', recipientId));
    if (userSnap.exists()) {
      const uData = userSnap.data();
      if (uData.fcmToken) {
        sendRealFcmPush(uData.fcmToken, notifData.title, notifData.message || notifData.body, notifData.clickUrl);
      }
    }
    return docRef.id;
  } catch(e) {
    console.error("Error triggering notification:", e);
  }
};

async function sendRealFcmPush(token, title, body, clickUrl) {
  const serverKey = window.FCM_SERVER_KEY || "";
  if (!serverKey) {
    console.log("FCM server key is empty. Push notification stored in Firestore subcollection but not sent via background service worker.");
    return;
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: title,
          body: body,
          icon: '/assets/logo.png',
          badge: '/assets/logo.png',
          sound: 'default'
        },
        data: {
          clickUrl: clickUrl
        }
      })
    });
    const result = await response.json();
    console.log("FCM API direct response:", result);
  } catch(err) {
    console.error("FCM API send error:", err);
  }
}

// Initialize Injection on DOM Load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectNavbarBell();
    injectInAppToast();
  });
} else {
  injectNavbarBell();
  injectInAppToast();
}
