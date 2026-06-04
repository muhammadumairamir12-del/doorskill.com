// ===== REVIEW & TRUST SYSTEM (Per Fiverr Specification) =====
// Two-sided blind review system: buyer reviews seller, seller reviews buyer
// Neither party sees other's review until both submit or 10-day window closes

export const REVIEW_CONFIG = {
  windowDays: 10,
  blindReview: true, // Neither party sees other's review until both submit
  starRating: { min: 1, max: 5 },
  subRatings: ['communication', 'serviceAsDescribed', 'buyAgainRecommend'],
};

// ===== REVIEW STATE =====
export const REVIEW_STATES = {
  PENDING_BUYER: 'pending_buyer',        // Waiting for buyer review
  PENDING_SELLER: 'pending_seller',      // Waiting for seller review
  COMPLETED: 'completed',                 // Both reviews submitted
  EXPIRED: 'expired',                     // 10 days passed, auto-closed
};

// ===== CREATE REVIEW INVITATION =====
export function createReviewInvitation(orderId, sellerId, buyerId) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + REVIEW_CONFIG.windowDays);

  return {
    orderId,
    sellerId,
    buyerId,
    createdAt: new Date(),
    expiryDate,
    buyerReview: null,
    sellerReview: null,
    state: REVIEW_STATES.PENDING_BUYER + '_' + REVIEW_STATES.PENDING_SELLER,
    buyerReviewedAt: null,
    sellerReviewedAt: null,
  };
}

// ===== SUBMIT BUYER REVIEW =====
export function submitBuyerReview(
  orderId,
  buyerId,
  rating,
  subRatings = {},
  comment = ''
) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate sub-ratings
  Object.keys(subRatings).forEach(key => {
    if (!REVIEW_CONFIG.subRatings.includes(key)) {
      throw new Error(`Invalid sub-rating: ${key}`);
    }
    if (subRatings[key] < 1 || subRatings[key] > 5) {
      throw new Error(`Sub-rating ${key} must be between 1 and 5`);
    }
  });

  return {
    orderId,
    buyerId,
    type: 'buyer_review',
    rating,
    subRatings: {
      communication: subRatings.communication || 5,
      serviceAsDescribed: subRatings.serviceAsDescribed || 5,
      buyAgainRecommend: subRatings.buyAgainRecommend || 5,
    },
    comment,
    submittedAt: new Date(),
    isPublic: false, // Hidden until seller also reviews (blind review)
  };
}

// ===== SUBMIT SELLER REVIEW =====
export function submitSellerReview(
  orderId,
  sellerId,
  rating,
  subRatings = {},
  comment = ''
) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  Object.keys(subRatings).forEach(key => {
    if (!REVIEW_CONFIG.subRatings.includes(key)) {
      throw new Error(`Invalid sub-rating: ${key}`);
    }
    if (subRatings[key] < 1 || subRatings[key] > 5) {
      throw new Error(`Sub-rating ${key} must be between 1 and 5`);
    }
  });

  return {
    orderId,
    sellerId,
    type: 'seller_review',
    rating,
    subRatings: {
      communication: subRatings.communication || 5,
      serviceAsDescribed: subRatings.serviceAsDescribed || 5,
      buyAgainRecommend: subRatings.buyAgainRecommend || 5,
    },
    comment,
    submittedAt: new Date(),
    isPublic: false, // Hidden until buyer also reviews (blind review)
  };
}

// ===== HANDLE REVIEW SUBMISSION =====
export function handleReviewSubmission(reviewInvitation, review) {
  const isExpired =
    new Date() > new Date(reviewInvitation.expiryDate);

  if (isExpired) {
    return {
      success: false,
      error: 'Review window has expired',
      state: REVIEW_STATES.EXPIRED,
    };
  }

  let newState = reviewInvitation.state;

  if (review.type === 'buyer_review') {
    newState = newState.replace(REVIEW_STATES.PENDING_BUYER, 'submitted_buyer');
    reviewInvitation.buyerReview = review;
    reviewInvitation.buyerReviewedAt = new Date();
  } else if (review.type === 'seller_review') {
    newState = newState.replace(REVIEW_STATES.PENDING_SELLER, 'submitted_seller');
    reviewInvitation.sellerReview = review;
    reviewInvitation.sellerReviewedAt = new Date();
  }

  // Check if both have reviewed
  const bothReviewed =
    reviewInvitation.buyerReview && reviewInvitation.sellerReview;

  if (bothReviewed) {
    // Reveal both reviews (end blind review)
    reviewInvitation.buyerReview.isPublic = true;
    reviewInvitation.sellerReview.isPublic = true;
    newState = REVIEW_STATES.COMPLETED;
  }

  return {
    success: true,
    state: newState,
    reviewsPublic: bothReviewed,
    message: bothReviewed
      ? 'Both reviews submitted. Reviews are now public.'
      : 'Review submitted. Waiting for other party.',
  };
}

// ===== PUBLISH REVIEWS (After 10 days or when both reviewed) =====
export function publishReviews(reviewInvitation) {
  const isExpired =
    new Date() > new Date(reviewInvitation.expiryDate);

  if (reviewInvitation.buyerReview) {
    reviewInvitation.buyerReview.isPublic = true;
  }
  if (reviewInvitation.sellerReview) {
    reviewInvitation.sellerReview.isPublic = true;
  }

  const newState = isExpired ? REVIEW_STATES.EXPIRED : REVIEW_STATES.COMPLETED;

  return {
    state: newState,
    buyerReviewPublished: !!reviewInvitation.buyerReview,
    sellerReviewPublished: !!reviewInvitation.sellerReview,
    message: 'Reviews published',
  };
}

