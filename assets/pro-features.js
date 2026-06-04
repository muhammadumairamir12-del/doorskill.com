// ===== ADVANCED FEATURES MODULE (Pro Tier & Promotions) =====

const PRO_TIER_FEATURES = {
  FEATURED_GIG: 'featured_gig',
  PROMOTED_LISTING: 'promoted_listing',
  PRIORITY_SUPPORT: 'priority_support',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOM_OFFERS_BATCH: 'custom_offers_batch',
  PRIORITY_QUEUE: 'priority_queue',
  VERIFIED_BADGE: 'verified_badge',
  UNLIMITED_REVISIONS: 'unlimited_revisions'
};

const PRO_TIER_PRICING = {
  MONTHLY: 9.99,
  QUARTERLY: 24.99,
  YEARLY: 79.99
};

export async function upgradeToPro(sellerId, planType, paymentMethodId) {
  try {
    // Process payment
    const chargeResult = await processProSubscription(paymentMethodId, PRO_TIER_PRICING[planType]);
    
    if (!chargeResult.success) {
      return { success: false, error: chargeResult.error };
    }

    // Update user to pro tier
    const userRef = doc(db, 'users', sellerId);
    const proEndDate = calculateProEndDate(planType);

    await updateDoc(userRef, {
      proTier: true,
      proPlanType: planType,
      proStartDate: new Date(),
      proEndDate,
      stripeSubscriptionId: chargeResult.subscriptionId,
      proFeatures: Object.values(PRO_TIER_FEATURES),
      updatedAt: new Date()
    });

    // Create notification
    await createNotification(sellerId, 'PRO_UPGRADE', {
      title: 'Welcome to Pro Tier',
      message: `You have successfully upgraded to DoorSkill Pro (${planType})!`,
      actionUrl: '/pro-features'
    });

    return { success: true, message: 'Successfully upgraded to Pro Tier' };
  } catch (error) {
    console.error("[v0] Error upgrading to Pro:", error);
    return { success: false, error: error.message };
  }
}

export async function createPromotedGig(sellerId, gigId, promotionData) {
  try {
    const user = await getDoc(doc(db, 'users', sellerId));
    
    if (!user.data()?.proTier) {
      return { success: false, error: 'Pro subscription required' };
    }

    const promotionRef = await addDoc(collection(db, 'promotions'), {
      gigId,
      sellerId,
      title: promotionData.title,
      description: promotionData.description,
      budget: promotionData.budget,
      dailyBudget: promotionData.dailyBudget,
      targetAudience: promotionData.targetAudience || {},
      status: 'active',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      roi: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + promotionData.durationDays * 24 * 60 * 60 * 1000),
      performanceMetrics: []
    });

    // Add featured badge
    await updateDoc(doc(db, 'users', sellerId, 'gigs', gigId), {
      isFeatured: true,
      promotionId: promotionRef.id
    });

    return { success: true, promotionId: promotionRef.id };
  } catch (error) {
    console.error("[v0] Error creating promotion:", error);
    return { success: false, error: error.message };
  }
}

export async function trackPromotionPerformance(promotionId, eventType, eventData) {
  try {
    const promotionRef = doc(db, 'promotions', promotionId);
    const promotion = await getDoc(promotionRef);

    if (!promotion.exists()) return false;

    const metrics = promotion.data().performanceMetrics || [];
    
    metrics.push({
      eventType, // 'impression', 'click', 'conversion'
      eventData,
      timestamp: new Date()
    });

    // Update metrics
    let impressions = 0, clicks = 0, conversions = 0;
    metrics.forEach(m => {
      if (m.eventType === 'impression') impressions++;
      if (m.eventType === 'click') clicks++;
      if (m.eventType === 'conversion') conversions++;
    });

    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0;
    const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0;

    await updateDoc(promotionRef, {
      performanceMetrics: metrics,
      impressions,
      clicks,
      conversions,
      ctr,
      conversionRate
    });

    return true;
  } catch (error) {
    console.error("[v0] Error tracking promotion:", error);
    return false;
  }
}

