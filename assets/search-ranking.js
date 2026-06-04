// ===== SEARCH & RANKING ALGORITHM (Per Fiverr Specification) =====
// Fiverr uses proprietary search ranking based on multiple signals
// Not purely keyword-based — seller performance and buyer behavior heavily influence rankings
// 9 major ranking factors with scientific weighting

export const RANKING_FACTORS = {
  KEYWORD_MATCH: { weight: 0.15, name: 'Keyword Match' },
  CONVERSION_RATE: { weight: 0.20, name: 'Conversion Rate' },
  REVIEW_SCORE: { weight: 0.20, name: 'Review Score' },
  COMPLETION_RATE: { weight: 0.10, name: 'Completion Rate' },
  ON_TIME_RATE: { weight: 0.10, name: 'On-Time Delivery' },
  RESPONSE_RATE: { weight: 0.10, name: 'Response Rate' },
  SELLER_LEVEL: { weight: 0.10, name: 'Seller Level' },
  RECENCY: { weight: 0.03, name: 'Recency' },
  REPEAT_BUYERS: { weight: 0.02, name: 'Repeat Buyers' },
};

// ===== KEYWORD MATCHING SCORING =====
export function scoreKeywordMatch(gig, searchQuery) {
  const query = searchQuery.toLowerCase();
  let score = 0;

  // Title match (exact = 100, partial = 50)
  if (gig.title?.toLowerCase() === query) {
    score += 100;
  } else if (gig.title?.toLowerCase().includes(query)) {
    score += 50;
  }

  // Tag match (each tag = 20 points)
  gig.tags?.forEach(tag => {
    if (tag.toLowerCase() === query) score += 20;
    else if (tag.toLowerCase().includes(query)) score += 10;
  });

  // Category match (5 points if in description)
  if (gig.description?.toLowerCase().includes(query)) {
    score += 5;
  }

  // Normalize to 0-100
  return Math.min(score, 100);
}

// ===== CONVERSION RATE SCORING =====
// Impressions → Clicks → Orders (most important factor after reviews)
export function scoreConversionRate(impressions = 0, clicks = 0, orders = 0) {
  if (impressions === 0) return 0;

  const clickThrough = clicks / impressions;
  const conversionRate = orders / clicks;

  // Weight CTR 40%, conversion 60%
  const score = (clickThrough * 0.40 * 100) + (conversionRate * 0.60 * 100);
  return Math.min(score, 100);
}

// ===== REVIEW SCORE CALCULATION =====
// Combines rating and review count (second most important factor)
export function scoreReviews(averageRating = 0, reviewCount = 0) {
  // Rating: up to 50 points
  const ratingScore = (averageRating / 5) * 50;

  // Review count: up to 50 points (logarithmic scaling)
  // 10 reviews = 20 points, 100 reviews = 40 points, 1000+ = 50 points
  const reviewScore = Math.min(Math.log10(Math.max(reviewCount, 1)) * 10, 50);

  return Math.min(ratingScore + reviewScore, 100);
}

// ===== ORDER COMPLETION RATE =====
export function scoreCompletionRate(completionRate = 0) {
  // 90%+ = 100 points, scales linearly
  return Math.min((completionRate / 0.90) * 100, 100);
}

// ===== ON-TIME DELIVERY RATE =====
export function scoreOnTimeRate(onTimeRate = 0) {
  // 90%+ = 100 points, scales linearly
  return Math.min((onTimeRate / 0.90) * 100, 100);
}

// ===== RESPONSE RATE & SPEED =====
export function scoreResponsePerformance(responseRate = 0, avgResponseTimeMinutes = 0) {
  // Response rate: 50 points
  const rateScore = Math.min((responseRate / 0.95) * 50, 50);

  // Response time: 50 points
  // <1 hour = 50, 1-2 hours = 40, 2-4 hours = 30, 4+ hours = scale down
  let timeScore = 0;
  if (avgResponseTimeMinutes <= 60) {
    timeScore = 50;
  } else if (avgResponseTimeMinutes <= 120) {
    timeScore = 40;
  } else if (avgResponseTimeMinutes <= 240) {
    timeScore = 30;
  } else {
    timeScore = Math.max(0, 30 - (avgResponseTimeMinutes - 240) / 60);
  }

  return rateScore + timeScore;
}

// ===== SELLER LEVEL BONUS =====
export function scoreSellerLevel(levelId) {
  const scores = {
    new: 0,
    level_1: 30,
    level_2: 70,
    top_rated: 100,
    pro: 100,
  };
  return scores[levelId] || 0;
}

