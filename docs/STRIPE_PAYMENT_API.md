# DoorSkill Stripe Payment API Guide

## Overview

This document describes the backend API endpoints required for Stripe payment processing, escrow management, and seller payouts.

## Environment Variables Required

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FIREBASE_PROJECT_ID=doorskill-xxx
STRIPE_WEBHOOK_SECRET=whsec_...
```

## API Endpoints

### 1. Create Payment Intent

**Endpoint:** `POST /api/create-payment-intent`

Creates a Stripe Payment Intent for processing order payments with funds held in escrow.

**Request Body:**
```json
{
  "orderId": "order_123abc",
  "amount": 5000,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567890_secret_0987654321",
  "paymentIntentId": "pi_1234567890"
}
```

**Backend Implementation:**
1. Validate order exists and belongs to authenticated user
2. Create Stripe PaymentIntent with metadata containing orderId
3. Store paymentIntentId in Firestore order document
4. Return clientSecret to client for payment form
5. Log transaction to analytics

---

### 2. Hold Funds in Escrow

**Endpoint:** `POST /api/hold-escrow`

Holds funds in escrow after successful payment. Funds are released only when buyer accepts delivery.

**Request Body:**
```json
{
  "orderId": "order_123abc",
  "amount": 5000,
  "buyerId": "user_buyer_123",
  "sellerId": "user_seller_456"
}
```

**Response:**
```json
{
  "escrowId": "escrow_123",
  "status": "held",
  "amount": 5000,
  "releaseDate": "2026-07-05"
}
```

**Backend Implementation:**
1. Verify payment has been processed successfully
2. Create escrow record in Firestore with:
   - buyerId, sellerId, orderId
   - amount, status ("held")
   - holdStartDate, expectedReleaseDate
3. Create transaction record for audit trail
4. Update order status to "accepted"
5. Send notification to seller

**Escrow Holds:**
- Default hold period: Until buyer accepts delivery or 30 days
- Seller can request early release (requires buyer approval)
- Automatic release after 30 days if delivery accepted
- Refund if order cancelled

---

### 3. Release Escrow Funds

**Endpoint:** `POST /api/release-escrow`

Releases funds from escrow to seller's account when buyer accepts delivery.

**Request Body:**
```json
{
  "orderId": "order_123abc",
  "sellerId": "user_seller_456",
  "amount": 5000
}
```

**Response:**
```json
{
  "escrowId": "escrow_123",
  "status": "released",
  "releasedAmount": 5000,
  "releasedDate": "2026-06-28"
}
```

**Backend Implementation:**
1. Verify order is completed and accepted by buyer
2. Calculate platform fees and seller payout
3. Create transfer to seller's available balance
4. Update escrow record to "released"
5. Create transaction records
6. Send confirmation emails to both parties

**Payout Calculation:**
- Platform fee: 5.5% + $2.50 for orders < $75, or 5.5% for orders >= $75
- Seller receives: Amount - Platform Fee

---

### 4. Refund Payment

**Endpoint:** `POST /api/refund-payment`

Processes refunds when orders are cancelled or disputes are resolved.

**Request Body:**
```json
{
  "paymentId": "pi_1234567890",
  "amount": 5000,
  "reason": "seller_declined"
}
```

**Response:**
```json
{
  "refundId": "re_1234567890",
  "status": "succeeded",
  "amount": 5000,
  "originalPaymentId": "pi_1234567890"
}
```

**Backend Implementation:**
1. Verify original payment exists
2. Create Stripe Refund
3. Update order status to "refunded"
4. Release escrow hold if applicable
5. Create refund transaction record
6. Notify buyer of refund (include refund ID and timeline)
7. Update seller's statistics

**Refund Timeline:**
- Processing time: 5-10 business days
- Bank to bank transfer varies by institution
- Notification email sent immediately

---

### 5. Request Payout

**Endpoint:** `POST /api/request-payout`

Seller requests withdrawal of available balance to bank account.

**Request Body:**
```json
{
  "sellerId": "user_seller_456",
  "amount": 50000,
  "bankDetails": {
    "accountType": "checking",
    "routingNumber": "123456789",
    "accountNumber": "9876543210",
    "accountHolderName": "John Doe"
  }
}
```

**Response:**
```json
{
  "payoutId": "payout_456def",
  "status": "pending_review",
  "amount": 50000,
  "requestDate": "2026-06-25",
  "estimatedReleaseDate": "2026-06-30"
}
```

**Backend Implementation:**
1. Verify seller has sufficient available balance
2. Verify bank details format and completeness
3. Create payout record in Firestore
4. Validate payout amount (minimum $50)
5. Trigger review process (admin approval or auto for trusted sellers)
6. Store bank details encrypted (PCI compliance)
7. Create payout transaction record
8. Send confirmation email to seller

**Payout Requirements:**
- Minimum: $50
- Maximum: Daily limit based on seller level
- Processing: 5-10 business days after approval
- Frequency: Once per week per seller

---

### 6. Get Seller Balance

**Endpoint:** `GET /api/seller-balance?sellerId={sellerId}`

Retrieves seller's current balance breakdown.

**Response:**
```json
{
  "available": 15000,
  "pending": 8500,
  "total": 23500,
  "currency": "usd",
  "lastUpdated": "2026-06-25T14:30:00Z"
}
```

**Backend Implementation:**
1. Query all transactions for seller
2. Calculate:
   - **Available**: Completed orders - platform fees (released from escrow)
   - **Pending**: Completed orders awaiting release from escrow
   - **Total**: Available + Pending
3. Filter out cancelled orders and refunds
4. Return with caching (5 minute TTL)

**Balance Breakdown:**
- Available: Can be withdrawn immediately
- Pending: Will be available after buyer accepts delivery
- Held: In escrow, awaiting delivery acceptance

---

### 7. Get Payment History

**Endpoint:** `GET /api/payment-history?userId={userId}&type={type}`

Retrieves payment and transaction history for a user.

**Query Parameters:**
- `userId`: User ID (required)
- `type`: "all", "earnings", "expenses", "payouts" (default: "all")
- `limit`: Number of records (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "transactions": [
    {
      "id": "txn_123",
      "orderId": "order_123abc",
      "type": "earned",
      "amount": 4725,
      "platformFee": 275,
      "date": "2026-06-25T10:30:00Z",
      "status": "completed",
      "description": "Order completed - Service delivery"
    },
    {
      "id": "txn_456",
      "type": "payout",
      "amount": 10000,
      "date": "2026-06-20T15:45:00Z",
      "status": "completed",
      "description": "Payout to bank account ****1234"
    }
  ],
  "total": 145,
  "limit": 50,
  "offset": 0
}
```

