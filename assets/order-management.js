// ===== ORDER MANAGEMENT SYSTEM =====
// Complete order lifecycle management with states, timers, and auto-completion

import { db } from './firebase-config.js';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Order states per specification
export const ORDER_STATES = {
  PENDING_REQUIREMENTS: 'pending_requirements',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
  UNDER_REVIEW: 'under_review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
};

// ===== CREATE ORDER =====
export async function createOrder(buyerId, gigId, packageId, extras = [], requirements = {}) {
  try {
    const ordersRef = collection(db, 'orders');
    const gigRef = doc(db, 'gigs', gigId);
    const gigSnap = await getDoc(gigRef);

    if (!gigSnap.exists()) {
      throw new Error('Gig not found');
    }

    const gig = gigSnap.data();
    const pkg = gig.packages.find(p => p.id === packageId);

    if (!pkg) {
      throw new Error('Package not found');
    }

    // Calculate pricing
    const subtotal = pkg.price + (extras.reduce((sum, e) => sum + e.price, 0) || 0);
    const platformFee = subtotal < 75 
      ? subtotal * 0.055 + 2.50 
      : subtotal * 0.055;
    const total = subtotal + platformFee;

    const order = {
      buyerId,
      sellerId: gig.sellerId,
      gigId,
      packageId,
      packagePrice: pkg.price,
      extras: extras || [],
      subtotal,
      platformFee: Math.round(platformFee * 100) / 100,
      total: Math.round(total * 100) / 100,
      requirements: requirements || {},
      status: ORDER_STATES.PENDING_REQUIREMENTS,
      createdAt: serverTimestamp(),
      requirementsSubmittedAt: null,
      deliveryDate: null,
      deliveredAt: null,
      reviewDueAt: null,
      completedAt: null,
      cancelledAt: null,
      deliveryFiles: [],
      revisionsRequested: 0,
      revisionsLimit: pkg.revisions,
      buyerReviewSubmitted: false,
      sellerReviewSubmitted: false,
      wasLate: false,
      cancellationDispute: false,
    };

    const orderRef = await setDoc(doc(ordersRef), order);
    console.log('[v0] Order created:', orderRef.id);
    return orderRef.id;
  } catch (error) {
    console.error('[v0] Error creating order:', error);
    return null;
  }
}

// ===== SUBMIT REQUIREMENTS =====
export async function submitRequirements(orderId, requirements) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    // Calculate delivery date (add package delivery days to now)
    const orderSnap = await getDoc(orderRef);
    const order = orderSnap.data();
    
    const gigRef = doc(db, 'gigs', order.gigId);
    const gigSnap = await getDoc(gigRef);
    const pkg = gigSnap.data().packages.find(p => p.id === order.packageId);
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + pkg.deliveryDays);

    await updateDoc(orderRef, {
      requirements,
      status: ORDER_STATES.IN_PROGRESS,
      requirementsSubmittedAt: serverTimestamp(),
      deliveryDate: Timestamp.fromDate(deliveryDate),
      reviewDueAt: null, // Will be set when seller delivers
    });

    console.log('[v0] Requirements submitted');
    return true;
  } catch (error) {
    console.error('[v0] Error submitting requirements:', error);
    return false;
  }
}

// ===== MARK DELIVERED =====
export async function markDelivered(orderId, deliveryFiles = []) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    // Set review due date (3 days from now)
    const reviewDue = new Date();
    reviewDue.setDate(reviewDue.getDate() + 3);

    await updateDoc(orderRef, {
      status: ORDER_STATES.UNDER_REVIEW,
      deliveredAt: serverTimestamp(),
      deliveryFiles,
      reviewDueAt: Timestamp.fromDate(reviewDue),
    });

    console.log('[v0] Order marked as delivered');
    return true;
  } catch (error) {
    console.error('[v0] Error marking delivered:', error);
    return false;
  }
}

// ===== REQUEST REVISION =====
export async function requestRevision(orderId) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const order = orderSnap.data();

    if (order.revisionsRequested >= order.revisionsLimit && order.revisionsLimit !== -1) {
      throw new Error('Revision limit exceeded');
    }

    // Reset 3-day review timer
    const newReviewDue = new Date();
    newReviewDue.setDate(newReviewDue.getDate() + 3);

    await updateDoc(orderRef, {
      status: ORDER_STATES.IN_PROGRESS,
      revisionsRequested: order.revisionsRequested + 1,
      latestRevisionRequestAt: serverTimestamp(),
      reviewDueAt: Timestamp.fromDate(newReviewDue),
    });

    console.log('[v0] Revision requested');
    return true;
  } catch (error) {
    console.error('[v0] Error requesting revision:', error);
    return false;
  }
}

