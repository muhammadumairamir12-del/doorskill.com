// ===== DISPUTE RESOLUTION MODULE =====

const DISPUTE_STATUS = {
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  MEDIATION: 'mediation',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated'
};

const CANCELLATION_REASON = {
  BUYER_REQUEST: 'buyer_request',
  SELLER_UNABLE: 'seller_unable',
  MUTUAL_AGREEMENT: 'mutual_agreement',
  QUALITY_ISSUE: 'quality_issue',
  SELLER_NO_RESPONSE: 'seller_no_response'
};

export async function requestCancellation(orderId, reason, details) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderData = await getDoc(orderRef);

    if (!orderData.exists()) return null;

    const order = orderData.data();
    const cancellationRef = await addDoc(collection(db, 'orders', orderId, 'cancellationRequests'), {
      orderId,
      reason,
      details,
      requestedBy: order.buyerId,
      requestedAt: new Date(),
      status: 'pending',
      response: null
    });

    // Notify seller
    await createNotification(order.sellerId, 'CANCELLATION_REQUEST', {
      title: 'Cancellation Request',
      message: `Buyer requested to cancel order: ${reason}`,
      actionUrl: `/orders/${orderId}`
    });

    return cancellationRef.id;
  } catch (error) {
    console.error("[v0] Error requesting cancellation:", error);
    return null;
  }
}

export async function respondToCancellationRequest(orderId, cancellationId, response, message) {
  try {
    const cancellationRef = doc(db, 'orders', orderId, 'cancellationRequests', cancellationId);
    const updateData = {
      status: response === 'approve' ? 'approved' : 'rejected',
      respondedAt: new Date(),
      respondedBy: 'seller',
      sellerMessage: message
    };

    await updateDoc(cancellationRef, updateData);

    if (response === 'approve') {
      // Process refund and update order status
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelledAt: new Date(),
        refundProcessed: true
      });
    }

    return true;
  } catch (error) {
    console.error("[v0] Error responding to cancellation:", error);
    return false;
  }
}

export async function fileDispute(orderId, disputeData) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderData = await getDoc(orderRef);

    if (!orderData.exists()) return null;

    const order = orderData.data();
    const disputeRef = await addDoc(collection(db, 'disputes'), {
      orderId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      reason: disputeData.reason,
      description: disputeData.description,
      evidence: disputeData.evidence || [],
      filedBy: disputeData.filedBy || 'buyer',
      status: DISPUTE_STATUS.OPEN,
      severity: disputeData.severity || 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      resolution: null
    });

    // Update order status
    await updateDoc(orderRef, {
      status: 'disputed',
      disputeId: disputeRef.id
    });

    // Notify both parties
    await createNotification(order.buyerId, 'DISPUTE_FILED', {
      title: 'Dispute Filed',
      message: 'A dispute has been filed for your order',
      actionUrl: `/disputes/${disputeRef.id}`
    });

    await createNotification(order.sellerId, 'DISPUTE_FILED', {
      title: 'Dispute Filed Against You',
      message: 'A dispute has been filed. Please provide your response.',
      actionUrl: `/disputes/${disputeRef.id}`
    });

    return disputeRef.id;
  } catch (error) {
    console.error("[v0] Error filing dispute:", error);
    return null;
  }
}

export async function respondToDispute(disputeId, response, message) {
  try {
    const disputeRef = doc(db, 'disputes', disputeId);
    const dispute = await getDoc(disputeRef);

    if (!dispute.exists()) return false;

    const messages = dispute.data().messages || [];
    messages.push({
      timestamp: new Date(),
      sender: 'seller',
      message: message,
      attachments: []
    });

    await updateDoc(disputeRef, {
      messages,
      status: DISPUTE_STATUS.IN_REVIEW,
      lastResponseAt: new Date()
    });

    return true;
  } catch (error) {
    console.error("[v0] Error responding to dispute:", error);
    return false;
  }
}

export async function escalateDispute(disputeId, escalationReason) {
  try {
    const disputeRef = doc(db, 'disputes', disputeId);
    await updateDoc(disputeRef, {
      status: DISPUTE_STATUS.ESCALATED,
      escalationReason,
      escalatedAt: new Date(),
      assignedModerator: 'support-team'
    });

    // Notify support team
    console.log("[v0] Dispute escalated to support team:", disputeId);

    return true;
  } catch (error) {
    console.error("[v0] Error escalating dispute:", error);
    return false;
  }
}