---

### 8. Get Escrow Status

**Endpoint:** `GET /api/escrow-status?orderId={orderId}`

Gets current escrow hold status for an order.

**Response:**
```json
{
  "orderId": "order_123abc",
  "status": "held",
  "amount": 5000,
  "heldDate": "2026-06-25T10:30:00Z",
  "releaseDate": "2026-07-25T10:30:00Z",
  "buyerId": "user_buyer_123",
  "sellerId": "user_seller_456",
  "daysRemaining": 5
}
```

---

## Webhook Events

### order.payment.completed

Fired when payment is successfully processed.

```json
{
  "type": "order.payment.completed",
  "orderId": "order_123abc",
  "paymentIntentId": "pi_1234567890",
  "amount": 5000,
  "timestamp": "2026-06-25T10:30:00Z"
}
```

### order.escrow.released

Fired when escrow funds are released to seller.

```json
{
  "type": "order.escrow.released",
  "orderId": "order_123abc",
  "sellerId": "user_seller_456",
  "amount": 4725,
  "platformFee": 275,
  "timestamp": "2026-06-28T14:20:00Z"
}
```

### payout.completed

Fired when seller payout is successfully transferred.

```json
{
  "type": "payout.completed",
  "payoutId": "payout_456def",
  "sellerId": "user_seller_456",
  "amount": 50000,
  "timestamp": "2026-06-30T09:15:00Z"
}
```

---

## Error Handling

### Common Error Codes

- **INSUFFICIENT_BALANCE**: Seller doesn't have enough available balance
- **INVALID_BANK_DETAILS**: Bank account information failed validation
- **PAYMENT_FAILED**: Stripe payment processing failed
- **ORDER_NOT_FOUND**: Order doesn't exist
- **UNAUTHORIZED**: User not authorized for this operation
- **DUPLICATE_REQUEST**: Payout already requested for same amount and seller

### Error Response Format

```json
{
  "error": "INSUFFICIENT_BALANCE",
  "message": "Available balance is $1,500 but requested payout is $5,000",
  "code": 400
}
```

---

## Security Considerations

1. **PCI Compliance**: Never store raw card data. Use Stripe tokenization.
2. **Bank Details**: Encrypt all stored bank account information.
3. **Authentication**: All endpoints require valid Firebase auth token.
4. **Verification**: Verify webhook signatures using Stripe webhook secret.
5. **Rate Limiting**: Implement rate limits on payment endpoints.
6. **Audit Logging**: Log all financial transactions for audit trail.
7. **Idempotency**: Use idempotency keys for payment operations.

---

## Implementation Checklist

- [ ] Set up Stripe account and API keys
- [ ] Configure webhook endpoints
- [ ] Implement payment intent creation
- [ ] Implement escrow management
- [ ] Implement payout processing
- [ ] Create audit logging system
- [ ] Set up email notifications
- [ ] Implement error handling
- [ ] Add rate limiting
- [ ] Test with Stripe test keys
- [ ] Document for team
- [ ] Set up monitoring and alerts

---

## Testing

Use Stripe test keys and test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 2500 0000 3010
- Expiry: Any future date
- CVC: Any 3 digits

---

## Next Steps

1. Backend developer implements API endpoints
2. Set up Stripe Connect for seller accounts
3. Configure webhook handlers
4. Implement escrow release automation
5. Set up fraud detection
6. Create admin dashboard for financial management
