// ===== CATEGORY TAXONOMY & BRIEFS SYSTEM =====
// Top-level categories with 5-50 subcategories
// Buyer Briefs (AI-matched to relevant sellers)

export const CATEGORIES_2026 = {
  graphics_design: {
    id: 'graphics_design',
    name: 'Graphics & Design',
    icon: '🎨',
    subcategories: [
      { id: 'logo_design', name: 'Logo Design', filters: ['fileFormat', 'industry', 'designStyle'] },
      { id: 'branding', name: 'Branding', filters: ['brandType', 'complexity'] },
      { id: 'web_design', name: 'Web Design', filters: ['designType', 'platform'] },
      { id: 'ui_ux', name: 'UI/UX Design', filters: ['designType', 'platform'] },
      { id: 'print_design', name: 'Print Design', filters: ['designType', 'materials'] },
      { id: 'package_design', name: 'Packaging Design', filters: ['industry', 'materials'] },
      { id: 'fashion_design', name: 'Fashion Design', filters: ['type', 'style'] },
      { id: 'illustration', name: 'Illustration', filters: ['illustrationStyle', 'complexity'] },
    ],
  },
  programming_tech: {
    id: 'programming_tech',
    name: 'Programming & Tech',
    icon: '💻',
    subcategories: [
      { id: 'web_development', name: 'Web Development', filters: ['technology', 'complexity'] },
      { id: 'mobile_app', name: 'Mobile App Development', filters: ['platform', 'complexity'] },
      { id: 'desktop_app', name: 'Desktop Software', filters: ['technology', 'platform'] },
      { id: 'backend', name: 'Backend Development', filters: ['technology', 'framework'] },
      { id: 'database', name: 'Database Design', filters: ['databaseType', 'complexity'] },
      { id: 'cloud', name: 'Cloud & DevOps', filters: ['platform', 'service'] },
      { id: 'cybersecurity', name: 'Cybersecurity', filters: ['securityType', 'scope'] },
      { id: 'ai_ml', name: 'AI & Machine Learning', filters: ['modelType', 'framework'] },
    ],
  },
  digital_marketing: {
    id: 'digital_marketing',
    name: 'Digital Marketing',
    icon: '📊',
    subcategories: [
      { id: 'seo', name: 'SEO', filters: ['seoType', 'industry'] },
      { id: 'sem', name: 'SEM (Google Ads)', filters: ['adType', 'budget'] },
      { id: 'social_media', name: 'Social Media Marketing', filters: ['platform', 'contentType'] },
      { id: 'email_marketing', name: 'Email Marketing', filters: ['campaignType', 'scale'] },
      { id: 'content_marketing', name: 'Content Marketing', filters: ['contentType', 'industry'] },
      { id: 'analytics', name: 'Analytics & Reporting', filters: ['platform', 'scope'] },
    ],
  },
  video_animation: {
    id: 'video_animation',
    name: 'Video & Animation',
    icon: '🎬',
    subcategories: [
      { id: 'video_editing', name: 'Video Editing', filters: ['videoType', 'style'] },
      { id: 'animation', name: 'Animation', filters: ['animationType', 'complexity'] },
      { id: '2d_animation', name: '2D Animation', filters: ['style', 'length'] },
      { id: '3d_animation', name: '3D Animation', filters: ['style', 'complexity'] },
      { id: 'motion_graphics', name: 'Motion Graphics', filters: ['style', 'industry'] },
      { id: 'explainer_video', name: 'Explainer Video', filters: ['style', 'length'] },
      { id: 'video_production', name: 'Video Production', filters: ['type', 'scale'] },
    ],
  },
  writing_translation: {
    id: 'writing_translation',
    name: 'Writing & Translation',
    icon: '✍️',
    subcategories: [
      { id: 'copywriting', name: 'Copywriting', filters: ['contentType', 'industry'] },
      { id: 'article_writing', name: 'Article Writing', filters: ['niche', 'length'] },
      { id: 'translation', name: 'Translation', filters: ['languagePair', 'industry'] },
      { id: 'proofreading', name: 'Proofreading & Editing', filters: ['documentType', 'complexity'] },
      { id: 'content_writing', name: 'Content Writing', filters: ['contentType', 'platform'] },
      { id: 'blog_writing', name: 'Blog Writing', filters: ['niche', 'seoRequired'] },
      { id: 'book_writing', name: 'Book Writing', filters: ['genre', 'length'] },
    ],
  },
  music_audio: {
    id: 'music_audio',
    name: 'Music & Audio',
    icon: '🎵',
    subcategories: [
      { id: 'music_production', name: 'Music Production', filters: ['genre', 'style'] },
      { id: 'voiceover', name: 'Voiceover', filters: ['language', 'tone'] },
      { id: 'audio_editing', name: 'Audio Editing', filters: ['audioType', 'complexity'] },
      { id: 'sound_design', name: 'Sound Design', filters: ['type', 'complexity'] },
      { id: 'mixing_mastering', name: 'Mixing & Mastering', filters: ['musicType', 'quality'] },
      { id: 'podcasting', name: 'Podcasting', filters: ['serviceType', 'complexity'] },
    ],
  },
  business_finance: {
    id: 'business_finance',
    name: 'Business & Finance',
    icon: '💼',
    subcategories: [
      { id: 'business_consulting', name: 'Business Consulting', filters: ['consultingType', 'industry'] },
      { id: 'financial_planning', name: 'Financial Planning', filters: ['planningType', 'scope'] },
      { id: 'accounting', name: 'Accounting & Bookkeeping', filters: ['accountingType', 'volume'] },
      { id: 'tax_assistance', name: 'Tax Assistance', filters: ['taxType', 'jurisdiction'] },
      { id: 'startup_advice', name: 'Startup Advice', filters: ['stage', 'industry'] },
    ],
  },
  ai_services: {
    id: 'ai_services',
    name: 'AI Services',
    icon: '🤖',
    subcategories: [
      { id: 'ai_chatbot', name: 'AI Chatbots', filters: ['platform', 'complexity'] },
      { id: 'ai_automation', name: 'AI Automation', filters: ['processType', 'complexity'] },
      { id: 'ai_training', name: 'AI Model Training', filters: ['modelType', 'dataSize'] },
      { id: 'ai_consulting', name: 'AI Consulting', filters: ['useCase', 'industry'] },
    ],
  },
};