// ===== RECENCY SCORING =====
// More recent activity = better ranking
export function scoreRecency(lastOrderDate, lastActivityDate) {
  const now = new Date();
  const referenceDate = lastOrderDate || lastActivityDate || new Date();
  const daysSinceActivity = (now - referenceDate) / (1000 * 60 * 60 * 24);

  // 0-7 days = 100, 7-30 days = 50, 30+ days = scales down
  if (daysSinceActivity <= 7) return 100;
  if (daysSinceActivity <= 30) return 50 + (30 - daysSinceActivity) / 30 * 50;
  return Math.max(0, 50 - (daysSinceActivity - 30) / 30);
}

// ===== REPEAT BUYER SIGNAL =====
// Strong indicator of buyer satisfaction and gig quality
export function scoreRepeatBuyers(repeatBuyerRate = 0) {
  // 20%+ repeat rate = 100 points, scales linearly
  return Math.min((repeatBuyerRate / 0.20) * 100, 100);
}

// ===== GIG GALLERY QUALITY (CTR on thumbnail) =====
export function scoreGalleryQuality(thumbnailClicks = 0, impressions = 0) {
  if (impressions === 0) return 50; // Default medium score
  
  const thumbnailCTR = thumbnailClicks / impressions;
  // Average thumbnail CTR is ~3%, good is 5%+
  return Math.min((thumbnailCTR / 0.05) * 100, 100);
}

// ===== COMPOSITE RANKING SCORE (9-factor algorithm) =====
export function calculateGigRankingScore(gig, searchQuery) {
  const scores = {
    keywordMatch: scoreKeywordMatch(gig, searchQuery),
    conversionRate: scoreConversionRate(gig.impressions, gig.clicks, gig.orders),
    reviews: scoreReviews(gig.avgRating, gig.reviewCount),
    completion: scoreCompletionRate(gig.completionRate),
    onTime: scoreOnTimeRate(gig.onTimeRate),
    response: scoreResponsePerformance(gig.responseRate, gig.avgResponseTime),
    sellerLevel: scoreSellerLevel(gig.sellerLevel),
    recency: scoreRecency(gig.lastOrderDate, gig.lastActivityDate),
    repeatBuyers: scoreRepeatBuyers(gig.repeatBuyerRate),
  };

  // Calculate weighted score
  const finalScore =
    (scores.keywordMatch * RANKING_FACTORS.KEYWORD_MATCH.weight) +
    (scores.conversionRate * RANKING_FACTORS.CONVERSION_RATE.weight) +
    (scores.reviews * RANKING_FACTORS.REVIEW_SCORE.weight) +
    (scores.completion * RANKING_FACTORS.COMPLETION_RATE.weight) +
    (scores.onTime * RANKING_FACTORS.ON_TIME_RATE.weight) +
    (scores.response * RANKING_FACTORS.RESPONSE_RATE.weight) +
    (scores.sellerLevel * RANKING_FACTORS.SELLER_LEVEL.weight) +
    (scores.recency * RANKING_FACTORS.RECENCY.weight) +
    (scores.repeatBuyers * RANKING_FACTORS.REPEAT_BUYERS.weight);

  return {
    finalScore: Math.round(finalScore * 100) / 100,
    factors: scores,
    breakdown: Object.entries(scores).map(([factor, score]) => ({
      factor,
      score: Math.round(score * 100) / 100,
      weight: RANKING_FACTORS[factor.toUpperCase().replace(/([A-Z])/g, '_$1').slice(1)]?.weight || 0,
    })),
  };
}

// ===== PROMOTED GIGS (PAID ADS) =====
// Per specification: Sellers bid cost-per-click, only Level 1+ eligible
export const PROMOTED_GIG_CONFIG = {
  minSellerLevel: 'level_1', // Only Level 1+
  costPerClick: 0.05, // $0.05 per click (configurable)
  dailyBudgetMin: 5,
  dailyBudgetMax: 500,
  qualityScoreFactors: {
    gig_rating: 0.40,
    conversion_rate: 0.30,
    ctr: 0.30,
  },
  sponsoredTag: 'Sponsored',
};

export function calculatePromotedGigAuctionScore(gig, bidAmount, qualityScore) {
  // Auction Score = Bid Amount × Quality Score
  // Quality Score = (rating/5) * 0.40 + (conversion_rate/0.10) * 0.30 + (ctr/0.05) * 0.30
  return bidAmount * qualityScore;
}

// ===== SEARCH FILTERS (Per Fiverr Specification) =====
export const SEARCH_FILTERS = {
  SERVICE_OPTIONS: 'by_subcategory_metadata',
  BUDGET_RANGE: { min: 0, max: 5000 },
  DELIVERY_TIME: ['24hr', '3_days', '7_days', 'anytime'],
  SELLER_LEVEL: ['new', 'level_1', 'level_2', 'top_rated'],
  SELLER_LANGUAGE: 'any',
  ONLINE_NOW: false,
  LOCAL_SELLERS: false,
};