// ===== AUTO-COMPLETE ORDER =====
export async function autoCompleteOrder(orderId) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const order = orderSnap.data();

    // Check if review due date has passed and order is under review
    if (order.status === ORDER_STATES.UNDER_REVIEW) {
      const now = new Date();
      const reviewDueDate = order.reviewDueAt.toDate();

      if (now > reviewDueDate) {
        await updateDoc(orderRef, {
          status: ORDER_STATES.COMPLETED,
          completedAt: serverTimestamp(),
          buyerReviewSubmitted: true, // Auto-marked
          sellerReviewSubmitted: true, // Auto-marked
        });

        console.log('[v0] Order auto-completed');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('[v0] Error auto-completing order:', error);
    return false;
  }
}

// ===== COMPLETE ORDER =====
export async function completeOrder(orderId) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: ORDER_STATES.COMPLETED,
      completedAt: serverTimestamp(),
    });

    console.log('[v0] Order completed');
    return true;
  } catch (error) {
    console.error('[v0] Error completing order:', error);
    return false;
  }
}

// ===== CANCEL ORDER =====
export async function cancelOrder(orderId, reason, cancelledBy) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: ORDER_STATES.CANCELLED,
      cancelledAt: serverTimestamp(),
      cancelReason: reason,
      cancelInitiatedBy: cancelledBy, // 'buyer' or 'seller'
    });

    console.log('[v0] Order cancelled');
    return true;
  } catch (error) {
    console.error('[v0] Error cancelling order:', error);
    return false;
  }
}

// ===== EXTEND DEADLINE =====
export async function extendDeadline(orderId, daysToAdd = 3) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const order = orderSnap.data();

    const currentDeliveryDate = order.deliveryDate.toDate();
    const newDeliveryDate = new Date(currentDeliveryDate);
    newDeliveryDate.setDate(newDeliveryDate.getDate() + daysToAdd);

    await updateDoc(orderRef, {
      deliveryDate: Timestamp.fromDate(newDeliveryDate),
    });

    console.log('[v0] Deadline extended by', daysToAdd, 'days');
    return true;
  } catch (error) {
    console.error('[v0] Error extending deadline:', error);
    return false;
  }
}

// ===== CHECK LATE DELIVERY =====
export async function checkLateDelivery(orderId) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const order = orderSnap.data();

    if (order.deliveredAt && order.deliveryDate) {
      const deliveredDate = order.deliveredAt.toDate();
      const dueDate = order.deliveryDate.toDate();
      
      const isLate = deliveredDate > dueDate;
      
      if (isLate && !order.wasLate) {
        await updateDoc(orderRef, {
          wasLate: true,
        });
      }

      return isLate;
    }

    return false;
  } catch (error) {
    console.error('[v0] Error checking late delivery:', error);
    return false;
  }
}

// ===== GET ORDER =====
export async function getOrder(orderId) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return orderSnap.data();
    }
    return null;
  } catch (error) {
    console.error('[v0] Error fetching order:', error);
    return null;
  }
}

// ===== GET USER ORDERS =====
export async function getUserOrders(userId, role = 'buyer') {
  try {
    const ordersRef = collection(db, 'orders');
    const field = role === 'buyer' ? 'buyerId' : 'sellerId';
    
    const q = query(ordersRef, where(field, '==', userId));
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    return orders;
  } catch (error) {
    console.error('[v0] Error fetching user orders:', error);
    return [];
  }
}

// ===== GET ORDERS BY STATUS =====
export async function getOrdersByStatus(userId, status, role = 'seller') {
  try {
    const ordersRef = collection(db, 'orders');
    const field = role === 'buyer' ? 'buyerId' : 'sellerId';
    
    const q = query(
      ordersRef,
      where(field, '==', userId),
      where('status', '==', status)
    );
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    return orders;
  } catch (error) {
    console.error('[v0] Error fetching orders by status:', error);
    return [];
  }
}

// ===== CALCULATE TIME REMAINING =====
export function calculateTimeRemaining(deliveryDate) {
  const now = new Date();
  const dueDate = deliveryDate instanceof Date ? deliveryDate : deliveryDate.toDate();
  const timeDiff = dueDate - now;
  
  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isOverdue: true };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isOverdue: false };
}

// ===== GET REVIEW COUNTDOWN =====
export function getReviewCountdown(reviewDueAt) {
  const now = new Date();
  const dueDate = reviewDueAt instanceof Date ? reviewDueAt : reviewDueAt.toDate();
  const timeDiff = dueDate - now;

  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, expired: false };
}
