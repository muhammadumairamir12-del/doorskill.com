// Firebase Configuration & Initialization
// Author: DoorSkill Team
// Last Updated: June 2026

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, query, where, collection, getDocs, addDoc, deleteDoc, QueryConstraint, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js';
import { getRealtimeDatabase } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBkX...", // Replace with actual
  authDomain: "doorskill-xxx.firebaseapp.com",
  projectId: "doorskill-xxx",
  storageBucket: "doorskill-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ===== USER UTILITIES =====

export async function getCurrentUser() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });
}

export async function getUserProfile(userId) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("[v0] Error getting user profile:", error);
    return null;
  }
}

export async function updateUserProfile(userId, data) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("[v0] Error updating user profile:", error);
    return false;
  }
}

// ===== GIG UTILITIES =====

export async function createGig(sellerId, gigData) {
  try {
    const gigRef = await addDoc(collection(db, 'gigs'), {
      ...gigData,
      sellerId,
      impressions: 0,
      clicks: 0,
      orders: 0,
      status: 'pending_review', // Requires approval
      featured: false,
      promoted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return gigRef.id;
  } catch (error) {
    console.error("[v0] Error creating gig:", error);
    return null;
  }
}

export async function getGig(gigId) {
  try {
    const docRef = doc(db, 'gigs', gigId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("[v0] Error getting gig:", error);
    return null;
  }
}

export async function getSellerGigs(sellerId) {
  try {
    const q = query(
      collection(db, 'gigs'),
      where('sellerId', '==', sellerId),
      where('status', '!=', 'denied'),
      orderBy('status', 'asc'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[v0] Error getting seller gigs:", error);
    return [];
  }
}

export async function updateGigAnalytics(gigId, analyticsData) {
  try {
    const gigRef = doc(db, 'gigs', gigId);
    await updateDoc(gigRef, {
      ...analyticsData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("[v0] Error updating gig analytics:", error);
    return false;
  }
}

export async function incrementGigImpressions(gigId) {
  try {
    const gigRef = doc(db, 'gigs', gigId);
    const gigSnap = await getDoc(gigRef);
    if (gigSnap.exists()) {
      await updateDoc(gigRef, {
        impressions: (gigSnap.data().impressions || 0) + 1
      });
    }
    return true;
  } catch (error) {
    console.error("[v0] Error incrementing impressions:", error);
    return false;
  }
}

// ===== ORDER UTILITIES =====

export async function createOrder(orderData) {
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending_requirements',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return orderRef.id;
  } catch (error) {
    console.error("[v0] Error creating order:", error);
    return null;
  }
}

export async function getOrder(orderId) {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("[v0] Error getting order:", error);
    return null;
  }
}

export async function getBuyerOrders(buyerId) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('buyerId', '==', buyerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[v0] Error getting buyer orders:", error);
    return [];
  }
}

export async function getSellerOrders(sellerId) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[v0] Error getting seller orders:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId, newStatus, additionalData = {}) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      ...additionalData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("[v0] Error updating order status:", error);
    return false;
  }
}

// ===== REVIEW UTILITIES =====

export async function createReview(reviewData) {
  try {
    const reviewRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      isVisible: false, // Blind review initially
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return reviewRef.id;
  } catch (error) {
    console.error("[v0] Error creating review:", error);
    return null;
  }
}

export async function getReviewsForGig(gigId, onlyVisible = true) {
  try {
    let q;
    if (onlyVisible) {
      q = query(
        collection(db, 'reviews'),
        where('gigId', '==', gigId),
        where('isVisible', '==', true),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'reviews'),
        where('gigId', '==', gigId),
        orderBy('createdAt', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[v0] Error getting reviews:", error);
    return [];
  }
}

// ===== MESSAGE UTILITIES =====

export async function sendMessage(orderId, senderData) {
  try {
    const messagesRef = collection(db, 'orders', orderId, 'messages');
    const msgRef = await addDoc(messagesRef, {
      ...senderData,
      isRead: false,
      createdAt: new Date()
    });
    return msgRef.id;
  } catch (error) {
    console.error("[v0] Error sending message:", error);
    return null;
  }
}

export async function createMessage(orderId, senderId, senderName, message) {
  try {
    const messagesRef = collection(db, 'orders', orderId, 'messages');
    const msgRef = await addDoc(messagesRef, {
      senderId,
      senderName,
      message,
      isRead: false,
      createdAt: new Date()
    });
    return msgRef.id;
  } catch (error) {
    console.error("[v0] Error creating message:", error);
    return null;
  }
}

export async function getOrderMessages(orderId) {
  try {
    const q = query(
      collection(db, 'orders', orderId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[v0] Error getting messages:", error);
    return [];
  }
}

// ===== TRANSACTION UTILITIES =====

export async function getSellerTransactions(sellerId) {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[v0] Error getting transactions:", error);
    return [];
  }
}

// ===== NOTIFICATION UTILITIES =====

export async function createNotification(userId, notificationData) {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      ...notificationData,
      isRead: false,
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("[v0] Error creating notification:", error);
    return false;
  }
}

export async function getUserNotifications(userId, unreadOnly = false) {
  try {
    let q;
    if (unreadOnly) {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
    } else {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[v0] Error getting notifications:", error);
    return [];
  }
}

// ===== FAVORITE UTILITIES =====

export async function addFavorite(buyerId, gigId, gigTitle, sellerId) {
  try {
    await addDoc(collection(db, 'favorites'), {
      buyerId,
      gigId,
      gigTitle,
      sellerId,
      addedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("[v0] Error adding favorite:", error);
    return false;
  }
}

export async function getBuyerFavorites(buyerId) {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('buyerId', '==', buyerId),
      where('removedAt', '==', null)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[v0] Error getting favorites:", error);
    return [];
  }
}

// ===== HELPER FUNCTIONS =====

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase();
}

export function getTimeAgo(timestamp) {
  if (!timestamp) return 'Never';
  const now = new Date();
  const date = new Date(timestamp.seconds * 1000 || timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}

export function calculateSellerLevel(metrics) {
  const { ordersCompleted, totalEarned, rating, completionRate, onTimeRate } = metrics;
  
  if (ordersCompleted >= 100 && totalEarned >= 20000 && rating >= 4.8) {
    return 'top_rated';
  }
  if (ordersCompleted >= 50 && totalEarned >= 2000 && rating >= 4.7 && completionRate >= 90 && onTimeRate >= 90) {
    return 'level2';
  }
  if (ordersCompleted >= 10 && totalEarned >= 400 && rating >= 4.7 && completionRate >= 90 && onTimeRate >= 90) {
    return 'level1';
  }
  return 'new';
}

console.log("[v0] Firebase initialized successfully");
