// ===== LOCAL WORKERS SYSTEM (Location-Based Physical Services) =====
// Enables plumbers, electricians, cleaners, drivers, etc. to offer on-site services
// Differs from digital gigs: requires GPS location, time slots, physical verification

export const LOCAL_WORKER_CATEGORIES = {
  home_services: {
    id: 'home_services',
    name: 'Home Services',
    subcategories: [
      'Plumber',
      'Electrician',
      'Carpenter',
      'Painter',
      'AC Technician',
      'Welder',
      'Tiler',
      'Roof Repair',
      'Home Cleaner',
      'Pest Control',
      'CCTV Installer',
      'Interior Work'
    ],
    backgroundCheckRequired: true,
    estimatedDemand: 'high'
  },
  transport_delivery: {
    id: 'transport_delivery',
    name: 'Transport & Delivery',
    subcategories: [
      'Driver / Ride',
      'Truck Rental',
      'Moving House',
      'Courier',
      'Grocery Delivery'
    ],
    backgroundCheckRequired: true,
    estimatedDemand: 'high'
  },
  personal_care: {
    id: 'personal_care',
    name: 'Personal & Care',
    subcategories: [
      'Barber / Haircut',
      'Massage',
      'Tailor',
      'Personal Trainer',
      'Tutor (In Person)'
    ],
    backgroundCheckRequired: false,
    estimatedDemand: 'medium'
  },
  business_events: {
    id: 'business_events',
    name: 'Business & Events',
    subcategories: [
      'Catering',
      'Event Setup',
      'Security Guard',
      'Photographer (On-Site)',
      'Generator Repair'
    ],
    backgroundCheckRequired: false,
    estimatedDemand: 'medium'
  },
  vehicle_services: {
    id: 'vehicle_services',
    name: 'Vehicle Services',
    subcategories: [
      'Car Wash',
      'Mechanic',
      'Tyre Repair',
      'Car Painting'
    ],
    backgroundCheckRequired: false,
    estimatedDemand: 'high'
  }
};

// ===== LOCAL WORKER PROFILE =====
export function createLocalWorkerProfile(workerData) {
  return {
    workerId: workerData.userId,
    // Required identity fields
    fullName: workerData.fullName, // First + Last name required
    profilePhoto: workerData.profilePhoto, // Face clearly visible
    phoneNumber: workerData.phoneNumber, // Verified via OTP
    cnic: workerData.cnic, // National ID (verified by platform)
    
    // Service information
    category: workerData.category, // home_services | transport_delivery | personal_care | business_events | vehicle_services
    subcategory: workerData.subcategory, // e.g. 'Plumber'
    yearsOfExperience: workerData.yearsOfExperience || 0,
    bio: workerData.bio, // Skills description
    languages: workerData.languages || ['English'],
    
    // Location & service area
    serviceArea: {
      city: workerData.city, // e.g. 'Karachi'
      district: workerData.district, // e.g. 'Gulshan'
      radius: workerData.radius || 10, // kilometers
      coordinates: workerData.coordinates // [lat, lon]
    },
    
    // Portfolio
    portfolioPhotos: workerData.portfolioPhotos || [], // Before/after images
    
    // Pricing options
    pricing: {
      hourlyRate: workerData.hourlyRate || null, // Per hour
      fixedRate: workerData.fixedRate || null, // Per job
      customQuote: true // Can quote for specific jobs
    },
    
    // Availability
    availability: {
      daysAvailable: workerData.daysAvailable || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: workerData.timeSlots || {
        'Monday': [{ start: '09:00', end: '17:00' }],
        'Tuesday': [{ start: '09:00', end: '17:00' }],
        // ... for each day
      },
      emergencyAvailable: workerData.emergencyAvailable || false
    },
    
    // Verification & trust
    verification: {
      cnicVerified: false,
      phoneVerified: false,
      backgroundCheckPassed: false,
      skillsTestPassed: false,
      topLocalWorker: false
    },
    
    // Metrics
    metrics: {
      totalJobs: 0,
      completionRate: 100,
      averageRating: 0,
      reviewCount: 0,
      responseTime: 0, // minutes
      jobsThisMonth: 0
    },
    
    // Account
    status: 'pending_verification', // pending_verification | active | suspended | inactive
    createdAt: new Date(),
    lastActive: new Date(),
    bankDetails: {
      accountName: workerData.bankDetails?.accountName || null,
      accountNumber: workerData.bankDetails?.accountNumber || null,
      bankName: workerData.bankDetails?.bankName || null
    }
  };
}

