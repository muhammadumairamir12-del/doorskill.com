// ===== SELLER ANALYTICS DASHBOARD =====
// Metrics tracking and seller performance analytics

export const SELLER_METRICS = {
  IMPRESSIONS: 'impressions',
  CLICKS: 'clicks',
  ORDERS_ACTIVE: 'orders_active',
  ORDERS_COMPLETED: 'orders_completed',
  ORDERS_CANCELLED: 'orders_cancelled',
  CONVERSION_RATE: 'conversion_rate',
  EARNINGS_TOTAL: 'earnings_total',
  EARNINGS_PENDING: 'earnings_pending',
  EARNINGS_WITHDRAWN: 'earnings_withdrawn',
  RESPONSE_RATE: 'response_rate',
  RESPONSE_TIME: 'response_time',
  ON_TIME_RATE: 'on_time_rate',
  COMPLETION_RATE: 'completion_rate',
  RATING_AVERAGE: 'rating_average'
};

export const METRIC_WINDOWS = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  ROLLING_30: 'rolling_30',
  ROLLING_60: 'rolling_60',
  ALL_TIME: 'all_time'
};

// ===== ANALYTICS TRACKING =====

export function trackGigMetrics(gigId, metric, value = 1) {
  return {
    gig_id: gigId,
    metric: metric,
    value: value,
    timestamp: new Date(),
    event_type: metric === SELLER_METRICS.IMPRESSIONS ? 'search_result_shown' :
                metric === SELLER_METRICS.CLICKS ? 'gig_page_visited' :
                metric === SELLER_METRICS.ORDERS_COMPLETED ? 'order_completed' :
                'other'
  };
}

export function calculateConversionRate(clicks = 0, orders = 0) {
  if (clicks === 0) return 0;
  const rate = (orders / clicks) * 100;
  return Math.round(rate * 100) / 100;
}

export function calculateAverageResponseTime(responseTimes = []) {
  if (responseTimes.length === 0) return 0;
  const sum = responseTimes.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / responseTimes.length);
}

export function calculateMetrics(sellerData, window = METRIC_WINDOWS.THIS_MONTH) {
  const {
    impressions = 0,
    clicks = 0,
    orders_completed = 0,
    orders_cancelled = 0,
    total_earnings = 0,
    pending_clearance = 0,
    withdrawn = 0,
    messages_responded = 0,
    total_messages = 0,
    response_times = [],
    on_time_deliveries = 0,
    total_deliveries = 0,
    reviews = []
  } = sellerData;

  const totalOrders = orders_completed + orders_cancelled;

  return {
    window: window,
    metrics: {
      // Visibility metrics
      impressions: impressions,
      clicks: clicks,
      click_through_rate: impressions > 0 ? Math.round((clicks / impressions) * 100 * 100) / 100 : 0,

      // Order metrics
      orders_active: sellerData.orders_active || 0,
      orders_completed: orders_completed,
      orders_cancelled: orders_cancelled,
      total_orders: totalOrders,
      completion_rate: totalOrders > 0 ? Math.round((orders_completed / totalOrders) * 100 * 100) / 100 : 0,
      cancellation_rate: totalOrders > 0 ? Math.round((orders_cancelled / totalOrders) * 100 * 100) / 100 : 0,

      // Conversion
      conversion_rate: calculateConversionRate(clicks, orders_completed),

      // Financial
      earnings_total: Math.round(total_earnings * 100) / 100,
      earnings_pending: Math.round(pending_clearance * 100) / 100,
      earnings_withdrawn: Math.round(withdrawn * 100) / 100,

      // Communication
      response_rate: total_messages > 0 ? Math.round((messages_responded / total_messages) * 100 * 100) / 100 : 0,
      response_time_hours: Math.round(calculateAverageResponseTime(response_times) / 60),

      // Delivery
      on_time_rate: total_deliveries > 0 ? Math.round((on_time_deliveries / total_deliveries) * 100 * 100) / 100 : 0,

      // Reviews
      rating_average: reviews.length > 0 ?
        Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10 : 0,
      review_count: reviews.length
    },
    calculated_at: new Date()
  };
}

// ===== DASHBOARD SECTIONS =====

export function getOverviewDashboard(seller) {
  return {
    section: 'overview',
    widgets: [
      {
        title: 'Total Earnings',
        value: `$${seller.total_earned?.toFixed(2) || 0}`,
        trend: seller.earnings_trend, // positive/negative/neutral
        comparison: 'vs last month'
      },
      {
        title: 'Response Rate',
        value: `${(seller.response_rate * 100).toFixed(1)}%`,
        target: '90%+',
        status: seller.response_rate >= 0.90 ? 'good' : 'needs_improvement'
      },
      {
        title: 'On-Time Rate',
        value: `${(seller.on_time_rate * 100).toFixed(1)}%`,
        target: '90%+',
        status: seller.on_time_rate >= 0.90 ? 'good' : 'needs_improvement'
      },
      {
        title: 'Completion Rate',
        value: `${(seller.completion_rate * 100).toFixed(1)}%`,
        target: '90%+',
        status: seller.completion_rate >= 0.90 ? 'good' : 'needs_improvement'
      },
      {
        title: 'Average Rating',
        value: `${seller.average_rating?.toFixed(1) || 'N/A'}/5`,
        reviews: seller.total_reviews,
        status: seller.average_rating >= 4.7 ? 'excellent' : 'good'
      }
    ]
  };
}

