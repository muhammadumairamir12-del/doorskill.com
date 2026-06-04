// ===== EMERGENCY JOBS & SURGE PRICING =====
// Burst pipe at 2am? Hot water down? Tree fell on roof? 
// Emergency jobs get 1.5x surge pricing and instant notifications to nearby verified workers

// ===== SURGE PRICING MULTIPLIERS =====
export const SURGE_MULTIPLIERS = {
  normal: 1.0,
  today: 1.2, // Same-day service (today urgency)
  emergency: 1.5, // Emergency (burst pipe, etc)
  peak_hours: 1.3, // 6pm-10pm weekdays
  midnight: 2.0, // 12am-6am emergencies (highest)
  holiday: 1.4, // Holidays & weekends
  critical: 2.5 // Critical emergencies (fire, accident)
};

// ===== EMERGENCY JOB DISPATCHER =====
export function dispatchEmergencyJob(emergencyJob, availableWorkers = []) {
  const dispatch = {
    jobId: emergencyJob.jobRequestId,
    urgency: 'emergency',
    dispatchTime: new Date(),
    clientLocation: emergencyJob.location.coordinates,
    
    // Notification targeting
    notificationRadius: 5, // km radius
    targetWorkers: filterAvailableWorkers(availableWorkers, emergencyJob),
    
    // Quick matching
    topMatches: rankEmergencyWorkers(availableWorkers, emergencyJob),
    firstResponderWindow: 60, // 60 seconds to accept
    
    // Pricing
    surgePriceMultiplier: calculateSurgeMultiplier(emergencyJob),
    estimatedWorkerPayout: calculateWorkerPayout(emergencyJob),
    
    // Broadcast settings
    soundAlert: true,
    vibration: true,
    displayBold: true,
    
    // Tracking
    notificationsSent: 0,
    acceptedBy: null,
    acceptanceTime: null,
    acceptanceSpeed: null // seconds
  };
  
  return dispatch;
}

function filterAvailableWorkers(workers, emergencyJob) {
  const { city, coordinates } = emergencyJob.location;
  
  return workers.filter(worker => {
    // Must be verified
    if (!worker.verification.cnicVerified || !worker.verification.phoneVerified) {
      return false;
    }
    
    // Must be in same city
    if (worker.serviceArea.city !== city) {
      return false;
    }
    
    // Must be within radius
    const distance = calculateDistance(
      coordinates[0], coordinates[1],
      worker.serviceArea.coordinates[0], worker.serviceArea.coordinates[1]
    );
    if (distance > 5) return false;
    
    // Must have emergency availability enabled
    if (!worker.availability.emergencyAvailable) return false;
    
    // Must be active
    if (worker.status !== 'active') return false;
    
    return true;
  });
}

function rankEmergencyWorkers(workers, emergencyJob) {
  const ranked = workers.map(worker => {
    let score = 100;
    
    // Distance (closest first)
    const distance = calculateDistance(
      emergencyJob.location.coordinates[0],
      emergencyJob.location.coordinates[1],
      worker.serviceArea.coordinates[0],
      worker.serviceArea.coordinates[1]
    );
    score -= distance * 10; // Heavy penalty for distance
    
    // Rating (higher is better)
    score += worker.metrics.averageRating * 20;
    
    // Verification level (more = better)
    const verificationLevel = Object.values(worker.verification).filter(v => v).length;
    score += verificationLevel * 15;
    
    // Recent completion (active workers first)
    const hoursSinceLastJob = (Date.now() - new Date(worker.lastActive).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastJob < 24) score += 30;
    
    // Background check (if required for category)
    if (worker.verification.backgroundCheckPassed) score += 25;
    
    // Response time (faster = better)
    score += Math.max(0, 60 - worker.metrics.responseTime);
    
    return {
      ...worker,
      distance,
      emergencyScore: Math.max(0, score)
    };
  }).sort((a, b) => b.emergencyScore - a.emergencyScore);
  
  return ranked.slice(0, 10); // Top 10 matches
}

function calculateSurgeMultiplier(emergencyJob) {
  const date = new Date();
  const hour = date.getHours();
  const day = date.getDay();
  
  let multiplier = SURGE_MULTIPLIERS.emergency; // Default 1.5x
  
  // Midnight emergencies (highest)
  if (hour >= 0 && hour < 6) {
    multiplier = SURGE_MULTIPLIERS.midnight; // 2.0x
  }
  
  // Peak hours
  if (hour >= 18 && hour <= 22 && day >= 1 && day <= 5) {
    multiplier = Math.max(multiplier, SURGE_MULTIPLIERS.peak_hours); // 1.3x
  }
  
  // Holiday or weekend
  if (day === 0 || day === 6) {
    multiplier = Math.max(multiplier, SURGE_MULTIPLIERS.holiday); // 1.4x
  }
  
  // Critical emergency flag
  if (emergencyJob.emergencyDetails?.critical) {
    multiplier = SURGE_MULTIPLIERS.critical; // 2.5x
  }
  
  return multiplier;
}

function calculateWorkerPayout(emergencyJob) {
  const basePrice = emergencyJob.budgetRange?.max || 5000; // Estimate if not provided
  const multiplier = calculateSurgeMultiplier(emergencyJob);
  const surgedPrice = basePrice * multiplier;
  
  // Platform takes 15% for emergency
  const platformFee = surgedPrice * 0.15;
  const workerPayout = surgedPrice - platformFee;
  
  return {
    basePrice,
    multiplier,
    surgedPrice: Math.ceil(surgedPrice),
    platformFee: Math.ceil(platformFee),
    workerPayout: Math.floor(workerPayout)
  };
}

