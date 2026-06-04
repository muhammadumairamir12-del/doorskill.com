# DoorSkill Firebase Firestore Schema

This document defines the complete Firestore database schema for the DoorSkill marketplace platform.

---

## Collections Overview

### 1. users
Stores buyer and seller profiles with dual-role support.

```
Collection: users
Document ID: {uid} (Firebase Auth UID)

Fields:
  id: string (uid)
  email: string
  displayName: string
  profileImage: string (URL)
  bio: string
  country: string
  language: string[]
  phone: string (optional)
  
  // Buyer fields
  buyerRating: number (0-5, calculated)
  buyerReviews: number (count)
  
  // Seller fields
  sellerLevel: string (new | level1 | level2 | top_rated | pro)
  sellerRating: number (0-5, calculated)
  sellerReviews: number (count)
  sellerTagline: string
  sellerTitle: string
  
  // Seller metrics (60-day rolling)
  completionRate: number (%)
  onTimeRate: number (%)
  responseRate: number (%)
  cancellationRate: number (%)
  avgResponseTime: number (minutes)
  
  // Account
  createdAt: timestamp
  updatedAt: timestamp
  lastActive: timestamp
  status: string (active | suspended | banned)
  identityVerified: boolean
  emailVerified: boolean
  
  // Subscription
  isPro: boolean
  proAppliedAt: timestamp (optional)
  proApprovedAt: timestamp (optional)
  hasSellerPlus: boolean
  sellerPlusExpiry: timestamp (optional)
```

---

### 2. gigs
Pre-packaged services offered by sellers.

```
Collection: gigs
Document ID: auto-generated (e.g., gig_abc123xyz)

Fields:
  id: string
  sellerId: string (reference to users/{sellerId})
  
  // Basic info
  title: string
  category: string (e.g., graphics-design)
  subcategory: string (e.g., logo-design)
  description: string (long form)
  tags: string[] (5-10 tags for search)
  
  // Media
  thumbnail: string (URL, main image)
  gallery: string[] (URLs to images/videos)
  
  // Packages (3-tier system)
  packages: [
    {
      id: string (basic | standard | premium)
      name: string
      description: string
      price: number (in USD)
      deliveryDays: number
      revisions: number (-1 = unlimited)
      features: string[] (bullet points)
      extras: [
        {
          name: string
          price: number
        }
      ]
    }
  ]
  
  // FAQs
  faqs: [
    {
      question: string
      answer: string
    }
  ]
  
  // Requirements
  requirements: [
    {
      id: string
      title: string
      type: string (text | select | file)
      placeholder: string
      required: boolean
      options: string[] (for select type)
    }
  ]
  
  // SEO & visibility
  status: string (active | paused | denied)
  featured: boolean
  promoted: boolean
  
  // Analytics
  impressions: number (total views)
  clicks: number (detail page opens)
  orders: number (total completed)
  
  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
  pausedAt: timestamp (optional)
  
  // Search
  searchKeywords: string (lowercase combined for full-text search)
```

---

### 3. packages
Legacy collection (packages data now embedded in gigs).

```
Collection: packages (DEPRECATED - use gigs.packages array)
```

---

### 4. orders
Purchase transactions with complete lifecycle.