// ===== VERIFICATION SYSTEM =====
export function verifyWorkerIdentity(workerId, identityData) {
  return {
    workerId,
    verifications: {
      cnic: {
        verified: identityData.cnic ? true : false,
        documentId: identityData.cnic,
        verifiedAt: identityData.cnic ? new Date() : null,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      phone: {
        verified: identityData.phone ? true : false,
        number: identityData.phone,
        verifiedAt: identityData.phone ? new Date() : null
      },
      backgroundCheck: {
        status: 'pending', // pending | passed | failed
        submittedAt: new Date(),
        completedAt: null,
        result: null
      },
      skillsTest: {
        status: 'not_taken', // not_taken | pending | passed | failed
        category: identityData.category,
        score: null,
        takenAt: null
      }
    },
    trustScore: calculateWorkerTrustScore(identityData),
    badges: generateVerificationBadges(identityData)
  };
}

function calculateWorkerTrustScore(verificationData) {
  let score = 0;
  
  // CNIC verified: +25 points
  if (verificationData.cnic) score += 25;
  
  // Phone verified: +15 points
  if (verificationData.phone) score += 15;
  
  // Background check passed: +30 points
  if (verificationData.backgroundCheck === 'passed') score += 30;
  
  // Skills test passed: +20 points
  if (verificationData.skillsTest === 'passed') score += 20;
  
  // Rating bonus: up to 10 points
  if (verificationData.rating) {
    score += Math.min((verificationData.rating / 5) * 10, 10);
  }
  
  return Math.min(score, 100);
}

function generateVerificationBadges(verificationData) {
  const badges = [];
  
  if (verificationData.cnic) badges.push('CNIC Verified');
  if (verificationData.phone) badges.push('Phone Verified');
  if (verificationData.backgroundCheck === 'passed') badges.push('Background Check Passed');
  if (verificationData.skillsTest === 'passed') badges.push('Skills Test Passed');
  if (verificationData.topWorker) badges.push('Top Local Worker');
  
  return badges;
}

// ===== SEARCH LOCAL WORKERS =====
export function searchLocalWorkers(query, filters = {}) {
  return {
    location: filters.location || null,
    radius: filters.radius || 10,
    category: filters.category,
    subcategory: filters.subcategory,
    minRating: filters.minRating || 0,
    maxPrice: filters.maxPrice || null,
    availableToday: filters.availableToday || false,
    verified: filters.verified || false,
    backgroundCheckRequired: filters.backgroundCheckRequired || false,
    sortBy: filters.sortBy || 'distance', // distance | rating | price | availability
    limit: filters.limit || 20
  };
}

// ===== WORKER CARD UI COMPONENT DATA =====
export function generateWorkerCard(workerProfile, distanceFromClient = null) {
  return {
    workerId: workerProfile.workerId,
    name: workerProfile.fullName,
    title: `${workerProfile.subcategory} · ${workerProfile.serviceArea.city}, ${workerProfile.serviceArea.district}`,
    rating: workerProfile.metrics.averageRating,
    reviewCount: workerProfile.metrics.reviewCount,
    price: workerProfile.pricing.hourlyRate ? `Rs ${workerProfile.pricing.hourlyRate}/hr` : 'Custom Quote',
    distance: distanceFromClient ? `${distanceFromClient} km away` : null,
    jobsDone: workerProfile.metrics.totalJobs,
    badges: generateVerificationBadges(workerProfile.verification),
    availability: workerProfile.availability.emergencyAvailable ? 'Available today' : 'Check availability',
    photo: workerProfile.profilePhoto,
    verificationLevel: calculateVerificationLevel(workerProfile.verification)
  };
}

function calculateVerificationLevel(verification) {
  const verifiedCount = Object.values(verification).filter(v => v === true || v?.verified === true).length;
  if (verifiedCount >= 3) return 'highly_verified';
  if (verifiedCount >= 2) return 'verified';
  if (verifiedCount >= 1) return 'partially_verified';
  return 'unverified';
}

// ===== AVAILABILITY MANAGEMENT =====
export function updateWorkerAvailability(workerId, availabilityData) {
  return {
    workerId,
    daysAvailable: availabilityData.daysAvailable,
    timeSlots: availabilityData.timeSlots, // { 'Monday': [{ start: '09:00', end: '17:00' }] }
    emergencyAvailable: availabilityData.emergencyAvailable || false,
    blockedDates: availabilityData.blockedDates || [],
    updatedAt: new Date()
  };
}

export function checkWorkerAvailability(workerId, requestedDate, requestedTime) {
  return {
    workerId,
    requestedDate, // YYYY-MM-DD
    requestedTime, // HH:MM
    isAvailable: null, // populated by system
    nextAvailableSlot: null,
    estimatedWaitTime: null
  };
}

// ===== WORKER METRICS & ANALYTICS =====
export function updateWorkerMetrics(workerId, jobMetrics) {
  return {
    workerId,
    metrics: {
      totalJobs: jobMetrics.totalJobs || 0,
      completionRate: jobMetrics.completionRate || 100, // %
      averageRating: jobMetrics.averageRating || 0, // 1-5
      reviewCount: jobMetrics.reviewCount || 0,
      responseTime: jobMetrics.responseTime || 0, // minutes
      jobsThisMonth: jobMetrics.jobsThisMonth || 0,
      cancellationRate: jobMetrics.cancellationRate || 0, // %
      totalEarnings: jobMetrics.totalEarnings || 0
    },
    updatedAt: new Date()
  };
}

export function getWorkerAnalytics(workerId, timeframe = '30_days') {
  return {
    workerId,
    timeframe,
    jobStats: {
      completed: 0,
      pending: 0,
      cancelled: 0,
      completionRate: 0
    },
    earningsStats: {
      totalEarnings: 0,
      averageJobValue: 0,
      emergencyJobEarnings: 0
    },
    qualityStats: {
      averageRating: 0,
      newReviews: 0,
      positiveReviews: 0
    },
    availabilityStats: {
      hoursAvailable: 0,
      responseTime: 0,
      acceptanceRate: 0
    }
  };
}

// ===== DISTANCE CALCULATION =====
export function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula for distance between two coordinates
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

// ===== LOCAL SEARCH RANKING =====
export function rankLocalWorkers(workers, clientLocation, sortBy = 'distance') {
  const ranked = workers.map(worker => {
    const distance = calculateDistance(
      clientLocation.lat,
      clientLocation.lon,
      worker.serviceArea.coordinates[0],
      worker.serviceArea.coordinates[1]
    );
    
    let score = 100;
    
    // Distance factor (closer = higher score)
    score -= distance * 2; // Penalty for distance
    
    // Rating factor
    score += worker.metrics.averageRating * 10;
    
    // Verification factor
    const verificationCount = Object.values(worker.verification).filter(v => v).length;
    score += verificationCount * 5;
    
    // Availability factor
    if (worker.availability.emergencyAvailable) score += 15;
    
    // Response time factor (faster = higher)
    score += Math.max(0, 30 - worker.metrics.responseTime);
    
    return {
      ...worker,
      distance,
      rankingScore: Math.max(0, score)
    };
  });
  
  if (sortBy === 'distance') {
    return ranked.sort((a, b) => a.distance - b.distance);
  } else if (sortBy === 'rating') {
    return ranked.sort((a, b) => b.metrics.averageRating - a.metrics.averageRating);
  } else if (sortBy === 'price') {
    return ranked.sort((a, b) => (a.pricing.hourlyRate || 0) - (b.pricing.hourlyRate || 0));
  }
  
  return ranked.sort((a, b) => b.rankingScore - a.rankingScore);
}

export default {
  LOCAL_WORKER_CATEGORIES,
  createLocalWorkerProfile,
  verifyWorkerIdentity,
  searchLocalWorkers,
  generateWorkerCard,
  updateWorkerAvailability,
  checkWorkerAvailability,
  updateWorkerMetrics,
  getWorkerAnalytics,
  calculateDistance,
  rankLocalWorkers
};
