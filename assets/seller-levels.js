// ===== SELLER LEVELS SYSTEM =====

// ===== SELLER LEVELS (Per Fiverr Specification) =====
// Level evaluation: 15th of every month
// Metrics tracked: completion rate, on-time delivery, response rate, rating average (60-day rolling)

const SELLER_LEVELS = {
  new: {
    id: 'new',
    name: 'New Seller',
    requirements: {
      description: 'Just registered',
      minDaysActive: 0,
      minOrders: 0,
      minEarnings: 0,
      minRating: 0,
      minCompletionRate: 0,
      minOnTimeRate: 0,
    },
    limits: {
      activeGigs: 7,
      gigExtras: -1, // unlimited
    },
    benefits: [
      'Create and manage gigs',
      'Receive orders from buyers',
      'Build your reputation'
    ],
    commission: 0.20, // 20%
  },
  level_1: {
    id: 'level_1',
    name: 'Level 1',
    requirements: {
      description: '60+ days active, 10+ orders, $400+ earned',
      minDaysActive: 60,
      minOrders: 10,
      minEarnings: 400,
      minRating: 4.7,
      minCompletionRate: 0.90, // 90%
      minOnTimeRate: 0.90, // 90%
    },
    limits: {
      activeGigs: 10,
      gigExtras: 4,
    },
    benefits: [
      'Higher visibility in search',
      '10 active Gigs limit',
      'Up to 4 Gig Extras',
      'Priority customer support',
      'Level badge on profile',
      'Lower commission (18%)',
      'Send custom offers'
    ],
    commission: 0.18, // 18%
  },
  level_2: {
    id: 'level_2',
    name: 'Level 2',
    requirements: {
      description: '120+ days active, 50+ orders, $2,000+ earned',
      minDaysActive: 120,
      minOrders: 50,
      minEarnings: 2000,
      minRating: 4.7, // same quality metrics as Level 1
      minCompletionRate: 0.90,
      minOnTimeRate: 0.90,
    },
    limits: {
      activeGigs: 20,
      gigExtras: 5,
    },
    benefits: [
      'All Level 1 benefits',
      '20 active Gigs limit',
      'Up to 5 Gig Extras',
      'Priority support',
      'Promoted gigs placement',
      'Exclusive seller events',
      'Seller Plus subscription eligible',
      'Lower commission (15%)',
      'Priority in search results'
    ],
    commission: 0.15, // 15%
  },
  top_rated: {
    id: 'top_rated',
    name: 'Top Rated Seller',
    requirements: {
      description: '180+ days active, 100+ orders, $20,000+ earned',
      minDaysActive: 180,
      minOrders: 100,
      minEarnings: 20000,
      minRating: 4.7, // same quality metrics
      minCompletionRate: 0.90,
      minOnTimeRate: 0.90,
      manualReview: true, // manually reviewed by Fiverr
    },
    limits: {
      activeGigs: 30,
      gigExtras: -1, // unlimited
    },
    clearancePeriod: 7, // 7 days instead of 14
    benefits: [
      'All Level 2 benefits',
      '30 active Gigs limit',
      'Unlimited Gig Extras',
      'VIP support',
      'Fiverr Pro certification eligible',
      'Dedicated account manager',
      'Advanced analytics',
      'Lowest commission (10%)',
      'Featured seller badge',
      '7-day clearance period (vs 14)',
    ],
    commission: 0.10, // 10%
  }
};

// ===== SELLER LEVEL EVALUATION (Monthly, 15th of month) =====
export const LEVEL_EVALUATION_DAY = 15;


export function calculateSellerLevel(sellerData) {
  const {
    daysActive = 0,
    totalOrders = 0,
    totalEarnings = 0,
    averageRating = 0,
    completionRate = 0,
    onTimeRate = 0,
  } = sellerData;

  // Top Rated: 180+ days, 100+ orders, $20k earned, manual review
  if (
    daysActive >= 180 &&
    totalOrders >= 100 &&
    totalEarnings >= 20000 &&
    averageRating >= 4.7 &&
    completionRate >= 0.90 &&
    onTimeRate >= 0.90
  ) {
    return SELLER_LEVELS.top_rated;
  }

  // Level 2: 120+ days, 50+ orders, $2k earned, 4.7+ rating, 90%+ completion/on-time
  if (
    daysActive >= 120 &&
    totalOrders >= 50 &&
    totalEarnings >= 2000 &&
    averageRating >= 4.7 &&
    completionRate >= 0.90 &&
    onTimeRate >= 0.90
  ) {
    return SELLER_LEVELS.level_2;
  }

  // Level 1: 60+ days, 10+ orders, $400+ earned, 4.7+ rating, 90%+ completion/on-time
  if (
    daysActive >= 60 &&
    totalOrders >= 10 &&
    totalEarnings >= 400 &&
    averageRating >= 4.7 &&
    completionRate >= 0.90 &&
    onTimeRate >= 0.90
  ) {
    return SELLER_LEVELS.level_1;
  }

  // Default: New Seller
  return SELLER_LEVELS.new;
}

