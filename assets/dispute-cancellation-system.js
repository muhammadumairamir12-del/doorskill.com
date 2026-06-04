// ===== DISPUTE & CANCELLATION SYSTEM =====
// Fiverr-style dispute resolution and order cancellation logic

export const CANCELLATION_TYPES = {
  MUTUAL: 'mutual',              // Both agree, refund issued
  BUYER_INITIATED: 'buyer_initiated',  // Seller has 2 days to respond
  SELLER_INITIATED: 'seller_initiated', // Impact completion rate heavily
  AUTO: 'auto',                  // No requirements for 7 days
  SUPPORT: 'support'             // Fiverr CS cancels
};

export const CANCELLATION_REASONS = {
  // Buyer initiated
  SELLER_UNRESPONSIVE: 'seller_unresponsive',
  MISUNDERSTANDING: 'misunderstanding',
  BETTER_OPTION: 'found_better_option',
  BUDGET_ISSUE: 'budget_issue',
  
  // Seller initiated
  CANNOT_DELIVER: 'cannot_deliver',
  PERSONAL_ISSUE: 'personal_issue',
  REQUIREMENTS_UNCLEAR: 'requirements_unclear',
  
  // System
  NO_REQUIREMENTS: 'no_requirements_submitted',
};

export const DISPUTE_STATUSES = {
  OPEN: 'open',
  SELLER_RESPONDING: 'seller_responding',
  IN_REVIEW: 'in_review',
  NEGOTIATION: 'negotiation',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

export const DISPUTE_DECISIONS = {
  BUYER_WINS: 'buyer_wins',
  SELLER_WINS: 'seller_wins',
  PARTIAL_REFUND: 'partial_refund',
  RESOLVED_MUTUAL: 'resolved_mutual'
};

// ===== CANCELLATION SYSTEM =====

export function initiateCancellation(orderId, initiatedBy, reason) {
  return {
    id: generateUUID(),
    order_id: orderId,
    type: initiatedBy === 'buyer' ? CANCELLATION_TYPES.BUYER_INITIATED : CANCELLATION_TYPES.SELLER_INITIATED,
    reason: reason,
    initiated_by: initiatedBy,
    requested_at: new Date(),
    response_deadline: initiatedBy === 'buyer' ? 
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : null, // 2 days for seller response
    seller_response: null,
    seller_responded_at: null,
    approved_at: null,
    approved_by: null,
    refund_amount: 0,
    refund_issued_at: null,
    refund_status: null,
    affects_cancellation_rate: initiatedBy === 'seller', // Seller-initiated affects rate
    status: 'pending'
  };
}

export function respondToCancellation(cancellationId, response, responseNote = '') {
  // response: 'accepted' or 'rejected'
  
  return {
    cancellation_id: cancellationId,
    seller_response: response,
    seller_responded_at: new Date(),
    response_note: responseNote,
    next_status: response === 'accepted' ? 'approved' : 'disputed'
  };
}

export function approveCancellation(cancellationId, cancellation, order) {
  // Calculate refund
  let refundAmount = order.total_price;

  // If rare cancellation and mutual, full refund to balance
  // If buyer-initiated and seller accepts, might have partial refund
  // If seller-initiated, seller doesn't get payout (full goes back)

  const refund = {
    cancellation_id: cancellationId,
    order_id: order.id,
    refund_amount: refundAmount,
    refund_issued_to: 'buyer_fiverr_balance',
    approved_at: new Date(),
    refund_status: 'processing',
    affects_cancellation_rate: cancellation.affects_cancellation_rate,
    reason: cancellation.reason
  };

  return refund;
}

export function processAutoCancellation(order) {
  // After 7 days with no requirements submitted
  const daysSinceCreated = (Date.now() - order.created_at.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceCreated >= 7 && order.status === 'pending_requirements') {
    return {
      id: generateUUID(),
      order_id: order.id,
      type: CANCELLATION_TYPES.AUTO,
      reason: CANCELLATION_REASONS.NO_REQUIREMENTS,
      initiated_by: 'system',
      requested_at: new Date(),
      approved_at: new Date(),
      refund_amount: order.total_price,
      refund_issued_at: new Date(),
      refund_status: 'completed',
      affects_cancellation_rate: false,
      auto_processed: true
    };
  }

  return null;
}

export function calculateCancellationRate(sellerMetrics, windowDays = 60) {
  // Rolling 60-day cancellation rate
  const { total_orders = 0, cancelled_orders = 0 } = sellerMetrics;

  if (total_orders === 0) return 0;

  const rate = cancelled_orders / total_orders;
  return Math.round(rate * 100) / 100;
}

export function applyCancellationPenalties(seller, cancellationRate) {
  const penalties = {
    ranking_impact: 0,
    search_demotion: false,
    level_demotion_risk: false,
    warnings: []
  };

  // Fiverr targets <10% as acceptable
  if (cancellationRate > 0.10) {
    penalties.ranking_impact = -10; // Negative ranking boost
    penalties.warnings.push('High cancellation rate detected');
  }

  if (cancellationRate > 0.15) {
    penalties.search_demotion = true;
    penalties.ranking_impact = -25;
    penalties.warnings.push('Gigs demoted in search results');
  }

  if (cancellationRate > 0.20) {
    penalties.level_demotion_risk = true;
    penalties.warnings.push('Level demotion risk - improve cancellation rate');
  }

  return penalties;
}

// ===== DISPUTE SYSTEM =====

export function raiseDispute(orderId, initiatedBy, reason, description, evidence = []) {
  return {
    id: generateUUID(),
    order_id: orderId,
    initiated_by: initiatedBy,
    reason: reason,
    description: description,
    status: DISPUTE_STATUSES.OPEN,
    buyer_evidence: evidence,
    seller_response: null,
    seller_responded_at: null,
    reviewed_by: null,
    review_notes: null,
    final_decision: null,
    created_at: new Date(),
    resolved_at: null,
    response_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days for seller response
  };
}

export function respondToDispute(disputeId, response, evidence = []) {
  return {
    dispute_id: disputeId,
    seller_response: response,
    seller_evidence: evidence,
    seller_responded_at: new Date(),
    status: DISPUTE_STATUSES.IN_REVIEW
  };
}

export function escalateToCSReview(disputeId) {
  return {
    dispute_id: disputeId,
    escalated_at: new Date(),
    status: DISPUTE_STATUSES.IN_REVIEW,
    message: 'Dispute escalated to Fiverr Customer Support for review'
  };
}

export function resolveDispute(disputeId, decision, notes = '', refundAmount = 0) {
  // decision: one of DISPUTE_DECISIONS
  
  const resolution = {
    dispute_id: disputeId,
    final_decision: decision,
    review_notes: notes,
    resolved_at: new Date(),
    status: DISPUTE_STATUSES.RESOLVED
  };

  if (decision === DISPUTE_DECISIONS.BUYER_WINS) {
    resolution.refund_to_buyer = true;
    resolution.refund_amount = refundAmount || 'full_order_price';
    resolution.seller_consequence = 'negative_review_impact';
  } else if (decision === DISPUTE_DECISIONS.SELLER_WINS) {
    resolution.refund_to_buyer = false;
    resolution.buyer_consequence = 'order_completed_as_intended';
  } else if (decision === DISPUTE_DECISIONS.PARTIAL_REFUND) {
    resolution.refund_to_buyer = true;
    resolution.refund_amount = refundAmount;
    resolution.buyer_consequence = 'partial_refund';
  } else if (decision === DISPUTE_DECISIONS.RESOLVED_MUTUAL) {
    resolution.refund_to_buyer = true;
    resolution.refund_amount = refundAmount;
    resolution.status = DISPUTE_STATUSES.CLOSED;
  }

  return resolution;
}

export function getDisputeTimeline(dispute) {
  // Generate timeline for dispute
  return {
    dispute_id: dispute.id,
    timeline: [
      {
        event: 'Dispute raised',
        timestamp: dispute.created_at,
        actor: dispute.initiated_by,
        details: `${dispute.initiated_by} raised dispute: ${dispute.reason}`
      },
      {
        event: 'Seller response deadline',
        timestamp: dispute.response_deadline,
        status: dispute.seller_responded_at ? 'responded' : 'pending',
        details: dispute.seller_response ? `Seller responded with: "${dispute.seller_response}"` : 'Awaiting seller response'
      },
      dispute.status === DISPUTE_STATUSES.IN_REVIEW && {
        event: 'CS Review started',
        timestamp: new Date(),
        details: 'Fiverr Customer Support is reviewing the dispute'
      },
      dispute.final_decision && {
        event: 'Dispute resolved',
        timestamp: dispute.resolved_at,
        decision: dispute.final_decision,
        details: dispute.review_notes
      }
    ].filter(Boolean)
  };
}

// ===== DISPUTE FLOW LOGIC =====

export function processBuyerDispute(order, reason, description) {
  // Buyer claims seller didn't deliver as promised
  return {
    type: 'buyer_initiated',
    order: order,
    dispute: raiseDispute(order.id, 'buyer', reason, description),
    next_step: 'wait_for_seller_response',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  };
}

export function processSellerDispute(order, reason) {
  // Seller claims buyer requirements were unreasonable
  return {
    type: 'seller_initiated',
    order: order,
    dispute: raiseDispute(order.id, 'seller', reason, 'Seller responded to dispute'),
    next_step: 'cs_review',
    escalate_immediately: true
  };
}

export function handleDisputeEscalation(dispute, order) {
  // If no seller response after 2 days, auto-escalate to CS
  const responseDeadline = new Date(dispute.response_deadline);
  const now = new Date();

  if (now > responseDeadline && !dispute.seller_responded_at) {
    return {
      auto_escalated: true,
      reason: 'Seller did not respond within 2 days',
      next_status: DISPUTE_STATUSES.IN_REVIEW,
      preliminary_decision: 'likely_buyer_favor' // Stronger case for buyer
    };
  }

  return null;
}

// ===== HELPER FUNCTIONS =====

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ===== STATISTICS & REPORTING =====

export function getDisputeStats(sellerId, timeframe = '30_days') {
  return {
    seller_id: sellerId,
    timeframe: timeframe,
    total_disputes: 0,
    open_disputes: 0,
    resolved_disputes: 0,
    buyer_wins: 0,
    seller_wins: 0,
    partial_resolutions: 0,
    average_resolution_time_days: 0,
    dispute_rate: 0 // disputes per 100 orders
  };
}

export function getCancellationStats(sellerId) {
  return {
    seller_id: sellerId,
    rolling_60_days: {
      total_orders: 0,
      cancelled_orders: 0,
      cancellation_rate: 0,
      cancellation_types: {
        mutual: 0,
        buyer_initiated: 0,
        seller_initiated: 0,
        auto: 0,
        support: 0
      }
    },
    impact: {
      ranking_penalty: 0,
      demoted_in_search: false,
      level_at_risk: false
    }
  };
}
