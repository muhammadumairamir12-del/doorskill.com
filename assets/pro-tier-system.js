// ===== FIVERR PRO TIER SYSTEM =====
// Curated tier of verified professionals
// Manual vetting: credentials, portfolio, communication, delivery track record

export const PRO_CONFIG = {
  vettingChecks: [
    'professional_portfolio',
    'credentials_certifications',
    'english_communication',
    'delivery_track_record',
    'industry_experience',
  ],
  requirements: {
    minRating: 4.9,
    minOrders: 50,
    minEarnings: 5000,
    minCompletionRate: 0.98,
    minResponseRate: 0.95,
    daysActive: 365, // 1 year minimum
  },
  priceMultiplier: 10, // Pro gigs typically 10-20x higher than standard
  badge: 'pro_certified',
};

// ===== PRO APPLICATION =====
export function createProApplication(sellerId, applicationData) {
  return {
    id: `pro_app_${Date.now()}`,
    sellerId,
    status: 'pending_review',
    submittedAt: new Date(),
    portfolio: {
      url: applicationData.portfolioUrl,
      description: applicationData.portfolioDescription,
      samples: applicationData.portfolioSamples || [], // URLs to work samples
    },
    credentials: {
      certifications: applicationData.certifications || [],
      degrees: applicationData.degrees || [],
      licenses: applicationData.licenses || [],
    },
    experience: {
      yearsInIndustry: applicationData.yearsInIndustry || 0,
      previousClients: applicationData.previousClients || [],
      successStories: applicationData.successStories || [],
    },
    englishProficiency: applicationData.englishProficiency || 'fluent',
    communicationSample: applicationData.communicationSample || '',
    reviewerNotes: '',
    reviewedAt: null,
    reviewedBy: null,
  };
}