export function getProgressToNextLevel(sellerData) {
  const currentLevel = calculateSellerLevel(sellerData);
  const levels = [SELLER_LEVELS.new, SELLER_LEVELS.level_1, SELLER_LEVELS.level_2, SELLER_LEVELS.top_rated];
  const currentIndex = levels.findIndex(l => l.id === currentLevel.id);

  if (currentIndex === levels.length - 1) {
    return {
      nextLevel: null,
      progress: 100,
      message: 'You are at the highest level (Top Rated)',
      allRequirementsMet: true,
    };
  }

  const nextLevel = levels[currentIndex + 1];
  const req = nextLevel.requirements;

  const requirements = {
    daysActive: {
      current: sellerData.daysActive || 0,
      required: req.minDaysActive,
      met: (sellerData.daysActive || 0) >= req.minDaysActive,
      progress: Math.min(((sellerData.daysActive || 0) / req.minDaysActive) * 100, 100),
    },
    orders: {
      current: sellerData.totalOrders || 0,
      required: req.minOrders,
      met: (sellerData.totalOrders || 0) >= req.minOrders,
      progress: Math.min(((sellerData.totalOrders || 0) / req.minOrders) * 100, 100),
    },
    earnings: {
      current: sellerData.totalEarnings || 0,
      required: req.minEarnings,
      met: (sellerData.totalEarnings || 0) >= req.minEarnings,
      progress: Math.min(((sellerData.totalEarnings || 0) / req.minEarnings) * 100, 100),
    },
    rating: {
      current: sellerData.averageRating || 0,
      required: req.minRating,
      met: (sellerData.averageRating || 0) >= req.minRating,
      progress: Math.min(((sellerData.averageRating || 0) / req.minRating) * 100, 100),
    },
    completion: {
      current: (sellerData.completionRate || 0) * 100,
      required: req.minCompletionRate * 100,
      met: (sellerData.completionRate || 0) >= req.minCompletionRate,
      progress: ((sellerData.completionRate || 0) / req.minCompletionRate) * 100,
    },
    onTime: {
      current: (sellerData.onTimeRate || 0) * 100,
      required: req.minOnTimeRate * 100,
      met: (sellerData.onTimeRate || 0) >= req.minOnTimeRate,
      progress: ((sellerData.onTimeRate || 0) / req.minOnTimeRate) * 100,
    },
  };

  const allRequirementsMet = Object.values(requirements).every(r => r.met);
  const avgProgress = Object.values(requirements).reduce((sum, r) => sum + Math.min(r.progress, 100), 0) / Object.keys(requirements).length;

  return {
    currentLevel,
    nextLevel,
    requirements,
    overallProgress: Math.floor(avgProgress),
    allRequirementsMet,
    message: allRequirementsMet 
      ? `Congratulations! You meet all requirements for ${nextLevel.name}`
      : `Complete requirements to advance to ${nextLevel.name}`,
  };
}

export function getLevelDetails(levelId) {
  return SELLER_LEVELS[levelId] || SELLER_LEVELS.new;
}

export function getCommissionRate(levelId) {
  const level = SELLER_LEVELS[levelId] || SELLER_LEVELS.new;
  return level.commission;
}

export function getGigLimits(levelId) {
  const level = SELLER_LEVELS[levelId] || SELLER_LEVELS.new;
  return {
    activeGigs: level.limits.activeGigs,
    gigExtras: level.limits.gigExtras === -1 ? 'unlimited' : level.limits.gigExtras,
  };
}

export function isEligibleForLevel(sellerData, levelId) {
  const targetLevel = SELLER_LEVELS[levelId];
  if (!targetLevel) return false;

  const req = targetLevel.requirements;
  return (
    (sellerData.daysActive || 0) >= req.minDaysActive &&
    (sellerData.totalOrders || 0) >= req.minOrders &&
    (sellerData.totalEarnings || 0) >= req.minEarnings &&
    (sellerData.averageRating || 0) >= req.minRating &&
    (sellerData.completionRate || 0) >= req.minCompletionRate &&
    (sellerData.onTimeRate || 0) >= req.minOnTimeRate
  );
}

export function evaluateSellerLevel(sellerId, sellerData) {
  const currentLevel = calculateSellerLevel(sellerData);

  return {
    sellerId,
    levelId: currentLevel.id,
    levelName: currentLevel.name,
    commission: currentLevel.commission,
    limits: currentLevel.limits,
    evaluatedAt: new Date(),
    nextEvaluationDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, LEVEL_EVALUATION_DAY),
    metrics: {
      daysActive: sellerData.daysActive || 0,
      totalOrders: sellerData.totalOrders || 0,
      totalEarnings: sellerData.totalEarnings || 0,
      averageRating: sellerData.averageRating || 0,
      completionRate: ((sellerData.completionRate || 0) * 100).toFixed(1) + '%',
      onTimeRate: ((sellerData.onTimeRate || 0) * 100).toFixed(1) + '%',
      responseRate: ((sellerData.responseRate || 0) * 100).toFixed(1) + '%',
    }
  };
}
