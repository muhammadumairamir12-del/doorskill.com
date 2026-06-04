// ===== DATABASE SCHEMA & DATA MODEL =====
// Core entities, relationships, and data structures for DoorSkill

// ===== USER ENTITY =====
export const USER_SCHEMA = {
  id: 'string (UUID)',
  username: 'string (unique, 3-30 chars)',
  email: 'string (unique, verified)',
  password_hash: 'string (bcrypt)',
  role: 'enum: buyer | seller | both',
  seller_level: 'enum: new | level_1 | level_2 | top_rated | pro',
  verified: 'boolean',
  identity_verified: 'boolean',
  verification_badges: 'array: id_verified | selfie_verified | business_verified',
  trust_score: 'integer (0-100)',
  profile: {
    display_name: 'string',
    avatar_url: 'string',
    bio: 'string (max 500 chars)',
    country: 'string',
    language: 'string',
    timezone: 'string'
  },
  seller_profile: {
    description: 'string',
    response_rate: 'number (0-1)',
    response_time_minutes: 'integer',
    on_time_rate: 'number (0-1)',
    completion_rate: 'number (0-1)',
    cancellation_rate: 'number (0-1)',
    average_rating: 'number (0-5)',
    total_reviews: 'integer',
    total_earned: 'number',
    days_active: 'integer',
    total_orders: 'integer'
  },
  account: {
    status: 'enum: active | suspended | banned',
    balance: 'number',
    pending_clearance: 'number',
    withdrawal_methods: 'array',
    preferred_withdrawal: 'string'
  },
  settings: {
    notifications: 'object',
    privacy: 'object',
    seller_plus: 'boolean'
  },
  created_at: 'timestamp',
  updated_at: 'timestamp',
  last_login: 'timestamp'
};

// ===== GIG ENTITY =====
export const GIG_SCHEMA = {
  id: 'string (UUID)',
  seller_id: 'string (FK → User.id)',
  title: 'string (7-70 chars)',
  slug: 'string (unique, generated from title)',
  category_id: 'string (FK → Category.id)',
  subcategory: 'string',
  description: 'string (max 1200 chars)',
  status: 'enum: active | paused | draft | deleted',
  visibility: 'enum: public | private',
  
  // Pricing tiers (always 3)
  packages: [
    {
      id: 'string (UUID)',
      tier: 'enum: basic | standard | premium',
      price: 'number',
      delivery_days: 'integer (1-60)',
      revisions: 'integer (-1 = unlimited)',
      description: 'string',
      features: 'array of strings',
      extras: 'array'
    }
  ],
  
  // Search & visibility
  tags: 'array (5-8 tags)',
  keywords: 'array',
  seo_title: 'string',
  seo_description: 'string',
  
  // Media
  gallery: {
    images: 'array of URLs',
    video_url: 'string (optional)'
  },
  
  // Metrics
  impressions: 'integer',
  clicks: 'integer',
  orders_completed: 'integer',
  orders_active: 'integer',
  orders_cancelled: 'integer',
  conversion_rate: 'number (calculated)',
  average_rating: 'number (0-5)',
  review_count: 'integer',
  
  // Ranking data
  ranking_score: 'number (0-100, calculated)',
  promoted: 'boolean',
  promoted_budget: 'number',
  promoted_cost_per_click: 'number',
  
  // Status
  created_at: 'timestamp',
  updated_at: 'timestamp',
  last_edited: 'timestamp'
};

// ===== PACKAGE ENTITY =====
export const PACKAGE_SCHEMA = {
  id: 'string (UUID)',
  gig_id: 'string (FK → Gig.id)',
  tier: 'enum: basic | standard | premium',
  price: 'number',
  delivery_days: 'integer (1-60)',
  revisions: 'integer (-1 = unlimited)',
  description: 'string',
  features: 'array of strings',
  extras: [
    {
      id: 'string',
      name: 'string',
      price: 'number',
      duration: 'integer (days added)'
    }
  ],
  created_at: 'timestamp'
};