// ===== CHECK PRO ELIGIBILITY =====
export function checkProEligibility(seller, reviews = []) {
  const issues = [];
  const meets = [];

  // Rating check
  if (seller.avgRating < PRO_CONFIG.requirements.minRating) {
    issues.push(`Rating must be 4.9+. Current: ${seller.avgRating}`);
  } else {
    meets.push('Rating: ' + seller.avgRating);
  }

  // Orders check
  if (seller.totalOrders < PRO_CONFIG.requirements.minOrders) {
    issues.push(
      `Minimum 50 completed orders. Current: ${seller.totalOrders}`
    );
  } else {
    meets.push('Orders: ' + seller.totalOrders);
  }

  // Earnings check
  if (seller.totalEarnings < PRO_CONFIG.requirements.minEarnings) {
    issues.push(`$5,000+ earnings required. Current: $${seller.totalEarnings}`);
  } else {
    meets.push('Earnings: $' + seller.totalEarnings);
  }

  // Completion rate check
  if (seller.completionRate < PRO_CONFIG.requirements.minCompletionRate) {
    issues.push(
      `98%+ completion rate required. Current: ${(seller.completionRate * 100).toFixed(1)}%`
    );
  } else {
    meets.push(
      'Completion: ' + (seller.completionRate * 100).toFixed(1) + '%'
    );
  }

  // Response rate check
  if (seller.responseRate < PRO_CONFIG.requirements.minResponseRate) {
    issues.push(
      `95%+ response rate required. Current: ${(seller.responseRate * 100).toFixed(1)}%`
    );
  } else {
    meets.push('Response: ' + (seller.responseRate * 100).toFixed(1) + '%');
  }

  // Days active check
  const daysActive = Math.floor(
    (Date.now() - new Date(seller.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysActive < PRO_CONFIG.requirements.daysActive) {
    issues.push(`365+ days as seller required. Current: ${daysActive} days`);
  } else {
    meets.push('Experience: ' + daysActive + ' days');
  }

  const isEligible = issues.length === 0;

  return {
    isEligible,
    meetsRequirements: meets,
    issues,
    eligibilityPercentage: Math.round(
      (meets.length / (meets.length + issues.length)) * 100
    ),
  };
}

// ===== VETTING CHECKLIST =====
export function createVettingChecklist(applicationId) {
  return {
    applicationId,
    checks: [
      {
        id: 'portfolio',
        name: 'Professional Portfolio Review',
        status: 'pending',
        score: null,
        notes: '',
        completedAt: null,
      },
      {
        id: 'credentials',
        name: 'Credentials & Certifications',
        status: 'pending',
        score: null,
        notes: '',
        completedAt: null,
      },
      {
        id: 'english',
        name: 'English Communication Level',
        status: 'pending',
        score: null,
        notes: '',
        completedAt: null,
      },
      {
        id: 'delivery',
        name: 'Delivery Track Record',
        status: 'pending',
        score: null,
        notes: '',
        completedAt: null,
      },
      {
        id: 'experience',
        name: 'Industry Experience',
        status: 'pending',
        score: null,
        notes: '',
        completedAt: null,
      },
    ],
    overallScore: null,
    status: 'in_progress',
  };
}

// ===== COMPLETE VETTING CHECK =====
export function completeVettingCheck(
  checklist,
  checkId,
  score,
  notes = ''
) {
  const check = checklist.checks.find(c => c.id === checkId);
  if (!check) throw new Error('Check not found');

  if (score < 0 || score > 100) throw new Error('Score must be 0-100');

  check.status = score >= 70 ? 'passed' : 'needs_improvement';
  check.score = score;
  check.notes = notes;
  check.completedAt = new Date();

  // Calculate overall score
  const completedChecks = checklist.checks.filter(c => c.score !== null);
  if (completedChecks.length > 0) {
    const avgScore =
      completedChecks.reduce((sum, c) => sum + c.score, 0) / completedChecks.length;
    checklist.overallScore = Math.round(avgScore);

    // All checks complete?
    if (completedChecks.length === checklist.checks.length) {
      checklist.status = avgScore >= 70 ? 'approved' : 'rejected';
    }
  }

  return checklist;
}

// ===== APPROVE PRO APPLICATION =====
export function approveProApplication(application, checklist, approverNotes) {
  return {
    applicationId: application.id,
    sellerId: application.sellerId,
    status: 'approved',
    approvedAt: new Date(),
    vettingScore: checklist.overallScore,
    badge: PRO_CONFIG.badge,
    proBenefit: {
      dedicatedSupport: true,
      dedicatedAccountManager: true,
      advancedAnalytics: true,
      featuringInCatalog: true,
      dedicatedProSearchTab: true,
      higherPriceCeiling: true,
    },
    approverNotes,
    certificateUrl: `https://fiverr-pro/${application.sellerId}`,
  };
}

// ===== REJECT PRO APPLICATION =====
export function rejectProApplication(application, checklist, rejectionReason) {
  return {
    applicationId: application.id,
    sellerId: application.sellerId,
    status: 'rejected',
    rejectedAt: new Date(),
    vettingScore: checklist.overallScore,
    rejectionReason,
    failedChecks: checklist.checks
      .filter(c => c.status === 'needs_improvement')
      .map(c => ({ check: c.name, score: c.score, notes: c.notes })),
    canReapply: true,
    reapplyAfterDays: 30,
  };
}

// ===== PRO GIG CREATION =====
export function createProGig(gigData) {
  if (gigData.sellerLevel !== 'top_rated' && !gigData.isProCertified) {
    throw new Error('Only Pro-certified sellers can create Pro Gigs');
  }

  return {
    id: `pro_gig_${Date.now()}`,
    ...gigData,
    proBadge: true,
    basePrice: gigData.basePrice,
    // Pro gigs typically have higher price points
    priceNote: 'This is a Pro Gig - specialized expertise at premium rates',
    features: [
      ...gigData.features,
      'Dedicated Pro seller',
      'Premium quality assurance',
      'Priority support',
    ],
  };
}

// ===== PROJECT MANAGEMENT SERVICE =====
// Fiverr handles freelancer sourcing and QA for buyer
export function createProjectManagementService(buyerRequestData) {
  return {
    id: `pms_${Date.now()}`,
    buyerId: buyerRequestData.buyerId,
    categoryId: buyerRequestData.categoryId,
    projectDescription: buyerRequestData.projectDescription,
    budget: buyerRequestData.budget,
    deliveryDeadline: buyerRequestData.deliveryDeadline,
    requirementDetails: buyerRequestData.requirementDetails,
    status: 'seeking_freelancer',
    assignedAccountManager: null,
    createdAt: new Date(),
    serviceType: 'project_management',
    pmsPrice: calculateProjectManagementPrice(buyerRequestData.budget),
    pmsPercentage: 0.20, // 20% of project budget
  };
}

// ===== CALCULATE PMS PRICE =====
export function calculateProjectManagementPrice(projectBudget) {
  return Math.round(projectBudget * 0.20 * 100) / 100; // 20% of budget
}

// ===== ASSIGN ACCOUNT MANAGER =====
export function assignAccountManager(serviceId, accountManagerId) {
  return {
    serviceId,
    assignedAt: new Date(),
    accountManagerId,
    responsibilities: [
      'Freelancer sourcing',
      'Project briefing',
      'Quality assurance',
      'Deadline management',
      'Payment coordination',
    ],
    status: 'active',
  };
}

// ===== PRO TIER EXPORTS =====
export const ProTier = {
  createApplication: createProApplication,
  checkEligibility: checkProEligibility,
  createVettingChecklist,
  completeCheck: completeVettingCheck,
  approveApplication: approveProApplication,
  rejectApplication: rejectProApplication,
  createGig: createProGig,
  createProjectService: createProjectManagementService,
  calculatePmsPrice,
  assignAccountManager,
};

export default ProTier;