// ===== EMERGENCY NOTIFICATION PAYLOAD =====
export function createEmergencyNotification(dispatch, worker) {
  return {
    notificationId: 'notify_' + Math.random().toString(36).substr(2, 9),
    workerId: worker.workerId,
    
    // Alert content
    title: '🚨 EMERGENCY JOB ALERT',
    message: `${dispatch.jobId.substring(0, 8)}... - ${dispatch.clientLocation}`,
    description: `EMERGENCY: Burst pipe/Water damage in ${dispatch.jobId}`,
    
    // Financial incentive
    surge: `${(dispatch.surgePriceMultiplier * 100).toFixed(0)}% surge pricing`,
    payout: `Rs ${dispatch.estimatedWorkerPayout.workerPayout}`,
    
    // Location
    distance: `${Math.round(worker.distance)} km away`,
    coordinates: dispatch.clientLocation,
    
    // Action
    action: 'tap_to_accept',
    actionWindow: dispatch.firstResponderWindow, // seconds
    firstResponderBonus: true,
    
    // Notification channels
    channels: ['push', 'sms'], // High priority
    priority: 'high',
    sound: true,
    vibration: true,
    led: '#FF0000', // Red alert
    
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 60000) // 60 second window
  };
}

// ===== EMERGENCY JOB ACCEPTANCE =====
export function acceptEmergencyJob(jobId, workerId, acceptanceTime) {
  const speedSeconds = (acceptanceTime - new Date().getTime()) / 1000;
  
  return {
    jobId,
    workerId,
    acceptedAt: acceptanceTime,
    acceptanceSpeedSeconds: speedSeconds,
    
    // First responder bonus (if < 30 seconds)
    firstResponderBonus: speedSeconds < 30 ? true : false,
    bonusAmount: speedSeconds < 30 ? 500 : 0, // Rs 500 for quick response
    
    // Job creation
    orderCreated: {
      orderId: 'ord_' + Math.random().toString(36).substr(2, 9),
      status: 'payment_pending',
      requiresImmediatePayment: true
    },
    
    // ETAssistant (estimated time of arrival)
    eta: calculateETA(workerId), // Estimated minutes
    
    // Push confirmation to buyer
    buyerNotification: {
      title: 'Worker accepted your emergency job!',
      message: `${speedSeconds < 30 ? '⚡ Fast response! ' : ''}ETA: ${calculateETA(workerId)} minutes`,
      eta: calculateETA(workerId)
    }
  };
}

function calculateETA(workerId) {
  // Simulated ETA - in real system would use maps API
  return Math.floor(Math.random() * 20) + 5; // 5-25 minutes
}

// ===== EMERGENCY JOB CANCELLATION =====
export function cancelEmergencyJob(jobId, reason, initiatedBy) {
  return {
    jobId,
    cancelledAt: new Date(),
    reason,
    initiatedBy, // 'buyer' | 'worker' | 'system'
    
    refund: {
      status: 'issued',
      amount: 'full', // Full refund for emergencies
      recipient: 'buyer',
      method: 'original_payment_method'
    },
    
    penalty: {
      workerCancellation: initiatedBy === 'worker' ? true : false,
      ratingImpact: initiatedBy === 'worker' ? -10 : 0 // Points lost
    }
  };
}

// ===== EMERGENCY JOB METRICS =====
export function trackEmergencyJobMetrics(jobId) {
  return {
    jobId,
    metrics: {
      dispatchTime: null,
      firstNotificationSentAt: null,
      timeToAcceptance: null,
      workersNotified: 0,
      acceptanceRate: 0,
      averageAcceptanceTime: 0,
      
      // Worker metrics
      workerETA: null,
      workerArrivalTime: null,
      serviceCompletionTime: null,
      totalServiceDuration: null,
      
      // Payment metrics
      baseCost: null,
      surgePricing: null,
      totalCost: null,
      platformFee: null,
      workerPayout: null,
      
      // Satisfaction
      buyerRating: null,
      workerRating: null,
      issues: []
    }
  };
}

// ===== EMERGENCY CATEGORY EXAMPLES =====
export const EMERGENCY_CATEGORIES = {
  BURST_PIPE: {
    category: 'home_services',
    subcategory: 'Plumber',
    baseMultiplier: 1.5,
    tags: ['urgent', 'water_damage', 'flooding']
  },
  ELECTRICAL_FIRE: {
    category: 'home_services',
    subcategory: 'Electrician',
    baseMultiplier: 2.0,
    tags: ['critical', 'safety', 'fire_risk'],
    requiresBackgroundCheck: true
  },
  TREE_DOWN: {
    category: 'home_services',
    subcategory: 'Carpenter',
    baseMultiplier: 1.5,
    tags: ['urgent', 'property_damage']
  },
  VEHICLE_BREAKDOWN: {
    category: 'transport_delivery',
    subcategory: 'Mechanic',
    baseMultiplier: 1.3,
    tags: ['roadside', 'stranded']
  },
  SECURITY_BREACH: {
    category: 'business_events',
    subcategory: 'Security Guard',
    baseMultiplier: 2.0,
    tags: ['critical', 'safety'],
    requiresBackgroundCheck: true
  }
};

// ===== DISTANCE CALCULATION (Haversine) =====
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default {
  SURGE_MULTIPLIERS,
  EMERGENCY_CATEGORIES,
  dispatchEmergencyJob,
  createEmergencyNotification,
  acceptEmergencyJob,
  cancelEmergencyJob,
  trackEmergencyJobMetrics
};
