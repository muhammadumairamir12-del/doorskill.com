// ===== JOB POSTING & BOOKING SYSTEM (Local Services) =====
// Two hiring methods: Browse & Book (direct booking) or Post Job Request (quote-based)

// ===== JOB REQUEST (Posted by Buyer) =====
export function createJobRequest(buyerData, jobData) {
  return {
    jobRequestId: generateId(), // Unique ID
    buyerId: buyerData.userId,
    
    // Job details
    jobTitle: jobData.title, // e.g. "Fix kitchen pipe leak"
    category: jobData.category,
    subcategory: jobData.subcategory,
    description: jobData.description, // What needs to be done
    photos: jobData.photos || [], // Problem images (optional but recommended)
    
    // Location
    location: {
      address: jobData.address,
      city: jobData.city,
      coordinates: jobData.coordinates, // [lat, lon]
      dropPinMap: true // Client can drop pin on map
    },
    
    // Scheduling
    preferredDate: jobData.preferredDate, // YYYY-MM-DD
    preferredTime: jobData.preferredTime, // HH:MM
    urgency: jobData.urgency, // 'normal' | 'today' | 'emergency'
    
    // Budget
    budgetRange: {
      min: jobData.budgetMin || null,
      max: jobData.budgetMax || null
    },
    
    // Quotes
    quotesReceived: [],
    selectedQuote: null,
    selectedWorker: null,
    
    // Status
    status: 'open', // open | in_progress | accepted | completed | cancelled
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day window
    completedAt: null
  };
}

// ===== EMERGENCY JOB FEATURE =====
export function createEmergencyJob(buyerData, jobData) {
  const emergencyJob = createJobRequest(buyerData, jobData);
  
  return {
    ...emergencyJob,
    urgency: 'emergency',
    emergencyDetails: {
      issue: jobData.issue, // e.g. "Burst pipe"
      damage: jobData.damage, // e.g. "Water flooding bathroom"
      safetyRisk: jobData.safetyRisk || false,
      
      // Surge pricing
      surgePriceMultiplier: 1.5, // 1.5x normal price
      estimatedCost: jobData.budgetMax ? jobData.budgetMax * 1.5 : null,
      
      // Notifications
      notificationRadius: 5, // km
      targetWorkers: 'all_verified', // all_verified | top_rated_only
      pushNotificationsSent: [],
      
      // First responder advantage
      firstResponderBonus: true
    }
  };
}

export function broadcastEmergencyNotification(emergencyJob, nearbyWorkers) {
  const notifications = nearbyWorkers.map(worker => ({
    workerId: worker.workerId,
    jobRequestId: emergencyJob.jobRequestId,
    title: `🚨 Emergency: ${emergencyJob.jobTitle}`,
    message: `${emergencyJob.location.city} - Rs ${emergencyJob.emergencyDetails.estimatedCost}`,
    urgency: 'high',
    distance: worker.distance,
    priceMultiplier: 1.5,
    acceptanceWindow: 60, // 60 seconds to accept
    createdAt: new Date()
  }));
  
  return {
    emergencyJobId: emergencyJob.jobRequestId,
    notificationsSent: notifications.length,
    notifications
  };
}

// ===== WORKER QUOTES FOR JOBS =====
export function submitWorkerQuote(workerId, jobRequestId, quoteData) {
  return {
    quoteId: generateId(),
    workerId,
    jobRequestId,
    
    // Quote details
    description: quoteData.description, // Why qualified for this job
    proposedPrice: quoteData.proposedPrice,
    proposedDate: quoteData.proposedDate, // YYYY-MM-DD
    proposedTime: quoteData.proposedTime, // HH:MM
    estimatedDuration: quoteData.estimatedDuration, // hours
    
    // Worker confidence
    confidence: quoteData.confidence, // 'high' | 'medium' | 'low'
    yearsExperienceWithThis: quoteData.yearsExperienceWithThis,
    
    // Availability confirmation
    canStartToday: quoteData.canStartToday || false,
    emergencyAvailable: quoteData.emergencyAvailable || false,
    
    // Status
    status: 'pending', // pending | accepted | rejected | expired | cancelled
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day expiry
    
    // If accepted
    acceptedAt: null,
    jobCreatedFrom: null
  };
}

export function acceptWorkerQuote(quoteId, jobRequestId) {
  return {
    quoteId,
    jobRequestId,
    
    // This converts the quote into a booked job
    bookedJob: {
      jobId: generateId(),
      status: 'booked', // worker and buyer confirmed
      startTime: null, // from quote
      estimatedDuration: null, // from quote
      price: null, // from quote
      
      // Order creation details
      platform_fee: null, // 10-20% depending on urgency
      worker_payout: null // price - platform_fee
    },
    
    acceptedAt: new Date()
  };
}

