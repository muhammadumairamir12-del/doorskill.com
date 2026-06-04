// ===== SELLER LEVELS SYSTEM =====

const SELLER_LEVELS = {
  new: {
    id: 0,
    name: 'New Seller',
    icon: '🌱',
    minOrders: 0,
    minRating: 0,
    benefits: [
      'Create and manage gigs',
      'Receive orders from buyers',
      'Build your reputation'
    ],
    fee: 0.20
  },
  level1: {
    id: 1,
    name: 'Level 1',
    subtitle: 'Established Seller',
    icon: '⭐',
    minOrders: 5,
    minRating: 4.5,
    minCompletionRate: 0.90,
    maxCancellationRate: 0.10,
    benefits: [
      'Higher visibility in search',
      'Priority customer support',
      'Early access to new features',
      'Level badge on profile',
      'Lower commission (18%)',
      'Send custom offers'
    ],
    fee: 0.18
  },
  level2: {
    id: 2,
    name: 'Level 2',
    subtitle: 'Top Rated Seller',
    icon: '✨',
    minOrders: 20,
    minRating: 4.8,
    minCompletionRate: 0.95,
    maxCancellationRate: 0.05,
    benefits: [
      'All Level 1 benefits',
      'Promoted gigs placement',
      'Exclusive seller events',
      'Seller Plus subscription',
      'Lower commission (15%)',
      'Priority in search results'
    ],
    fee: 0.15
  },
  level3: {
    id: 3,
    name: 'Level 3',
    subtitle: 'Pro Seller',
    icon: '👑',
    minOrders: 50,
    minRating: 4.9,
    minCompletionRate: 0.98,
    maxCancellationRate: 0.02,
    benefits: [
      'All Level 2 benefits',
      'Fiverr Pro certification',
      'Dedicated account manager',
      'Advanced analytics',
      'Lowest commission (10%)',
      'Featured seller badge'
    ],
    fee: 0.10
  }
};

export function calculateSellerLevel(sellerData) {
  const {
    totalOrders = 0,
    averageRating = 0,
    completionRate = 0,
    cancellationRate = 0,
    onTimeRate = 0
  } = sellerData;

  // Determine level based on requirements
  if (totalOrders >= 50 && averageRating >= 4.9 && completionRate >= 0.98 && cancellationRate <= 0.02) {
    return SELLER_LEVELS.level3;
  }
  
  if (totalOrders >= 20 && averageRating >= 4.8 && completionRate >= 0.95 && cancellationRate <= 0.05) {
    return SELLER_LEVELS.level2;
  }
  
  if (totalOrders >= 5 && averageRating >= 4.5 && completionRate >= 0.90 && cancellationRate <= 0.10) {
    return SELLER_LEVELS.level1;
  }

  return SELLER_LEVELS.new;
}

export function getProgressToNextLevel(sellerData) {
  const currentLevel = calculateSellerLevel(sellerData);
  const levels = Object.values(SELLER_LEVELS).sort((a, b) => a.id - b.id);
  const currentIndex = levels.findIndex(l => l.id === currentLevel.id);
  
  if (currentIndex === levels.length - 1) {
    return { nextLevel: null, progress: 100, message: 'You are at the highest level' };
  }

  const nextLevel = levels[currentIndex + 1];
  const requirements = {
    orders: {
      current: sellerData.totalOrders || 0,
      required: nextLevel.minOrders,
      progress: Math.min((sellerData.totalOrders || 0) / nextLevel.minOrders * 100, 100)
    },
    rating: {
      current: sellerData.averageRating || 0,
      required: nextLevel.minRating,
      progress: Math.min((sellerData.averageRating || 0) / nextLevel.minRating * 100, 100)
    },
    completion: {
      current: (sellerData.completionRate || 0) * 100,
      required: nextLevel.minCompletionRate * 100,
      progress: (sellerData.completionRate || 0) / nextLevel.minCompletionRate * 100
    },
    cancellation: {
      current: (sellerData.cancellationRate || 0) * 100,
      required: nextLevel.maxCancellationRate * 100,
      isCapped: true,
      progress: Math.min(100, (1 - (sellerData.cancellationRate || 0) / nextLevel.maxCancellationRate) * 100)
    }
  };

  const avgProgress = (
    requirements.orders.progress +
    requirements.rating.progress +
    requirements.completion.progress +
    requirements.cancellation.progress
  ) / 4;

  return {
    currentLevel,
    nextLevel,
    requirements,
    overallProgress: Math.floor(avgProgress),
    message: `Complete ${nextLevel.minOrders - (sellerData.totalOrders || 0)} more orders to advance`
  };
}

export function getLevelBenefits(levelId) {
  const level = Object.values(SELLER_LEVELS).find(l => l.id === levelId);
  return level ? level.benefits : [];
}

export function getCommissionRate(levelId) {
  const level = Object.values(SELLER_LEVELS).find(l => l.id === levelId);
  return level ? level.fee : 0.20;
}

export function isEligibleForLevel(sellerData, levelId) {
  const level = Object.values(SELLER_LEVELS).find(l => l.id === levelId);
  if (!level) return false;

  return (
    (sellerData.totalOrders || 0) >= level.minOrders &&
    (sellerData.averageRating || 0) >= level.minRating &&
    (sellerData.completionRate || 0) >= level.minCompletionRate &&
    (sellerData.cancellationRate || 0) <= level.maxCancellationRate
  );
}

export function updateSellerLevel(sellerId, sellerData) {
  const newLevel = calculateSellerLevel(sellerData);
  
  return {
    sellerId,
    levelId: newLevel.id,
    levelName: newLevel.name,
    levelSubtitle: newLevel.subtitle,
    commissionRate: newLevel.fee,
    updatedAt: new Date(),
    requirements: {
      orders: sellerData.totalOrders || 0,
      rating: sellerData.averageRating || 0,
      completionRate: sellerData.completionRate || 0,
      cancellationRate: sellerData.cancellationRate || 0
    }
  };
}

export function getMonthlyLevelEvaluation(sellerData) {
  const lastMonthData = sellerData.lastMonthMetrics || {};
  const evaluation = {
    date: new Date(),
    previousLevel: sellerData.currentLevel,
    newLevel: calculateSellerLevel(lastMonthData),
    levelChanged: sellerData.currentLevel !== calculateSellerLevel(lastMonthData).id,
    metrics: {
      orders: lastMonthData.totalOrders || 0,
      rating: lastMonthData.averageRating || 0,
      completionRate: lastMonthData.completionRate || 0,
      cancellationRate: lastMonthData.cancellationRate || 0
    }
  };

  return evaluation;
}