// ===== CATEGORY PAGE DATA =====
export function getCategoryPageData(categoryId) {
  const category = CATEGORIES_2026[categoryId];
  if (!category) return null;

  return {
    categoryId,
    categoryName: category.name,
    categoryIcon: category.icon,
    heroTitle: `${category.name} Services`,
    heroDescription: `Browse top-rated ${category.name.toLowerCase()} professionals`,
    trendingTags: getTrendingTagsForCategory(categoryId),
    subcategories: category.subcategories,
    filters: buildFilterPanel(category.subcategories),
  };
}

// ===== GET TRENDING TAGS =====
export function getTrendingTagsForCategory(categoryId) {
  // In real implementation, this would be calculated from actual search data
  const trendingMap = {
    graphics_design: ['logo', 'branding', 'ui/ux', 'web design', 'illustration'],
    programming_tech: ['web development', 'mobile app', 'python', 'react', 'node.js'],
    digital_marketing: ['seo', 'google ads', 'social media', 'content marketing', 'email'],
    video_animation: ['video editing', '2d animation', '3d', 'motion graphics', 'explainer'],
  };

  return trendingMap[categoryId] || [];
}

// ===== BUILD FILTER PANEL =====
export function buildFilterPanel(subcategories) {
  const filterNames = new Set();
  subcategories.forEach(sub => {
    sub.filters.forEach(f => filterNames.add(f));
  });

  return Array.from(filterNames).map(filterName => ({
    name: filterName,
    label: formatFilterLabel(filterName),
    values: [], // In real implementation, populated from actual gigs
  }));
}

