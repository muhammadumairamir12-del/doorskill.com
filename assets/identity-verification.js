// ===== IDENTITY VERIFICATION & TRUST SYSTEM =====
// Sellers can verify identity via government ID + selfie
// Verified badge shown on profile, increases trust and search ranking

export const VERIFICATION_CONFIG = {
  types: ['government_id', 'selfie', 'business_license'],
  status: ['pending', 'approved', 'rejected', 'expired'],
  withdrawalThreshold: 500, // $500+ requires verification
  trustScoreWeight: 0.15,
};

// ===== IDENTITY VERIFICATION STATUS =====
export function createVerificationRequest(sellerId, verificationType, documents) {
  if (!VERIFICATION_CONFIG.types.includes(verificationType)) {
    throw new Error(`Invalid verification type: ${verificationType}`);
  }

  return {
    sellerId,
    type: verificationType,
    status: 'pending',
    documents, // Array of document URLs
    submittedAt: new Date(),
    reviewedAt: null,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    verificationNotes: '',
  };
}

// ===== APPROVE IDENTITY VERIFICATION =====
export function approveVerification(verificationId, reviewedBy, notes = '') {
  return {
    verificationId,
    status: 'approved',
    approvedAt: new Date(),
    reviewedBy,
    notes,
    badge: 'verified_seller', // Add this badge to seller profile
  };
}

// ===== REJECT IDENTITY VERIFICATION =====
export function rejectVerification(verificationId, reviewedBy, reason) {
  if (!reason) {
    throw new Error('Rejection reason required');
  }

  return {
    verificationId,
    status: 'rejected',
    rejectedAt: new Date(),
    reviewedBy,
    reason,
    message: `Verification rejected: ${reason}. Please try again with different documents.`,
  };
}

// ===== GET SELLER IDENTITY STATUS =====
export function getSellerIdentityStatus(seller, verifications) {
  const approvedVerifications = verifications.filter(
    v => v.status === 'approved' && (!v.expiryDate || new Date() < new Date(v.expiryDate))
  );

  return {
    identityVerified: approvedVerifications.length > 0,
    verificationTypes: approvedVerifications.map(v => v.type),
    verifiedBadges: approvedVerifications.length > 0
      ? ['verified_seller']
      : [],
    trustScore: calculateTrustScore(seller, approvedVerifications),
    canWithdraw: seller.totalEarnings < VERIFICATION_CONFIG.withdrawalThreshold ||
      approvedVerifications.length > 0,
  };
}

// ===== CALCULATE TRUST SCORE (0-100) =====
// Used in search ranking and profile display
export function calculateTrustScore(seller, verifications = []) {
  let score = 0;

  // Seller level (up to 25 points)
  const levelScores = {
    new: 5,
    level_1: 15,
    level_2: 20,
    top_rated: 25,
  };
  score += levelScores[seller.sellerLevel] || 0;

  // Average rating (up to 25 points)
  if (seller.avgRating >= 4.9) score += 25;
  else if (seller.avgRating >= 4.7) score += 20;
  else if (seller.avgRating >= 4.5) score += 15;
  else if (seller.avgRating >= 4.0) score += 10;
  else if (seller.avgRating >= 3.5) score += 5;

  // Completion rate (up to 20 points)
  score += (seller.completionRate || 0) * 20;

  // Response rate (up to 15 points)
  score += (seller.responseRate || 0) * 15;

  // Identity verified (up to 10 points)
  const approvedVerifications = verifications.filter(
    v => v.status === 'approved'
  );
  if (approvedVerifications.length > 0) score += 10;

  // Member tenure (up to 5 points)
  const daysMember = Math.floor(
    (Date.now() - new Date(seller.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysMember >= 365) score += 5;
  else if (daysMember >= 180) score += 3;
  else if (daysMember >= 90) score += 1;

  return Math.min(score, 100);
}

// ===== DISPLAY TRUST SIGNALS ON GIG PAGE =====
export function getGigPageTrustSignals(seller, reviews = [], verifications = []) {
  const avgRating = reviews.length > 0
    ? Math.round(
        (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) * 10
      ) / 10
    : 0;

  const identityStatus = getSellerIdentityStatus(seller, verifications);

  return {
    // Primary signals (above fold)
    averageRating: avgRating,
    reviewCount: reviews.length,
    sellerLevelBadge: seller.sellerLevel,
    identityVerifiedBadge: identityStatus.identityVerified,

    // Secondary signals (below fold or sidebar)
    responseTime: `${seller.avgResponseTime || 0} min`,
    responseRate: `${(seller.responseRate || 0) * 100}%`,
    ordersInQueue: seller.activeOrders || 0,
    memberSinceDate: new Date(seller.createdAt).toLocaleDateString(),
    completionRate: `${(seller.completionRate || 0) * 100}%`,
    onTimeDeliveryRate: `${(seller.onTimeRate || 0) * 100}%`,
    totalOrders: seller.totalOrders || 0,
    trustScore: calculateTrustScore(seller, verifications),

    // Trust indicators
    socialProof: {
      hasVerifiedIdentity: identityStatus.identityVerified,
      hasHighRating: avgRating >= 4.7,
      isTopRated: seller.sellerLevel === 'top_rated',
      hasMultipleReviews: reviews.length >= 10,
      fastResponseTime: (seller.avgResponseTime || 0) <= 60,
    },
  };
}

// ===== VERIFICATION EXPIRY CHECK =====
export function checkVerificationExpiry(verification) {
  if (!verification.expiryDate) return false;

  const isExpired = new Date() > new Date(verification.expiryDate);
  const daysUntilExpiry = Math.floor(
    (new Date(verification.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return {
    isExpired,
    daysUntilExpiry,
    needsRenewal: daysUntilExpiry <= 30,
    renewalMessage:
      daysUntilExpiry <= 30
        ? `Your verification expires in ${daysUntilExpiry} days. Please renew.`
        : null,
  };
}

// ===== GET VERIFICATION BADGE =====
export function getVerificationBadge(verifications) {
  const approved = verifications.find(
    v => v.status === 'approved' && (!v.expiryDate || new Date() < new Date(v.expiryDate))
  );

  if (!approved) return null;

  const badges = {
    government_id: {
      label: 'ID Verified',
      icon: '✓',
      color: 'green',
      tooltip: 'Government-issued ID verified',
    },
    selfie: {
      label: 'Face Verified',
      icon: '✓',
      color: 'green',
      tooltip: 'Identity verified via selfie',
    },
    business_license: {
      label: 'Business Verified',
      icon: '✓',
      color: 'blue',
      tooltip: 'Business license verified',
    },
  };

  return badges[approved.type] || null;
}

// ===== IDENTITY SYSTEM EXPORT =====
export const IdentityVerification = {
  createRequest: createVerificationRequest,
  approve: approveVerification,
  reject: rejectVerification,
  getStatus: getSellerIdentityStatus,
  calculateTrustScore,
  getGigPageSignals: getGigPageTrustSignals,
  checkExpiry: checkVerificationExpiry,
  getBadge: getVerificationBadge,
};

export default IdentityVerification;