```
Collection: orders
Document ID: auto-generated (e.g., order_xyz789abc)

Fields:
  id: string
  buyerId: string (reference to users/{buyerId})
  sellerId: string (reference to users/{sellerId})
  gigId: string (reference to gigs/{gigId})
  
  // Service details
  packageId: string (basic | standard | premium)
  packagePrice: number
  extras: [
    {
      name: string
      price: number
    }
  ]
  
  // Pricing breakdown
  subtotal: number
  platformFee: number (5.5% + $2.50 if < $75)
  total: number
  
  // Buyer requirements (pre-order form responses)
  requirements: {
    [requirementId]: string | string[] (response value)
  }
  specialInstructions: string
  deliveryAddress: {
    fullName: string
    address: string
    city: string
    country: string
  }
  
  // Status workflow
  status: string (
    pending_requirements |
    in_progress |
    delivered |
    under_review |
    completed |
    cancelled |
    disputed
  )
  
  // Timeline
  createdAt: timestamp
  requirementsSubmittedAt: timestamp (optional)
  deliveryDate: timestamp (expected)
  deliveredAt: timestamp (optional)
  reviewDueAt: timestamp (3 days after delivered)
  completedAt: timestamp (optional)
  cancelledAt: timestamp (optional)
  
  // Delivery
  deliveryFiles: [
    {
      fileName: string
      fileUrl: string
      uploadedAt: timestamp
    }
  ]
  
  // Revisions
  revisionsRequested: number (count)
  revisionsLimit: number (from package)
  latestRevisionRequestAt: timestamp (optional)
  
  // Review status (blind review)
  buyerReviewSubmitted: boolean
  sellerReviewSubmitted: boolean
  buyerReviewId: string (reference to reviews/{reviewId}, optional)
  sellerReviewId: string (reference to reviews/{reviewId}, optional)
  reviewsUnlockedAt: timestamp (when both reviewed or 10 days passed)
  
  // Cancellation
  cancelReason: string (optional)
  cancelInitiatedBy: string (optional - buyer | seller)
  cancellationDispute: boolean
  
  // On-time tracking
  wasLate: boolean (calculated: deliveredAt > deliveryDate)
```

---

### 5. reviews
Two-sided rating system with blind reviews.

```
Collection: reviews
Document ID: auto-generated (e.g., review_abc456def)

Fields:
  id: string
  orderId: string (reference to orders/{orderId})
  
  // Reviewer info
  reviewerId: string (buyer or seller)
  revieweeId: string (opposite party)
  
  // Rating
  overallRating: number (1-5 stars)
  communicationRating: number (1-5)
  descriptionAccuracyRating: number (1-5)
  wouldRecommend: boolean
  
  // Written content
  comment: string (optional, max 1000 chars)
  isAnonymous: boolean (default: true)
  
  // Seller response (if reviewer was buyer)
  sellerResponse: string (optional, one response per review)
  sellerResponseAt: timestamp (optional)
  
  // Status (blind review)
  isVisible: boolean (false until both reviewed or 10 days passed)
  
  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
```

---

### 6. messages
Real-time messaging threads per order.

```
Collection: messages
Document ID: auto-generated (e.g., msg_xyz123abc)

Fields:
  id: string
  orderId: string (reference to orders/{orderId})
  
  // Sender
  senderId: string (reference to users/{senderId})
  senderName: string (denormalized)
  senderAvatar: string (denormalized)
  
  // Content
  text: string
  attachments: [
    {
      fileName: string
      fileUrl: string
      fileType: string
    }
  ]
  
  // Status
  isRead: boolean
  readAt: timestamp (optional)
  
  // Timestamps
  createdAt: timestamp
  
  // Subcollection indices
  // Parent: orders/{orderId}/messages
  // Allows efficient querying per order
```

---

### 7. transactions
Payment records for all charges and payouts.

```
Collection: transactions
Document ID: auto-generated (e.g., txn_abc789xyz)

Fields:
  id: string
  orderId: string (reference to orders/{orderId})
  
  // Parties
  buyerId: string
  sellerId: string
  
  // Amount breakdown
  amount: number (order total)
  platformFee: number (5.5% + $2.50)
  sellerPayout: number (amount - fee)
  
  // Type
  type: string (charge | payout)
  
  // Payment method
  paymentMethod: string (stripe_card | stripe_bank | jazzcash | easypaisa)
  stripeChargeId: string (optional)
  stripePayout: string (optional)
  
  // Status
  status: string (
    pending |
    completed |
    failed |
    refunded |
    on_hold (for clearance period)
  )
  
  // Clearance period (funds held)
  chargedAt: timestamp
  releasedAt: timestamp (optional - after clearance period)
  clearanceDays: number (14 normal, 7 for Top Rated)
  
  // Refund (if applicable)
  refundReason: string (optional)
  refundedAt: timestamp (optional)
  
  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
```

---