// ===== SORT OPTIONS (Per Fiverr Specification) =====
export const SORT_OPTIONS = {
  BEST_SELLING: 'best_selling',
  NEWEST_ARRIVALS: 'newest',
  RECOMMENDED: 'recommended',
  HIGHEST_RATED: 'highest_rated',
};

// ===== APPLY SEARCH FILTERS =====
export function filterGigs(gigs, filters = {}) {
  return gigs.filter(gig => {
    // Budget filter
    if (filters.minBudget && gig.minPrice < filters.minBudget) return false;
    if (filters.maxBudget && gig.maxPrice > filters.maxBudget) return false;

    // Delivery time
    if (filters.deliveryTime && gig.deliveryDays > parseInt(filters.deliveryTime)) return false;

    // Seller level
    if (filters.sellerLevel && filters.sellerLevel.length > 0) {
      if (!filters.sellerLevel.includes(gig.sellerLevel)) return false;
    }

    // Rating filter
    if (filters.minRating && gig.avgRating < filters.minRating) return false;

    // Online now
    if (filters.onlineNow && !gig.sellerOnline) return false;

    // Local sellers
    if (filters.localSellers && gig.sellerCountry !== filters.buyerCountry) return false;

    return true;
  });
}

// ===== APPLY SORT =====
export function sortGigs(gigs, sortBy = SORT_OPTIONS.BEST_SELLING) {
  const sorted = [...gigs];

  switch (sortBy) {
    case SORT_OPTIONS.BEST_SELLING:
      return sorted.sort((a, b) => (b.orders || 0) - (a.orders || 0));

    case SORT_OPTIONS.NEWEST_ARRIVALS:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    case SORT_OPTIONS.RECOMMENDED:
      return sorted.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));

    case SORT_OPTIONS.HIGHEST_RATED:
      return sorted.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));

    default:
      return sorted;
  }
}

// ===== RANK GIGS WITH NEW ALGORITHM =====
export function rankGigs(gigs, searchQuery = '', sellers = {}) {
  return gigs
    .map(gig => ({
      ...gig,
      rankingScore: calculateGigRankingScore(gig, searchQuery),
    }))
    .sort((a, b) => b.rankingScore.finalScore - a.rankingScore.finalScore);
}

// ===== COMPREHENSIVE SEARCH FUNCTION =====
export function searchGigs(query, gigs, filters = {}) {
  let results = gigs;

  // Text search
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(gig =>
      gig.title?.toLowerCase().includes(searchTerm) ||
      gig.description?.toLowerCase().includes(searchTerm) ||
      gig.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Apply filters
  results = filterGigs(results, filters);

  // Apply ranking
  results = rankGigs(results, query);

  return results;
}

// ===== AUTOCOMPLETE SUGGESTIONS =====
export function getAutocompleteSuggestions(query, gigs, limit = 10) {
  const searchTerm = query.toLowerCase();
  const suggestions = new Set();

  // Collect suggestions from gig titles and tags
  gigs.forEach(gig => {
    if (gig.title?.toLowerCase().includes(searchTerm)) {
      suggestions.add(gig.title);
    }
    if (gig.tags) {
      gig.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm)) {
          suggestions.add(tag);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, limit);
}

// ===== CATEGORY TRENDS =====
export function getCategoryTrends(gigs, timeframeInDays = 30) {
  const cutoffDate = new Date(Date.now() - timeframeInDays * 24 * 60 * 60 * 1000);

  const trends = {};

  gigs
    .filter(gig => new Date(gig.createdAt) > cutoffDate)
    .forEach(gig => {
      if (!trends[gig.category]) {
        trends[gig.category] = { count: 0, avgRating: 0, totalRating: 0 };
      }
      trends[gig.category].count++;
      trends[gig.category].totalRating += gig.avgRating || 0;
    });

  // Calculate averages
  Object.keys(trends).forEach(category => {
    trends[category].avgRating = trends[category].totalRating / trends[category].count;
  });

  return trends;
}

// ===== SEARCH ANALYTICS =====
export function getSearchAnalytics(searchHistory = []) {
  const analytics = {
    topSearches: {},
    searchCount: searchHistory.length,
    noResultsSearches: [],
    averageResultsPerSearch: 0,
  };

  searchHistory.forEach(entry => {
    const query = entry.query.toLowerCase();
    analytics.topSearches[query] = (analytics.topSearches[query] || 0) + 1;

    if (entry.resultsCount === 0) {
      analytics.noResultsSearches.push(query);
    }
  });

  // Get top searches
  const sorted = Object.entries(analytics.topSearches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((acc, [query, count]) => {
      acc[query] = count;
      return acc;
    }, {});

  analytics.topSearches = sorted;

  return analytics;
}