// ===== DIRECT BOOKING (Browse & Book) =====
export function createDirectBooking(buyerId, workerId, bookingData) {
  return {
    bookingId: generateId(),
    buyerId,
    workerId,
    
    // Job details
    serviceCategory: bookingData.category,
    serviceType: bookingData.subcategory,
    
    // Scheduling
    dateRequested: bookingData.dateRequested, // YYYY-MM-DD
    timeRequested: bookingData.timeRequested, // HH:MM
    durationHours: bookingData.durationHours,
    
    // Pricing
    hourlyRate: bookingData.hourlyRate,
    totalPrice: bookingData.hourlyRate * bookingData.durationHours,
    platformFee: Math.ceil((bookingData.hourlyRate * bookingData.durationHours) * 0.15), // 15%
    workerPayout: (bookingData.hourlyRate * bookingData.durationHours) - Math.ceil((bookingData.hourlyRate * bookingData.durationHours) * 0.15),
    
    // Location
    serviceLocation: bookingData.serviceLocation,
    clientLocation: bookingData.clientLocation,
    
    // Status
    status: 'pending_confirmation', // pending_confirmation | confirmed | in_progress | completed | cancelled
    createdAt: new Date(),
    confirmedAt: null,
    startTime: null,
    completedAt: null
  };
}

// ===== BOOKING CONFIRMATION =====
export function confirmBooking(bookingId, workerAcceptance = true) {
  return {
    bookingId,
    workerAccepted: workerAcceptance,
    status: workerAcceptance ? 'confirmed' : 'rejected',
    confirmationTime: new Date(),
    
    // If confirmed
    orderCreated: workerAcceptance ? {
      orderId: generateId(),
      status: 'confirmed',
      paymentPending: true
    } : null
  };
}

// ===== JOB STATUS UPDATES =====
export const JOB_STATUSES = {
  POSTED: 'posted', // Job request created, waiting for quotes
  QUOTE_RECEIVED: 'quote_received', // Worker submitted quote
  BOOKED: 'booked', // Booking confirmed, payment pending
  ACCEPTED: 'accepted', // Payment received, job starts
  IN_PROGRESS: 'in_progress', // Worker on-site working
  COMPLETED: 'completed', // Job finished, awaiting review
  PAID: 'paid', // Worker paid
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed'
};

// ===== JOB UPDATES DURING SERVICE =====
export function updateJobStatus(jobId, newStatus, details = {}) {
  return {
    jobId,
    previousStatus: null, // populated by system
    newStatus,
    updatedAt: new Date(),
    
    // Status-specific data
    statusDetails: {
      // For in_progress
      workerArrivalTime: details.workerArrivalTime || null,
      estimatedCompletionTime: details.estimatedCompletionTime || null,
      
      // For completed
      completionTime: details.completionTime || null,
      completionPhotos: details.completionPhotos || [],
      workerNotes: details.workerNotes || null,
      
      // For disputed
      disputeReason: details.disputeReason || null
    }
  };
}

// ===== COMPLETION & HANDOFF =====
export function completeJob(jobId, completionData) {
  return {
    jobId,
    status: 'completed',
    completionTime: new Date(),
    
    // Evidence
    completionPhotos: completionData.photos || [],
    beforeAfterPhotos: true, // Before/after proof
    workerNotes: completionData.notes || '',
    clientSignoff: completionData.clientSignoff || false,
    
    // Rating & review
    readyForReview: true,
    reviewWindow: 3, // 3 days to review
    autoCompleteDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  };
}

// ===== PAYMENT FOR LOCAL JOBS =====
export function calculateLocalJobPayment(jobData) {
  const totalPrice = jobData.totalPrice;
  
  // Platform fee based on urgency
  let platformFee;
  if (jobData.urgency === 'emergency') {
    platformFee = totalPrice * 0.20; // 20% for emergency
  } else if (jobData.urgency === 'today') {
    platformFee = totalPrice * 0.15; // 15% for same-day
  } else {
    platformFee = totalPrice * 0.10; // 10% for normal
  }
  
  const workerPayout = totalPrice - platformFee;
  
  return {
    totalPrice,
    platformFee: Math.ceil(platformFee),
    workerPayout: Math.floor(workerPayout),
    
    // Clearance
    clearanceDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days (faster than digital)
    
    // Payment method
    paymentMethod: 'card', // card | wallet
    status: 'pending'
  };
}

// ===== RATING & REVIEWS (Local Jobs) =====
export function submitLocalJobReview(jobId, reviewData) {
  return {
    jobId,
    reviewId: generateId(),
    
    // Rater info
    raterId: reviewData.raterId,
    ratedWorkerId: reviewData.workerIdIfBuyerRating || null,
    
    // Rating
    rating: reviewData.rating, // 1-5 stars
    subRatings: {
      punctuality: reviewData.punctuality, // 1-5
      professionalism: reviewData.professionalism, // 1-5
      quality: reviewData.quality, // 1-5
      communication: reviewData.communication // 1-5
    },
    
    // Review text
    title: reviewData.title,
    description: reviewData.description,
    
    // Media
    photos: reviewData.photos || [], // Job completion photos
    video: reviewData.video || null,
    
    // Verification
    verified_buyer: true, // Auto-verified from job
    verified_worker: true,
    
    status: 'published',
    createdAt: new Date()
  };
}

// ===== HELPER FUNCTION =====
function generateId() {
  return 'job_' + Math.random().toString(36).substr(2, 9);
}

export default {
  createJobRequest,
  createEmergencyJob,
  broadcastEmergencyNotification,
  submitWorkerQuote,
  acceptWorkerQuote,
  createDirectBooking,
  confirmBooking,
  JOB_STATUSES,
  updateJobStatus,
  completeJob,
  calculateLocalJobPayment,
  submitLocalJobReview
};