### 8. seller_analytics
Aggregated seller performance metrics.

```
Collection: seller_analytics
Document ID: {sellerId}_{period} (e.g., user123_202401)

Fields:
  id: string
  sellerId: string
  period: string (YYYYMM format)
  
  // Impressions & clicks
  impressions: number
  clicks: number
  conversionRate: number (%) = orders / clicks
  
  // Order metrics
  ordersCreated: number
  ordersCompleted: number
  ordersCancelled: number
  ordersDisputed: number
  
  // Revenue
  revenueGross: number (before fees)
  revenueFees: number
  revenueNet: number (after fees)
  
  // On-time & completion
  onTimeDeliveries: number
  lateDeliveries: number
  onTimeRate: number (%)
  completionRate: number (%)
  
  // Response metrics
  messagesReceived: number
  avgResponseTime: number (minutes)
  
  // Top performing gigs (embedded)
  topGigs: [
    {
      gigId: string
      title: string
      orders: number
      revenue: number
    }
  ]
  
  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
```

---

### 9. disputes
Cancelled orders and unresolved conflicts.

```
Collection: disputes
Document ID: auto-generated (e.g., dispute_abc123xyz)

Fields:
  id: string
  orderId: string (reference to orders/{orderId})
  
  // Parties
  buyerId: string
  sellerId: string
  initiatedBy: string (buyer | seller)
  
  // Dispute details
  reason: string (late_delivery | quality_issue | communication | money_related | other)
  description: string
  attachments: [
    {
      fileName: string
      fileUrl: string
      uploadedAt: timestamp
    }
  ]
  
  // Status
  status: string (
    open |
    seller_responded |
    negotiating |
    escalated_to_support |
    resolved |
    cancelled
  )
  
  // Seller response
  sellerResponse: string (optional)
  sellerResponseAt: timestamp (optional)
  sellerOffer: {
    type: string (revision | partial_refund | full_refund | complete_order)
    amount: number (optional)
    details: string
  }
  
  // Resolution
  resolution: string (optional - final decision)
  resolvedBy: string (optional - seller | buyer | support_team)
  resolvedAt: timestamp (optional)
  finalAmount: number (optional - amount buyer receives back)
  
  // Timeline
  createdAt: timestamp
  updatedAt: timestamp
  escalatedAt: timestamp (optional)
```

---

### 10. notifications
Event log for all user alerts.

```
Collection: notifications
Document ID: auto-generated (e.g., notif_xyz789abc)

Fields:
  id: string
  userId: string (recipient)
  
  // Notification content
  type: string (
    new_message |
    order_placed |
    requirements_submitted |
    delivery_made |
    revision_requested |
    order_completed |
    review_received |
    seller_level_changed |
    withdrawal_processed |
    promo_low_budget
  )
  
  title: string
  message: string
  actionUrl: string (optional - link to relevant page)
  
  // Reference
  relatedId: string (orderId, messageId, etc.)
  
  // Status
  isRead: boolean
  readAt: timestamp (optional)
  
  // Delivery channels
  sentVia: string[] ([in_app, email, push])
  
  // Timestamps
  createdAt: timestamp
  archivedAt: timestamp (optional)
```

---

### 11. custom_offers
Seller-initiated custom project quotes.

```
Collection: custom_offers
Document ID: auto-generated (e.g., offer_abc123xyz)

Fields:
  id: string
  sellerId: string
  buyerId: string
  
  // Offer details
  title: string
  description: string
  
  // Pricing
  amount: number
  deliveryDays: number
  revisions: number
  
  // Message
  message: string (custom message to buyer)
  
  // Status
  status: string (pending | accepted | declined | expired)
  
  // Timestamps
  createdAt: timestamp
  expiresAt: timestamp (7 days default)
  respondedAt: timestamp (optional)
  
  // If accepted
  relatedOrderId: string (optional - new order created)
```

---

### 12. seller_levels_history
Tracks seller level changes for audit and analysis.