export function getOrderAnalytics(seller, orders) {
  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  
  return {
    section: 'orders',
    summary: {
      total_orders: orders.length,
      active_orders: orders.filter(o => o.status === 'in_progress').length,
      completed_orders: completedOrders.length,
      cancelled_orders: cancelledOrders.length,
      completion_rate: orders.length > 0 ? 
        Math.round((completedOrders.length / orders.length) * 100) : 0
    },
    top_gigs: [
      // Top 5 gigs by orders
    ],
    order_timeline: [
      // Last 30 days
    ],
    revenue_by_gig: [
      // Revenue breakdown by gig
    ]
  };
}

export function getGigPerformance(gig) {
  return {
    section: 'gig_performance',
    gig_id: gig.id,
    gig_title: gig.title,
    status: gig.status,
    metrics: {
      impressions: gig.impressions,
      clicks: gig.clicks,
      click_through_rate: gig.impressions > 0 ? 
        Math.round((gig.clicks / gig.impressions) * 100 * 100) / 100 : 0,
      orders: gig.orders_completed,
      conversion_rate: gig.clicks > 0 ?
        Math.round((gig.orders_completed / gig.clicks) * 100 * 100) / 100 : 0,
      rating: gig.average_rating,
      reviews: gig.review_count,
      ranking_position: gig.search_ranking_position || 'unknown'
    },
    comparisons: {
      vs_category_average: {
        ctr: gig.impressions > 0 ? (gig.clicks / gig.impressions) : 0,
        conversion: gig.clicks > 0 ? (gig.orders_completed / gig.clicks) : 0
      }
    },
    recommendations: [
      // AI-generated recommendations to improve
    ]
  };
}

export function getFinancialAnalytics(seller, transactions) {
  const thisMonth = transactions.filter(t => {
    const transDate = new Date(t.created_at);
    const now = new Date();
    return transDate.getMonth() === now.getMonth() && 
           transDate.getFullYear() === now.getFullYear();
  });

  const totalRevenue = thisMonth.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalFees = thisMonth.reduce((sum, t) => sum + (t.fee || 0), 0);
  const totalEarnings = totalRevenue - totalFees;

  return {
    section: 'financial',
    this_month: {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_fees: Math.round(totalFees * 100) / 100,
      net_earnings: Math.round(totalEarnings * 100) / 100,
      orders_count: thisMonth.length
    },
    account_balance: {
      available: seller.balance,
      pending_clearance: seller.pending_clearance,
      total: seller.balance + seller.pending_clearance
    },
    earnings_breakdown: [
      // By time period
    ],
    upcoming_payouts: [
      // Scheduled withdrawals
    ]
  };
}

// ===== SELLER PLUS EXTRAS =====

export function getSellerPlusFeatures(seller) {
  if (!seller.seller_plus) {
    return {
      enabled: false,
      cost: '$99/month',
      features: [
        'Advanced keyword search trends',
        'Competitor gig insights',
        'Priority customer support',
        'Dedicated success manager',
        'Custom analytics reports',
        'Early access to new features'
      ]
    };
  }

  return {
    enabled: true,
    features: [
      {
        name: 'Advanced Keyword Search Trends',
        description: 'Discover trending keywords in your category',
        data: getKeywordTrends(seller)
      },
      {
        name: 'Competitor Gig Insights',
        description: 'Analyze competitor gigs in your niche',
        data: getCompetitorAnalysis(seller)
      },
      {
        name: 'Priority Customer Support',
        description: 'Get priority support from Fiverr team',
        contact: 'seller-plus-support@doorskill.com'
      },
      {
        name: 'Dedicated Success Manager',
        description: 'Personal account manager for guidance',
        manager: 'Assigned based on tier'
      },
      {
        name: 'Custom Analytics Reports',
        description: 'Download detailed performance reports',
        formats: ['PDF', 'CSV', 'Excel']
      }
    ]
  };
}

function getKeywordTrends(seller) {
  return {
    top_keywords: [],
    search_volume: {},
    competition: {},
    recommendations: []
  };
}

function getCompetitorAnalysis(seller) {
  return {
    top_competitors: [],
    pricing_comparison: {},
    features_comparison: {},
    rating_comparison: {}
  };
}

// ===== TIME SERIES DATA =====

export function getMetricTimeSeries(seller, metric, days = 30) {
  return {
    metric: metric,
    timeframe: `Last ${days} days`,
    data: [
      // Array of {date, value} for chart rendering
    ],
    summary: {
      current: 0,
      previous_period: 0,
      trend: 'up' // up/down/flat
    }
  };
}

// ===== ALERTS & NOTIFICATIONS =====

export function checkAlerts(seller) {
  const alerts = [];

  if (seller.response_rate < 0.90) {
    alerts.push({
      severity: 'warning',
      type: 'low_response_rate',
      message: 'Your response rate is below 90%. This may affect your search ranking.',
      action: 'Respond to messages faster'
    });
  }

  if (seller.on_time_rate < 0.90) {
    alerts.push({
      severity: 'warning',
      type: 'low_on_time_rate',
      message: 'Your on-time delivery rate is below 90%.',
      action: 'Deliver orders on time'
    });
  }

  if (seller.completion_rate < 0.90) {
    alerts.push({
      severity: 'critical',
      type: 'low_completion_rate',
      message: 'Your completion rate is below 90%. Level demotion risk!',
      action: 'Focus on completing all orders'
    });
  }

  if (seller.average_rating < 4.7) {
    alerts.push({
      severity: 'warning',
      type: 'low_rating',
      message: 'Your rating is below 4.7. Work on improving quality.',
      action: 'Review buyer feedback and improve services'
    });
  }

  return alerts;
}