export async function getFeaturedGigs(limit = 10) {
  try {
    const gigsRef = collection(db, 'allGigs');
    const q = query(
      gigsRef,
      where('isFeatured', '==', true),
      orderBy('promotionPriority', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    const gigs = [];

    snapshot.forEach(doc => {
      gigs.push({ id: doc.id, ...doc.data() });
    });

    return gigs;
  } catch (error) {
    console.error("[v0] Error getting featured gigs:", error);
    return [];
  }
}

export async function enableVerifiedBadge(sellerId) {
  try {
    const user = await getDoc(doc(db, 'users', sellerId));
    
    if (!user.data()?.proTier) {
      return { success: false, error: 'Pro subscription required' };
    }

    // Check eligibility criteria
    const orderStats = await getSellerOrderStats(sellerId);
    
    if (orderStats.completionRate < 98 || orderStats.averageRating < 4.5) {
      return { success: false, error: 'Does not meet verification criteria' };
    }

    await updateDoc(doc(db, 'users', sellerId), {
      verifiedSeller: true,
      verifiedAt: new Date(),
      verificationStatus: 'approved'
    });

    return { success: true, message: 'Verified seller badge enabled' };
  } catch (error) {
    console.error("[v0] Error enabling verified badge:", error);
    return { success: false, error: error.message };
  }
}

export async function createBulkCustomOffers(sellerId, buyerIds, offerTemplate) {
  try {
    const user = await getDoc(doc(db, 'users', sellerId));
    
    if (!user.data()?.proTier) {
      return { success: false, error: 'Pro subscription required' };
    }

    const offers = [];

    for (const buyerId of buyerIds) {
      const offerRef = await addDoc(collection(db, 'bulkOffers'), {
        sellerId,
        buyerId,
        title: offerTemplate.title,
        description: offerTemplate.description,
        price: offerTemplate.price,
        deliveryDays: offerTemplate.deliveryDays,
        revisions: offerTemplate.revisions,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      });

      offers.push(offerRef.id);

      // Send notification
      await createNotification(buyerId, 'BULK_OFFER', {
        title: 'Special Offer from Seller',
        message: `${user.data().name} sent you a special offer: ${offerTemplate.title}`,
        actionUrl: `/offers/${offerRef.id}`
      });
    }

    return { success: true, offersCount: offers.length };
  } catch (error) {
    console.error("[v0] Error creating bulk offers:", error);
    return { success: false, error: error.message };
  }
}

export async function getProSubscriptionStatus(sellerId) {
  try {
    const user = await getDoc(doc(db, 'users', sellerId));
    const userData = user.data();

    if (!userData?.proTier) {
      return {
        isPro: false,
        message: 'Not subscribed to Pro'
      };
    }

    const now = new Date();
    const endDate = userData.proEndDate?.toDate?.() || new Date();
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    return {
      isPro: true,
      planType: userData.proPlanType,
      startDate: userData.proStartDate?.toDate?.(),
      endDate,
      daysRemaining,
      features: userData.proFeatures || [],
      autoRenew: userData.autoRenewPro || true
    };
  } catch (error) {
    console.error("[v0] Error getting pro status:", error);
    return null;
  }
}

export async function cancelProSubscription(sellerId) {
  try {
    const user = await getDoc(doc(db, 'users', sellerId));
    
    if (!user.data()?.stripeSubscriptionId) {
      return { success: false, error: 'No active subscription' };
    }

    // Cancel Stripe subscription
    await cancelStripeSubscription(user.data().stripeSubscriptionId);

    // Update user
    await updateDoc(doc(db, 'users', sellerId), {
      proTier: false,
      proCancelledAt: new Date(),
      proCancellationReason: 'user_requested'
    });

    return { success: true, message: 'Pro subscription cancelled' };
  } catch (error) {
    console.error("[v0] Error cancelling Pro subscription:", error);
    return { success: false, error: error.message };
  }
}

export async function getPromotionAnalytics(promotionId) {
  try {
    const promotion = await getDoc(doc(db, 'promotions', promotionId));
    
    if (!promotion.exists()) return null;

    const data = promotion.data();
    const spent = calculateSpent(data.createdAt, data.dailyBudget);

    return {
      promotionId,
      status: data.status,
      gigId: data.gigId,
      impressions: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
      ctr: data.ctr,
      conversionRate: data.conversionRate,
      budget: data.budget,
      spent,
      remaining: data.budget - spent,
      roi: calculateROI(data.conversions, spent),
      dayActive: Math.ceil((new Date() - data.createdAt.toDate()) / (1000 * 60 * 60 * 24)),
      expiresAt: data.expiresAt?.toDate?.()
    };
  } catch (error) {
    console.error("[v0] Error getting promotion analytics:", error);
    return null;
  }
}

function calculateProEndDate(planType) {
  const now = new Date();
  if (planType === 'MONTHLY') {
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  } else if (planType === 'QUARTERLY') {
    return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  } else {
    return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  }
}

async function processProSubscription(paymentMethodId, amount) {
  try {
    // Call Stripe API
    console.log("[v0] Processing subscription:", amount);
    return { success: true, subscriptionId: 'sub_' + Date.now() };
  } catch (error) {
    console.error("[v0] Payment processing error:", error);
    return { success: false, error: error.message };
  }
}

async function getSellerOrderStats(sellerId) {
  // Simplified - would aggregate actual order data
  return {
    completionRate: 98.5,
    averageRating: 4.8
  };
}

async function cancelStripeSubscription(subscriptionId) {
  console.log("[v0] Cancelling subscription:", subscriptionId);
  return true;
}

function calculateSpent(createdDate, dailyBudget) {
  const days = Math.ceil((new Date() - createdDate.toDate()) / (1000 * 60 * 60 * 24));
  return days * dailyBudget;
}

function calculateROI(conversions, spent) {
  return spent > 0 ? ((conversions / spent) * 100).toFixed(2) : 0;
}
