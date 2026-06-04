// Stripe Payment & Escrow Management
// Handles all payment processing, escrow holds, and fund transfers

export async function initializeStripe(publishableKey) {
  return Stripe(publishableKey);
}

export async function createPaymentIntent(orderId, amount, currency = 'usd') {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount: Math.round(amount * 100), // Convert to cents
        currency
      })
    });
    
    if (!response.ok) throw new Error('Failed to create payment intent');
    
    const data = await response.json();
    console.log("[v0] Payment intent created:", data.clientSecret);
    return data;
  } catch (error) {
    console.error("[v0] Error creating payment intent:", error);
    return null;
  }
}

export async function processPayment(stripe, elements, orderId, amount) {
  try {
    const { clientSecret } = await createPaymentIntent(orderId, amount);
    
    if (!clientSecret) {
      throw new Error('Could not initialize payment');
    }

    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/pages/order-confirm.html?order_id=${orderId}`
      }
    });

    if (error) {
      console.error("[v0] Payment error:", error);
      return { success: false, error: error.message };
    }

    if (paymentIntent.status === 'succeeded') {
      console.log("[v0] Payment successful:", paymentIntent.id);
      return { success: true, paymentId: paymentIntent.id };
    }

    return { success: false, error: 'Payment processing failed' };
  } catch (error) {
    console.error("[v0] Payment processing error:", error);
    return { success: false, error: error.message };
  }
}

export async function holdFundsInEscrow(orderId, amount, buyerId, sellerId) {
  try {
    const response = await fetch('/api/hold-escrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount: Math.round(amount * 100),
        buyerId,
        sellerId
      })
    });

    if (!response.ok) throw new Error('Failed to hold funds');

    const data = await response.json();
    console.log("[v0] Funds held in escrow:", data);
    return data;
  } catch (error) {
    console.error("[v0] Error holding escrow funds:", error);
    return null;
  }
}

export async function releaseEscrowFunds(orderId, sellerId, amount) {
  try {
    const response = await fetch('/api/release-escrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        sellerId,
        amount: Math.round(amount * 100)
      })
    });

    if (!response.ok) throw new Error('Failed to release funds');

    const data = await response.json();
    console.log("[v0] Escrow funds released:", data);
    return data;
  } catch (error) {
    console.error("[v0] Error releasing escrow funds:", error);
    return null;
  }
}

export async function refundPayment(paymentId, amount) {
  try {
    const response = await fetch('/api/refund-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        amount: Math.round(amount * 100)
      })
    });

    if (!response.ok) throw new Error('Failed to process refund');

    const data = await response.json();
    console.log("[v0] Refund processed:", data);
    return data;
  } catch (error) {
    console.error("[v0] Error processing refund:", error);
    return null;
  }
}

export async function requestPayout(sellerId, amount, bankDetails) {
  try {
    const response = await fetch('/api/request-payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId,
        amount: Math.round(amount * 100),
        bankDetails
      })
    });

    if (!response.ok) throw new Error('Failed to request payout');

    const data = await response.json();
    console.log("[v0] Payout requested:", data);
    return data;
  } catch (error) {
    console.error("[v0] Error requesting payout:", error);
    return null;
  }
}

export async function getPaymentHistory(userId, type = 'all') {
  try {
    const response = await fetch(`/api/payment-history?userId=${userId}&type=${type}`);
    
    if (!response.ok) throw new Error('Failed to fetch payment history');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[v0] Error fetching payment history:", error);
    return [];
  }
}

export async function getSellerBalance(sellerId) {
  try {
    const response = await fetch(`/api/seller-balance?sellerId=${sellerId}`);
    
    if (!response.ok) throw new Error('Failed to fetch balance');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[v0] Error fetching balance:", error);
    return { available: 0, pending: 0, total: 0 };
  }
}

export async function getEscrowStatus(orderId) {
  try {
    const response = await fetch(`/api/escrow-status?orderId=${orderId}`);
    
    if (!response.ok) throw new Error('Failed to fetch escrow status');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[v0] Error fetching escrow status:", error);
    return null;
  }
}

console.log("[v0] Stripe payment module initialized");