```
Collection: seller_levels_history
Document ID: auto-generated (e.g., level_hist_xyz123abc)

Fields:
  id: string
  sellerId: string
  
  // Level change
  previousLevel: string
  newLevel: string
  reason: string (auto_evaluation | manual_demotion | manual_promotion)
  
  // Metrics at time of change
  completionRate: number (%)
  onTimeRate: number (%)
  responseRate: number (%)
  avgRating: number
  cancellationRate: number (%)
  ordersCompleted: number
  
  // Timestamps
  changedAt: timestamp
  effectiveFrom: timestamp (when level takes effect)
  nextEvalAt: timestamp (when next evaluation occurs)
```

---

### 13. promoted_gigs
Advertising records for promoted gig placement.

```
Collection: promoted_gigs
Document ID: auto-generated (e.g., promo_abc123xyz)

Fields:
  id: string
  gigId: string
  sellerId: string
  
  // Campaign details
  name: string
  
  // Bidding
  bidAmount: number (cost per click, in USD)
  dailyBudget: number
  totalBudget: number
  
  // Performance
  impressions: number
  clicks: number
  spent: number
  costPerClick: number (calculated)
  
  // Status
  status: string (active | paused | completed | cancelled)
  startDate: timestamp
  endDate: timestamp (optional)
  
  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
```

---

### 14. categories
Service taxonomy.

```
Collection: categories
Document ID: auto-generated (e.g., cat_abc123xyz)

Fields:
  id: string
  
  // Hierarchy
  parentId: string (optional - for subcategories)
  name: string
  slug: string (e.g., graphics-design)
  description: string
  icon: string (URL or emoji)
  
  // SEO
  keywords: string[]
  
  // Sorting
  order: number
  
  // Stats
  gigCount: number (total gigs in this category)
  orderCount: number (total orders)
  
  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
```

---

### 15. favorites
Bookmarked gigs by buyers.

```
Collection: favorites
Document ID: auto-generated (e.g., fav_xyz789abc)

Fields:
  id: string
  buyerId: string
  gigId: string
  
  // Denormalized seller info
  sellerId: string
  gigTitle: string
  
  // Timestamps
  addedAt: timestamp
  removedAt: timestamp (optional - if deleted)
```

---

## Firestore Indexes Required

### Composite Indexes

1. **gigs (for search)**
   - Collection: gigs
   - Fields: category (Asc), status (Asc), featured (Desc)

2. **gigs (by seller)**
   - Collection: gigs
   - Fields: sellerId (Asc), status (Asc), createdAt (Desc)

3. **orders (by buyer)**
   - Collection: orders
   - Fields: buyerId (Asc), status (Asc), createdAt (Desc)

4. **orders (by seller)**
   - Collection: orders
   - Fields: sellerId (Asc), status (Asc), createdAt (Desc)

5. **reviews (by gig)**
   - Collection: reviews
   - Fields: revieweeId (Asc), isVisible (Asc), createdAt (Desc)

6. **transactions (by seller)**
   - Collection: transactions
   - Fields: sellerId (Asc), status (Asc), createdAt (Desc)

7. **messages (by order)**
   - Collection: orders/{orderId}/messages
   - Fields: createdAt (Asc)

---

## Search Implementation Options

### Option 1: Firestore Full-Text Search (Basic)
- Use text search on: title, tags, description, category
- Limit to ~100 results per query
- Slower for large catalogs

### Option 2: Algolia Integration (Recommended)
- Index all public gigs
- Fast, typo-tolerant search
- Faceted filtering
- Ranking algorithm support
- Cost: ~$45/month for 10K records

---

## Denormalization Strategy

To reduce read costs and improve performance:
- Gig title, category cached in orders and reviews
- Seller name, avatar cached in messages and reviews
- Package info stored atomically in order
- Analytics aggregated by month (not real-time)

---

## Estimated Document Count (at scale)

- Users: 10,000
- Gigs: 5,000
- Orders: 50,000
- Reviews: 45,000 (most orders get reviews)
- Messages: 150,000+ (avg 3 per order)
- Transactions: 50,000 (1:1 with orders)
- Total: ~310,000 documents = ~$3-5/month read/write cost