export async function resolveDispute(disputeId, resolution) {
  try {
    const disputeRef = doc(db, 'disputes', disputeId);
    const dispute = await getDoc(disputeRef);

    if (!dispute.exists()) return false;

    const data = dispute.data();
    
    // Update dispute
    await updateDoc(disputeRef, {
      status: DISPUTE_STATUS.RESOLVED,
      resolution: {
        decision: resolution.decision, // 'favor_buyer', 'favor_seller', 'partial'
        refundAmount: resolution.refundAmount || 0,
        reason: resolution.reason,
        resolvedAt: new Date(),
        resolvedBy: 'moderator'
      }
    });

    // Update order status
    await updateDoc(doc(db, 'orders', data.orderId), {
      status: 'resolved',
      disputeResolved: true
    });

    // Process refund if needed
    if (resolution.refundAmount > 0) {
      await processDisputeRefund(data.orderId, data.buyerId, resolution.refundAmount);
    }

    return true;
  } catch (error) {
    console.error("[v0] Error resolving dispute:", error);
    return false;
  }
}

export async function getDispute(disputeId) {
  try {
    const dispute = await getDoc(doc(db, 'disputes', disputeId));
    return dispute.exists() ? { id: dispute.id, ...dispute.data() } : null;
  } catch (error) {
    console.error("[v0] Error getting dispute:", error);
    return null;
  }
}

export async function getDisputesByUser(userId, role = 'buyer') {
  try {
    const field = role === 'buyer' ? 'buyerId' : 'sellerId';
    const q = query(
      collection(db, 'disputes'),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const disputes = [];
    
    snapshot.forEach(doc => {
      disputes.push({ id: doc.id, ...doc.data() });
    });

    return disputes;
  } catch (error) {
    console.error("[v0] Error getting disputes:", error);
    return [];
  }
}

export async function addDisputeMessage(disputeId, message, sender) {
  try {
    const disputeRef = doc(db, 'disputes', disputeId);
    const dispute = await getDoc(disputeRef);

    if (!dispute.exists()) return false;

    const messages = dispute.data().messages || [];
    messages.push({
      timestamp: new Date(),
      sender,
      message,
      attachments: []
    });

    await updateDoc(disputeRef, {
      messages,
      lastActivityAt: new Date()
    });

    return true;
  } catch (error) {
    console.error("[v0] Error adding dispute message:", error);
    return false;
  }
}

export async function processCancellationRefund(orderId, buyerId, refundAmount) {
  try {
    // Create refund transaction
    await addDoc(collection(db, 'users', buyerId, 'refunds'), {
      orderId,
      amount: refundAmount,
      status: 'processed',
      processedAt: new Date(),
      reason: 'cancellation'
    });

    // Update order
    await updateDoc(doc(db, 'orders', orderId), {
      refundStatus: 'completed',
      refundAmount: refundAmount
    });

    console.log("[v0] Refund processed:", refundAmount);
    return true;
  } catch (error) {
    console.error("[v0] Error processing refund:", error);
    return false;
  }
}

export async function processDisputeRefund(orderId, buyerId, refundAmount) {
  return processCancellationRefund(orderId, buyerId, refundAmount);
}

export async function getCancellationRequests(orderId) {
  try {
    const q = query(
      collection(db, 'orders', orderId, 'cancellationRequests'),
      orderBy('requestedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const requests = [];

    snapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    return requests;
  } catch (error) {
    console.error("[v0] Error getting cancellation requests:", error);
    return [];
  }
}

export async function getDisputeStats() {
  try {
    const q = query(collection(db, 'disputes'));
    const snapshot = await getDocs(q);

    const stats = {
      total: snapshot.size,
      open: 0,
      inReview: 0,
      mediation: 0,
      escalated: 0,
      resolved: 0,
      avgResolutionDays: 0
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    snapshot.forEach(doc => {
      const dispute = doc.data();
      
      switch(dispute.status) {
        case DISPUTE_STATUS.OPEN:
          stats.open++;
          break;
        case DISPUTE_STATUS.IN_REVIEW:
          stats.inReview++;
          break;
        case DISPUTE_STATUS.MEDIATION:
          stats.mediation++;
          break;
        case DISPUTE_STATUS.ESCALATED:
          stats.escalated++;
          break;
        case DISPUTE_STATUS.RESOLVED:
          stats.resolved++;
          if (dispute.resolution?.resolvedAt) {
            const duration = dispute.resolution.resolvedAt.toDate?.() - dispute.createdAt.toDate?.();
            totalResolutionTime += duration || 0;
            resolvedCount++;
          }
          break;
      }
    });

    if (resolvedCount > 0) {
      stats.avgResolutionDays = (totalResolutionTime / (1000 * 60 * 60 * 24 * resolvedCount)).toFixed(1);
    }

    return stats;
  } catch (error) {
    console.error("[v0] Error getting dispute stats:", error);
    return null;
  }
}