// ===== ORDER ENTITY =====
export const ORDER_SCHEMA = {
  id: 'string (UUID)',
  order_number: 'string (e.g., "#12345")',
  buyer_id: 'string (FK → User.id)',
  seller_id: 'string (FK → User.id)',
  gig_id: 'string (FK → Gig.id)',
  package_id: 'string (FK → Package.id)',
  
  status: 'enum: pending_requirements | in_progress | delivered | under_review | completed | cancelled | disputed',
  
  // Financial
  package_price: 'number',
  extras: 'array (additional charges)',
  total_price: 'number',
  buyer_fee: 'number (5.5% + $2.50)',
  seller_commission: 'number (calculated by level)',
  seller_payout: 'number',
  
  // Dates
  created_at: 'timestamp',
  accepted_at: 'timestamp',
  deadline_at: 'timestamp',
  delivered_at: 'timestamp',
  completed_at: 'timestamp',
  deadline_extended_until: 'timestamp (if extended)',
  
  // Order details
  buyer_requirements: 'object',
  buyer_requirements_submitted_at: 'timestamp',
  
  // Revisions
  revisions_requested: 'integer',
  revisions_remaining: 'integer',
  last_revision_requested_at: 'timestamp',
  
  // Delivery
  delivery_status: 'enum: pending | submitted | approved | requesting_revision | reopened',
  messages_count: 'integer',
  
  // Cancellation
  cancellation_reason: 'string (if cancelled)',
  cancellation_initiated_by: 'enum: buyer | seller | system | support',
  cancellation_at: 'timestamp',
  
  // Dispute
  disputed: 'boolean',
  dispute_raised_at: 'timestamp',
  dispute_status: 'enum: open | in_review | resolved | closed'
};

// ===== MESSAGE ENTITY =====
export const MESSAGE_SCHEMA = {
  id: 'string (UUID)',
  thread_id: 'string (UUID, FK → Order.id)',
  sender_id: 'string (FK → User.id)',
  recipient_id: 'string (FK → User.id)',
  
  body: 'string (max 5000 chars)',
  attachments: [
    {
      id: 'string',
      url: 'string',
      type: 'enum: image | document | file',
      size: 'integer (bytes)',
      name: 'string'
    }
  ],
  
  status: 'enum: sent | delivered | read',
  delivered_at: 'timestamp',
  read_at: 'timestamp',
  
  created_at: 'timestamp',
  edited_at: 'timestamp'
};

