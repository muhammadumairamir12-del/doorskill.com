// ===== SEARCH & RANKING SYSTEM =====

export const RANKING_FACTORS = {
  sellerLevel: 0.25,
  rating: 0.25,
  conversionRate: 0.20,
  responseTime: 0.10,
  completionRate: 0.10,
  recency: 0.05,
  relevance: 0.05
};

export function calculateGigRankingScore(gig, seller, userPreferences = {}) {
  let score = 0;

  // 1. Seller Level Score (0-25 points)
  const levelScore = calculateLevelScore(seller.sellerLevel) * RANKING_FACTORS.sellerLevel;
  score += levelScore;

  // 2. Rating Score (0-25 points)
  const ratingScore = calculateRatingScore(seller.averageRating) * RANKING_FACTORS.rating;
  score += ratingScore;

  // 3. Conversion Rate (0-20 points)
  const conversionScore = calculateConversionScore(seller.conversionRate) * RANKING_FACTORS.conversionRate;
  score += conversionScore;

  // 4. Response Time Score (0-10 points)
  const responseScore = calculateResponseTimeScore(seller.avgResponseTime) * RANKING_FACTORS.responseTime;
  score += responseScore;

  // 5. Completion Rate (0-10 points)
  const completionScore = calculateCompletionScore(seller.completionRate) * RANKING_FACTORS.completionRate;
  score += completionScore;

  // 6. Recency Boost (0-5 points)
  const recencyScore = calculateRecencyScore(gig.createdAt) * RANKING_FACTORS.recency;
  score += recencyScore;

  // 7. Relevance Score (0-5 points) - based on user preferences
  const relevanceScore = calculateRelevanceScore(gig, userPreferences) * RANKING_FACTORS.relevance;
  score += relevanceScore;

  // Apply tier multiplier
  const tierMultiplier = getTierMultiplier(seller.sellerLevel);
  score *= tierMultiplier;

  return Math.min(score, 100);
}

function calculateLevelScore(sellerLevel) {
  const levelScores = {
    0: 10, // New Seller
    1: 20, // Level 1
    2: 24, // Level 2
    3: 25  // Level 3 (Pro)
  };
  return levelScores[sellerLevel] || 10;
}

function calculateRatingScore(rating) {
  if (rating >= 4.9) return 25;
  if (rating >= 4.8) return 24;
  if (rating >= 4.7) return 23;
  if (rating >= 4.5) return 20;
  if (rating >= 4.0) return 15;
  if (rating >= 3.5) return 10;
  return 5;
}

function calculateConversionScore(conversionRate) {
  // Conversion rate as percentage (0-100)
  return Math.min(conversionRate, 100) * 0.2;
}

function calculateResponseTimeScore(avgResponseMinutes) {
  if (avgResponseMinutes <= 15) return 10;
  if (avgResponseMinutes <= 30) return 9;
  if (avgResponseMinutes <= 60) return 8;
  if (avgResponseMinutes <= 120) return 7;
  if (avgResponseMinutes <= 360) return 6;
  if (avgResponseMinutes <= 1440) return 5;
  return 3;
}

function calculateCompletionScore(completionRate) {
  if (completionRate >= 0.98) return 10;
  if (completionRate >= 0.95) return 9;
  if (completionRate >= 0.90) return 8;
  if (completionRate >= 0.85) return 7;
  if (completionRate >= 0.80) return 6;
  return 5;
}

function calculateRecencyScore(createdAt) {
  const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  
  if (ageInDays <= 7) return 5;
  if (ageInDays <= 30) return 4;
  if (ageInDays <= 90) return 3;
  if (ageInDays <= 180) return 2;
  return 1;
}

function calculateRelevanceScore(gig, userPreferences) {
  let score = 0;

  if (userPreferences.category && gig.category === userPreferences.category) {
    score += 2;
  }

  if (userPreferences.priceRange) {
    const basePrice = gig.packages?.basic?.price || 0;
    if (basePrice >= userPreferences.priceRange.min && basePrice <= userPreferences.priceRange.max) {
      score += 2;
    }
  }

  if (userPreferences.deliveryTime && gig.deliveryDays <= userPreferences.deliveryTime) {
    score += 1;
  }

  return Math.min(score, 5);
}

function getTierMultiplier(sellerLevel) {
  const multipliers = {
    0: 0.9,  // New Seller (90%)
    1: 1.0,  // Level 1 (100%)
    2: 1.1,  // Level 2 (110%)
    3: 1.2   // Level 3 (120%)
  };
  return multipliers[sellerLevel] || 0.9;
}

export function rankGigs(gigs, sellers, userPreferences = {}) {
  return gigs
    .map(gig => ({
      ...gig,
      rankingScore: calculateGigRankingScore(
        gig,
        sellers[gig.sellerId] || {},
        userPreferences
      )
    }))
    .sort((a, b) => b.rankingScore - a.rankingScore);
}

export function searchGigs(query, gigs, sellers, filters = {}) {
  let results = gigs;

  // Text search
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(gig =>
      gig.title.toLowerCase().includes(searchTerm) ||
      gig.description.toLowerCase().includes(searchTerm) ||
      gig.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Category filter
  if (filters.category) {
    results = results.filter(gig => gig.category === filters.category);
  }

  // Price range filter
  if (filters.priceMin || filters.priceMax) {
    results = results.filter(gig => {
      const basePrice = gig.packages?.basic?.price || 0;
      if (filters.priceMin && basePrice < filters.priceMin) return false;
      if (filters.priceMax && basePrice > filters.priceMax) return false;
      return true;
    });
  }

  // Delivery time filter
  if (filters.deliveryDays) {
    results = results.filter(gig => gig.deliveryDays <= filters.deliveryDays);
  }

  // Rating filter
  if (filters.minRating) {
    results = results.filter(gig => {
      const seller = sellers[gig.sellerId] || {};
      return (seller.averageRating || 0) >= filters.minRating;
    });
  }

  // Seller level filter
  if (filters.sellerLevel !== undefined) {
    results = results.filter(gig => {
      const seller = sellers[gig.sellerId] || {};
      return (seller.sellerLevel || 0) >= filters.sellerLevel;
    });
  }

  // Apply ranking
  return rankGigs(results, sellers, filters);
}

export function getAutocompleteSuggestions(query, gigs, limit = 10) {
  const searchTerm = query.toLowerCase();
  const suggestions = new Set();

  // Collect suggestions from gig titles and tags
  gigs.forEach(gig => {
    if (gig.title.toLowerCase().includes(searchTerm)) {
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
      trends[gig.category].totalRating += gig.seller?.averageRating || 0;
    });

  // Calculate averages
  Object.keys(trends).forEach(category => {
    trends[category].avgRating = trends[category].totalRating / trends[category].count;
  });

  return trends;
}

export function getSearchAnalytics(searchHistory = []) {
  const analytics = {
    topSearches: {},
    searchCount: searchHistory.length,
    noResultsSearches: [],
    averageResultsPerSearch: 0
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
