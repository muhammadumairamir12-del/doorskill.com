// ===== PAYMENT SYSTEM & FEES =====
// Complete payment processing with escrow, fees, and seller withdrawal management

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

// ===== BUYER FEES (per specification) =====
// Buyer Fee: 5.5% + $2.50 for orders < $75
export function calculateBuyerFee(orderTotal) {
  if (orderTotal < 75) {
    return (orderTotal * 0.055) + 2.50;
  }
  return orderTotal * 0.055;
}

// ===== SELLER COMMISSION (per specification) =====
// Commission rates by seller level
export const SELLER_COMMISSION_RATES = {
  new_seller: 0.20,      // 20%
  level_1: 0.18,         // 18%
  level_2: 0.15,         // 15%
  top_rated: 0.10,       // 10% (180+ days, 100+ orders, $20k earned)
  pro: 0.10,             // 10%
};

export function calculateSellerCommission(orderAmount, sellerLevel) {
  const rate = SELLER_COMMISSION_RATES[sellerLevel] || SELLER_COMMISSION_RATES.new_seller;
  return orderAmount * rate;
}

// ===== PROCESS PAYMENT (ESCROW) =====
export async function processPayment(orderId, buyerId, amount, paymentMethodId) {
  try {
    const paymentRef = collection(db, 'payments');
    
    const payment = {
      orderId,
      buyerId,
      amount,
      status: 'pending', // pending -> completed -> failed
      type: 'escrow_hold',
      paymentMethodId,
      chargedAt: serverTimestamp(),
      completedAt: null,
      failureReason: null,
    };

    const docRef = await setDoc(doc(paymentRef), payment);
    console.log('[v0] Payment created (escrow):', docRef.id);
    
    // Update order with escrow reference
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      paymentId: docRef.id,
      escrowStatus: 'held',
      escrowHeldAt: serverTimestamp(),
    });

    return { success: true, paymentId: docRef.id };
  } catch (error) {
    console.error('[v0] Error processing payment:', error);
    return { success: false, error: error.message };
  }
}

// ===== RELEASE ESCROW TO SELLER =====
export async function releaseEscrow(orderId, sellerId, orderAmount, sellerLevel) {
  try {
    const commission = calculateSellerCommission(orderAmount, sellerLevel);
    const amountToSeller = orderAmount - commission;

    // Create seller transaction (pending clearance)
    const transactionRef = collection(db, 'seller_transactions');
    const transaction = {
      sellerId,
      orderId,
      type: 'order_completion',
      grossAmount: orderAmount,
      commission,
      netAmount: amountToSeller,
      status: 'pending_clearance', // pending_clearance -> cleared -> paid
      clearancePeriodDays: sellerLevel === 'top_rated' ? 7 : 14,
      createdAt: serverTimestamp(),
      clearedAt: null,
      paidAt: null,
    };

    const docRef = await setDoc(doc(transactionRef), transaction);
    console.log('[v0] Escrow released to seller transaction:', docRef.id);

    // Update order
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      escrowStatus: 'released',
      escrowReleasedAt: serverTimestamp(),
      sellerCommission: commission,
    });

    return { success: true, transactionId: docRef.id, amountToSeller };
  } catch (error) {
    console.error('[v0] Error releasing escrow:', error);
    return { success: false, error: error.message };
  }
}

// ===== REFUND ON CANCELLATION =====
export async function refundCancellation(orderId, buyerId, amount, isMutual = true) {
  try {
    // Mutual cancellations refund to Fiverr Balance (credit) by default
    // Buyer must request original payment method refund explicitly

    const refundRef = collection(db, 'refunds');
    const refund = {
      orderId,
      buyerId,
      amount,
      isMutual,
      refundMethod: isMutual ? 'fiverr_balance' : 'original_payment', // auto vs requested
      status: 'pending', // pending -> completed
      createdAt: serverTimestamp(),
      completedAt: null,
      note: 'Platform fee is non-refundable after cancellation',
    };

    const docRef = await setDoc(doc(refundRef), refund);
    console.log('[v0] Refund created:', docRef.id);

    return { success: true, refundId: docRef.id };
  } catch (error) {
    console.error('[v0] Error creating refund:', error);
    return { success: false, error: error.message };
  }
}

// ===== SELLER WITHDRAWAL (per specification) =====
// Withdrawal methods:
// - PayPal: 3-5 business days, $2 fee
// - Bank transfer (direct): 3-7 business days, fees vary
// - Fiverr Revenue Card: instant, $1 fee
// - Payoneer: 3-5 business days

export const WITHDRAWAL_METHODS = {
  PAYPAL: { name: 'PayPal', fee: 2.00, minTime: 3, maxTime: 5 },
  BANK_TRANSFER: { name: 'Bank Transfer', fee: 'varies', minTime: 3, maxTime: 7 },
  FIVERR_CARD: { name: 'Revenue Card', fee: 1.00, minTime: 0, maxTime: 1 }, // instant
  PAYONEER: { name: 'Payoneer', fee: 0, minTime: 3, maxTime: 5 },
};