// ===== FORMAT FILTER LABEL =====
function formatFilterLabel(filterName) {
  const labels = {
    fileFormat: 'File Format',
    industry: 'Industry',
    designStyle: 'Design Style',
    complexity: 'Complexity',
    technology: 'Technology',
    platform: 'Platform',
    databaseType: 'Database Type',
    seoType: 'SEO Type',
    contentType: 'Content Type',
    animationType: 'Animation Type',
    languagePair: 'Language Pair',
    genre: 'Genre',
  };

  return labels[filterName] || formatCamelCase(filterName);
}

// ===== FORMAT CAMEL CASE =====
function formatCamelCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str[0].toUpperCase())
    .trim();
}

// ===== BUYER BRIEFS SYSTEM =====
// Buyers post project briefs, AI matches to sellers, sellers respond with quotes

export function createBuyerBrief(buyerId, briefData) {
  return {
    id: `brief_${Date.now()}`,
    buyerId,
    categoryId: briefData.categoryId,
    subcategoryId: briefData.subcategoryId,
    title: briefData.title,
    description: briefData.description,
    budget: {
      minAmount: briefData.budgetMin || 0,
      maxAmount: briefData.budgetMax || 0,
      currency: 'USD',
    },
    deliveryDays: briefData.deliveryDays || 7,
    attachments: briefData.attachments || [],
    requirements: briefData.requirements || [],
    createdAt: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    status: 'open', // open, closed, pending
    responseCount: 0,
    selectedSellerId: null,
  };
}

// ===== AI BRIEF MATCHING =====
// Match brief to relevant sellers based on skills, category, and ratings
export function matchBriefToSellers(brief, sellers, maxMatches = 20) {
  const relevantSellers = sellers
    .filter(
      seller =>
        seller.specialties?.includes(brief.subcategoryId) &&
        seller.avgRating >= 4.5 &&
        seller.sellerLevel !== 'new'
    )
    .map(seller => ({
      ...seller,
      matchScore: calculateBriefMatchScore(brief, seller),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxMatches);

  return relevantSellers;
}

// ===== CALCULATE BRIEF MATCH SCORE =====
export function calculateBriefMatchScore(brief, seller) {
  let score = 0;

  // Rating (up to 25 points)
  score += (seller.avgRating / 5) * 25;

  // Level (up to 20 points)
  const levelScores = {
    new: 5,
    level_1: 10,
    level_2: 15,
    top_rated: 20,
  };
  score += levelScores[seller.sellerLevel] || 0;

  // Specialty match (up to 30 points)
  if (seller.specialties?.includes(brief.subcategoryId)) score += 30;
  if (seller.specialties?.includes(brief.categoryId)) score += 15;

  // Experience (up to 15 points)
  if (seller.totalOrders >= 100) score += 15;
  else if (seller.totalOrders >= 50) score += 10;
  else if (seller.totalOrders >= 20) score += 5;

  // Response rate (up to 10 points)
  score += (seller.responseRate || 0) * 10;

  return Math.min(score, 100);
}

// ===== SEND QUOTE TO BRIEF =====
export function sendQuoteToBrief(briefId, sellerId, quoteData) {
  return {
    id: `quote_${Date.now()}`,
    briefId,
    sellerId,
    quotedPrice: quoteData.quotedPrice,
    deliveryDays: quoteData.deliveryDays || 7,
    description: quoteData.description || '',
    attachments: quoteData.attachments || [],
    createdAt: new Date(),
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    status: 'pending',
  };
}

// ===== ACCEPT BRIEF QUOTE =====
export function acceptBriefQuote(briefId, quoteId, buyerId) {
  return {
    briefId,
    quoteId,
    buyerId,
    orderId: `order_${Date.now()}`,
    acceptedAt: new Date(),
    status: 'accepted',
    message: 'Quote accepted. Order created and project started.',
  };
}

// ===== CATEGORY & BRIEF EXPORTS =====
export const CategorySystem = {
  getAllCategories: () => CATEGORIES_2026,
  getCategoryPage: getCategoryPageData,
  getTrendingTags: getTrendingTagsForCategory,
  createBrief: createBuyerBrief,
  matchSellers: matchBriefToSellers,
  calculateMatchScore: calculateBriefMatchScore,
  sendQuote: sendQuoteToBrief,
  acceptQuote: acceptBriefQuote,
};

export default CategorySystem;