// ===== REVIEW ENTITY =====
export const REVIEW_SCHEMA = {
  id: 'string (UUID)',
  order_id: 'string (FK → Order.id)',
  reviewer_id: 'string (FK → User.id)',
  target_id: 'string (FK → User.id)',
  review_type: 'enum: buyer_to_seller | seller_to_buyer',
  
  rating: 'integer (1-5)',
  sub_ratings: {
    communication: 'integer (1-5)',
    service: 'integer (1-5)',
    buy_again: 'integer (1-5)' // only for buyer reviews
  },
  
  comment: 'string (max 1000 chars)',
  anonymous: 'boolean',
  
  visible: 'boolean (false if both haven\'t reviewed)',
  
  // Seller reply (only in seller reviews)
  seller_reply: 'string',
  seller_reply_at: 'timestamp',
  
  // Flagging
  flagged: 'boolean',
  flag_reason: 'string (if flagged)',
  
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

// ===== TRANSACTION ENTITY =====
export const TRANSACTION_SCHEMA = {
  id: 'string (UUID)',
  order_id: 'string (FK → Order.id)',
  
  type: 'enum: charge | payout | refund | adjustment',
  amount: 'number (gross amount)',
  fee: 'number (if charge)',
  net: 'number (amount - fee)',
  
  // Financial details
  buyer_id: 'string (FK → User.id, if charge)',
  seller_id: 'string (FK → User.id, if payout)',
  payment_method: 'string (if charge)',
  
  status: 'enum: pending | cleared | failed | refunded',
  cleared_at: 'timestamp',
  clearance_days: 'integer (14 or 7 for Top Rated)',
  
  // For payouts
  withdrawal_method: 'string (paypal | bank | card | payoneer)',
  withdrawal_at: 'timestamp',
  
  created_at: 'timestamp'
};

// ===== CATEGORY ENTITY =====
export const CATEGORY_SCHEMA = {
  id: 'string (UUID)',
  parent_id: 'string (FK → Category.id, null if top-level)',
  name: 'string',
  slug: 'string (unique)',
  icon: 'string (emoji or icon name)',
  description: 'string',
  position: 'integer (sort order)',
  
  // Service-specific metadata
  metadata_schema: {
    // Custom fields for filtering (category-specific)
    // Example: for "Logo Design", might have: style, format, revisions_standard
    fields: [
      {
        name: 'string',
        type: 'enum: text | select | multiselect | number',
        required: 'boolean',
        options: 'array (if select/multiselect)'
      }
    ]
  },
  
  popular_tags: 'array (trending in this category)',
  gig_count: 'integer (calculated)'
};

// ===== NOTIFICATION ENTITY =====
export const NOTIFICATION_SCHEMA = {
  id: 'string (UUID)',
  user_id: 'string (FK → User.id)',
  
  type: 'enum: message | order_placed | requirements_submitted | delivery_made | revision_requested | order_completed | review_received | level_change | withdrawal_processed | promoted_budget_low | dispute_update | seller_reply',
  
  title: 'string',
  message: 'string',
  data: 'object (context-specific)',
  
  // Channels sent to
  channels: 'array: in_app | email | push | sms',
  
  read: 'boolean',
  read_at: 'timestamp',
  
  action_url: 'string (where to navigate)',
  
  created_at: 'timestamp'
};

// ===== DISPUTE ENTITY =====
export const DISPUTE_SCHEMA = {
  id: 'string (UUID)',
  order_id: 'string (FK → Order.id)',
  
  initiated_by: 'enum: buyer | seller',
  reason: 'string',
  description: 'string (max 2000 chars)',
  
  status: 'enum: open | seller_responding | in_review | negotiation | resolved | closed',
  
  buyer_evidence: [
    {
      type: 'enum: text | image | file',
      data: 'string or URL'
    }
  ],
  
  seller_response: 'string',
  seller_responded_at: 'timestamp',
  
  // CS review
  reviewed_by: 'string (support staff ID)',
  review_notes: 'string',
  final_decision: 'enum: buyer_wins | seller_wins | partial_refund | resolved_mutual',
  
  created_at: 'timestamp',
  resolved_at: 'timestamp'
};

// ===== CANCELLATION ENTITY =====
export const CANCELLATION_SCHEMA = {
  id: 'string (UUID)',
  order_id: 'string (FK → Order.id)',
  
  type: 'enum: mutual | buyer_initiated | seller_initiated | auto | support',
  reason: 'string',
  
  initiated_by: 'enum: buyer | seller | system | support',
  requested_at: 'timestamp',
  
  // For buyer-initiated, seller has 2 days to respond
  response_deadline: 'timestamp (if buyer-initiated)',
  seller_response: 'enum: accepted | rejected',
  seller_responded_at: 'timestamp',
  
  // Resolution
  approved_at: 'timestamp',
  approved_by: 'enum: buyer | seller | system',
  
  // Refund
  refund_amount: 'number',
  refund_issued_at: 'timestamp',
  refund_status: 'enum: pending | completed | failed',
  
  // Impact
  affects_cancellation_rate: 'boolean',
  
  created_at: 'timestamp'
};

// ===== DATABASE RELATIONSHIPS =====
export const RELATIONSHIPS = {
  'User 1→N Gig': 'One seller creates many gigs',
  'Gig 1→3 Package': 'One gig has exactly 3 pricing tiers',
  'Gig 1→N Order': 'One gig can have many orders',
  'Package 1→N Order': 'One package tier can have many orders',
  'Order 1→N Message': 'One order has one message thread',
  'Order 1→2 Review': 'One order has 2 reviews (buyer→seller, seller→buyer)',
  'Order 1→1 Transaction': 'One order has one financial transaction record',
  'User 1→N Notification': 'One user can have many notifications',
  'Order 1→1 Dispute': 'One order can have at most one active dispute',
  'Order 1→N Cancellation': 'One order can have cancellation records',
  'Category N→N Gig': 'Many gigs in many categories'
};

// ===== CORE FUNCTIONS =====

export function createUser(userData) {
  return {
    id: generateUUID(),
    username: userData.username,
    email: userData.email,
    password_hash: hashPassword(userData.password),
    role: userData.role || 'buyer',
    seller_level: 'new',
    verified: false,
    identity_verified: false,
    verification_badges: [],
    trust_score: 50,
    profile: {
      display_name: userData.displayName || '',
      avatar_url: '',
      bio: '',
      country: userData.country || '',
      language: userData.language || 'en',
      timezone: 'UTC'
    },
    seller_profile: {
      description: '',
      response_rate: 0,
      response_time_minutes: 0,
      on_time_rate: 0,
      completion_rate: 0,
      cancellation_rate: 0,
      average_rating: 0,
      total_reviews: 0,
      total_earned: 0,
      days_active: 0,
      total_orders: 0
    },
    account: {
      status: 'active',
      balance: 0,
      pending_clearance: 0,
      withdrawal_methods: [],
      preferred_withdrawal: ''
    },
    settings: {
      notifications: {
        messages: { in_app: true, email: true, push: true, sms: false },
        orders: { in_app: true, email: true, push: true, sms: false },
        reviews: { in_app: true, email: true, push: false, sms: false },
        level_changes: { in_app: true, email: true, push: false, sms: false }
      },
      privacy: {
        profile_public: true,
        show_orders: false,
        show_earnings: false
      },
      seller_plus: false
    },
    created_at: new Date(),
    updated_at: new Date(),
    last_login: new Date()
  };
}

export function createGig(gigData, sellerId) {
  return {
    id: generateUUID(),
    seller_id: sellerId,
    title: gigData.title,
    slug: generateSlug(gigData.title),
    category_id: gigData.categoryId,
    subcategory: gigData.subcategory,
    description: gigData.description,
    status: 'draft',
    visibility: 'private',
    packages: gigData.packages || createDefaultPackages(),
    tags: gigData.tags || [],
    keywords: gigData.keywords || [],
    seo_title: gigData.title,
    seo_description: gigData.description.substring(0, 160),
    gallery: {
      images: gigData.images || [],
      video_url: gigData.videoUrl || ''
    },
    impressions: 0,
    clicks: 0,
    orders_completed: 0,
    orders_active: 0,
    orders_cancelled: 0,
    conversion_rate: 0,
    average_rating: 0,
    review_count: 0,
    ranking_score: 0,
    promoted: false,
    promoted_budget: 0,
    promoted_cost_per_click: 0.05,
    created_at: new Date(),
    updated_at: new Date(),
    last_edited: new Date()
  };
}

export function createOrder(orderData) {
  const totalPrice = orderData.packagePrice + (orderData.extras?.reduce((sum, e) => sum + e.price, 0) || 0);
  const buyerFee = totalPrice * 0.055 + 2.50;
  const sellerCommission = totalPrice * orderData.commissionRate;
  const sellerPayout = totalPrice - sellerCommission;
  
  return {
    id: generateUUID(),
    order_number: generateOrderNumber(),
    buyer_id: orderData.buyerId,
    seller_id: orderData.sellerId,
    gig_id: orderData.gigId,
    package_id: orderData.packageId,
    status: 'pending_requirements',
    package_price: orderData.packagePrice,
    extras: orderData.extras || [],
    total_price: totalPrice,
    buyer_fee: buyerFee,
    seller_commission: sellerCommission,
    seller_payout: sellerPayout,
    created_at: new Date(),
    accepted_at: null,
    deadline_at: new Date(Date.now() + orderData.deliveryDays * 24 * 60 * 60 * 1000),
    delivered_at: null,
    completed_at: null,
    deadline_extended_until: null,
    buyer_requirements: {},
    buyer_requirements_submitted_at: null,
    revisions_requested: 0,
    revisions_remaining: orderData.revisions,
    last_revision_requested_at: null,
    delivery_status: 'pending',
    messages_count: 0,
    cancellation_reason: null,
    cancellation_initiated_by: null,
    cancellation_at: null,
    disputed: false,
    dispute_raised_at: null,
    dispute_status: null
  };
}

export function createDefaultPackages() {
  return [
    {
      id: generateUUID(),
      tier: 'basic',
      price: 5,
      delivery_days: 3,
      revisions: 1,
      description: 'Basic package',
      features: [],
      extras: []
    },
    {
      id: generateUUID(),
      tier: 'standard',
      price: 15,
      delivery_days: 5,
      revisions: 2,
      description: 'Standard package',
      features: [],
      extras: []
    },
    {
      id: generateUUID(),
      tier: 'premium',
      price: 50,
      delivery_days: 7,
      revisions: 3,
      description: 'Premium package',
      features: [],
      extras: []
    }
  ];
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

export function generateOrderNumber() {
  return '#' + Math.floor(100000 + Math.random() * 900000);
}

export function hashPassword(password) {
  // In production, use bcrypt: bcrypt.hashSync(password, 10)
  return 'hashed_' + password;
}

export function validateSchema(data, schema) {
  const errors = [];
  Object.keys(schema).forEach(key => {
    if (!(key in data)) {
      errors.push(`Missing required field: ${key}`);
    }
  });
  return errors;
}