// ===== ADD PUBLIC REPLY TO REVIEW =====
export function addReplyToReview(review, replyAuthorId, replyText) {
  if (!review.isPublic) {
    throw new Error('Cannot reply to hidden reviews');
  }

  return {
    ...review,
    reply: {
      authorId: replyAuthorId,
      text: replyText,
      createdAt: new Date(),
    },
  };
}

// ===== CALCULATE SELLER AVERAGE RATING =====
export function calculateSellerRating(reviews) {
  if (reviews.length === 0) return 0;

  const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  return Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal
}

// ===== CALCULATE SUB-RATING AVERAGES =====
export function calculateSubRatingAverages(reviews) {
  if (reviews.length === 0) {
    return {
      communication: 0,
      serviceAsDescribed: 0,
      buyAgainRecommend: 0,
    };
  }

  const subRatings = {
    communication: [],
    serviceAsDescribed: [],
    buyAgainRecommend: [],
  };

  reviews.forEach(review => {
    if (review.subRatings) {
      if (review.subRatings.communication)
        subRatings.communication.push(review.subRatings.communication);
      if (review.subRatings.serviceAsDescribed)
        subRatings.serviceAsDescribed.push(review.subRatings.serviceAsDescribed);
      if (review.subRatings.buyAgainRecommend)
        subRatings.buyAgainRecommend.push(review.subRatings.buyAgainRecommend);
    }
  });

  return {
    communication:
      Math.round(
        (subRatings.communication.reduce((a, b) => a + b, 0) /
          subRatings.communication.length) *
          10
      ) / 10 || 0,
    serviceAsDescribed:
      Math.round(
        (subRatings.serviceAsDescribed.reduce((a, b) => a + b, 0) /
          subRatings.serviceAsDescribed.length) *
          10
      ) / 10 || 0,
    buyAgainRecommend:
      Math.round(
        (subRatings.buyAgainRecommend.reduce((a, b) => a + b, 0) /
          subRatings.buyAgainRecommend.length) *
          10
      ) / 10 || 0,
  };
}

// ===== GET SELLER TRUST SIGNALS =====
export function getSellerTrustSignals(seller, reviews) {
  const avgRating = calculateSellerRating(reviews);
  const subRatings = calculateSubRatingAverages(reviews);

  return {
    averageRating: avgRating,
    reviewCount: reviews.length,
    subRatings,
    responseTimeMinutes: seller.avgResponseTime || 0,
    responseRate: (seller.responseRate || 0) * 100,
    ordersInQueue: seller.activeOrders || 0,
    identityVerified: seller.identityVerified || false,
    memberSinceDate: seller.createdAt,
    sellerLevel: seller.sellerLevel || 'new',
    completionRate: (seller.completionRate || 0) * 100,
    onTimeRate: (seller.onTimeRate || 0) * 100,
  };
}

// ===== REVIEW DISPLAY COMPONENT DATA =====
export function formatReviewForDisplay(review) {
  if (!review.isPublic) {
    return null; // Not public yet
  }

  return {
    rating: review.rating,
    subRatings: review.subRatings,
    comment: review.comment,
    submittedAt: review.submittedAt,
    reply: review.reply || null,
    type: review.type,
  };
}

// ===== REVIEW ANALYTICS =====
export function getReviewAnalytics(reviews) {
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentagePositive: 0,
      subRatingAverages: {},
    };
  }

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating) ratingDistribution[r.rating]++;
  });

  const positiveCount = ratingDistribution[5] + ratingDistribution[4];
  const percentagePositive = Math.round((positiveCount / reviews.length) * 100);

  return {
    totalReviews: reviews.length,
    averageRating: calculateSellerRating(reviews),
    ratingDistribution,
    percentagePositive,
    subRatingAverages: calculateSubRatingAverages(reviews),
    recentReviews: reviews.slice(-5).reverse(),
  };
}

// ===== FLAG INAPPROPRIATE REVIEW =====
export function flagReview(reviewId, reason) {
  return {
    reviewId,
    flaggedAt: new Date(),
    reason,
    status: 'pending_moderation',
    reportedBy: null, // Will be set when flagged
  };
}

// ===== ENCOURAGE BUYER REVIEW =====
export function getReviewPromptMessage(orderStatus, daysSinceCompletion) {
  if (daysSinceCompletion === 0) {
    return {
      title: 'Rate your experience',
      message: 'Share your feedback to help improve the platform',
      urgency: 'normal',
    };
  }

  if (daysSinceCompletion >= 7) {
    return {
      title: 'Your review expires soon',
      message: `You have ${REVIEW_CONFIG.windowDays - daysSinceCompletion} days left to review`,
      urgency: 'high',
    };
  }

  return {
    title: 'Leave a review',
    message: 'Help other buyers make informed decisions',
    urgency: 'normal',
  };
}

// ===== EXPORT FUNCTIONS =====
export const ReviewSystem = {
  createInvitation: createReviewInvitation,
  submitBuyerReview,
  submitSellerReview,
  handleSubmission: handleReviewSubmission,
  publishReviews,
  addReply: addReplyToReview,
  calculateRating: calculateSellerRating,
  calculateSubRatings: calculateSubRatingAverages,
  getTrustSignals: getSellerTrustSignals,
  formatForDisplay: formatReviewForDisplay,
  getAnalytics: getReviewAnalytics,
  flagReview,
  getPromptMessage: getReviewPromptMessage,
};

export default ReviewSystem;