export async function createWithdrawal(sellerId, amount, method) {
  try {
    // Get seller's available balance
    const sellerRef = doc(db, 'users', sellerId);
    const sellerSnap = await getDoc(sellerRef);
    const seller = sellerSnap.data();

    if (!seller.availableBalance || seller.availableBalance < amount) {
      throw new Error('Insufficient balance for withdrawal');
    }

    const methodInfo = WITHDRAWAL_METHODS[method];
    const withdrawalFee = methodInfo.fee === 'varies' ? 0 : methodInfo.fee;
    const netAmount = amount - withdrawalFee;

    const withdrawalRef = collection(db, 'withdrawals');
    const withdrawal = {
      sellerId,
      amount,
      method,
      withdrawalFee,
      netAmount,
      status: 'pending', // pending -> processing -> completed -> failed
      methodDetails: {
        name: methodInfo.name,
        processingTimeMin: methodInfo.minTime,
        processingTimeMax: methodInfo.maxTime,
      },
      createdAt: serverTimestamp(),
      processedAt: null,
      completedAt: null,
    };

    const docRef = await setDoc(doc(withdrawalRef), withdrawal);

    // Deduct from available balance
    await updateDoc(sellerRef, {
      availableBalance: seller.availableBalance - amount,
      pendingWithdrawal: (seller.pendingWithdrawal || 0) + amount,
    });

    console.log('[v0] Withdrawal initiated:', docRef.id);
    return { success: true, withdrawalId: docRef.id };
  } catch (error) {
    console.error('[v0] Error creating withdrawal:', error);
    return { success: false, error: error.message };
  }
}

// ===== CLEARANCE PERIOD MANAGEMENT (14 days standard, 7 days for Top Rated) =====
export async function processClearancePeriod() {
  try {
    const transactionRef = collection(db, 'seller_transactions');
    const q = query(
      transactionRef,
      where('status', '==', 'pending_clearance')
    );

    const querySnapshot = await getDocs(q);
    const now = new Date();

    querySnapshot.forEach(async (doc) => {
      const transaction = doc.data();
      const createdDate = transaction.createdAt.toDate();
      const clearanceDays = transaction.clearancePeriodDays;
      const clearanceDate = new Date(createdDate);
      clearanceDate.setDate(clearanceDate.getDate() + clearanceDays);

      if (now >= clearanceDate && transaction.status === 'pending_clearance') {
        // Move to seller's available balance
        const sellerRef = doc(db, 'users', transaction.sellerId);
        const sellerSnap = await getDoc(sellerRef);
        const seller = sellerSnap.data();

        await updateDoc(sellerRef, {
          availableBalance: (seller.availableBalance || 0) + transaction.netAmount,
          pendingWithdrawal: (seller.pendingWithdrawal || 0) - transaction.netAmount,
        });

        // Update transaction status
        await updateDoc(doc.ref, {
          status: 'cleared',
          clearedAt: serverTimestamp(),
        });

        console.log('[v0] Clearance period completed for transaction:', doc.id);
      }
    });

    return true;
  } catch (error) {
    console.error('[v0] Error processing clearance:', error);
    return false;
  }
}

// ===== GET SELLER BALANCE =====
export async function getSellerBalance(sellerId) {
  try {
    const sellerRef = doc(db, 'users', sellerId);
    const sellerSnap = await getDoc(sellerRef);

    if (!sellerSnap.exists()) {
      return null;
    }

    const seller = sellerSnap.data();
    return {
      availableBalance: seller.availableBalance || 0,
      pendingClearance: seller.pendingClearance || 0,
      pendingWithdrawal: seller.pendingWithdrawal || 0,
    };
  } catch (error) {
    console.error('[v0] Error fetching seller balance:', error);
    return null;
  }
}

// ===== CALCULATE TOTAL COST FOR BUYER =====
export function calculateBuyerTotalCost(packagePrice, extras = []) {
  const subtotal = packagePrice + (extras.reduce((sum, e) => sum + e.price, 0) || 0);
  const fee = calculateBuyerFee(subtotal);
  const total = subtotal + fee;

  return {
    packagePrice,
    extras,
    subtotal: Math.round(subtotal * 100) / 100,
    buyerFee: Math.round(fee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// ===== CALCULATE SELLER PAYOUT =====
export function calculateSellerPayout(orderAmount, sellerLevel) {
  const commission = calculateSellerCommission(orderAmount, sellerLevel);
  const payout = orderAmount - commission;

  return {
    orderAmount: Math.round(orderAmount * 100) / 100,
    commission: Math.round(commission * 100) / 100,
    commissionRate: (SELLER_COMMISSION_RATES[sellerLevel] * 100).toFixed(0) + '%',
    payout: Math.round(payout * 100) / 100,
  };
}
