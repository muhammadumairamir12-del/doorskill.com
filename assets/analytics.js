// ===== SELLER ANALYTICS MODULE =====

export async function getSellerMetrics(sellerId, timeRange = '30d') {
  try {
    const startDate = getStartDate(timeRange);
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('sellerId', '==', sellerId),
      where('createdAt', '>=', startDate)
    );

    const snapshot = await getDocs(q);
    let totalOrders = 0;
    let totalEarnings = 0;
    let completedOrders = 0;
    let averageRating = 0;
    let ordersByStatus = {};

    snapshot.forEach(doc => {
      const order = doc.data();
      totalOrders++;
      
      if (order.status === 'completed') {
        completedOrders++;
        totalEarnings += order.totalPrice || 0;
      }

      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    // Get average rating
    const reviewsRef = collection(db, 'users', sellerId, 'reviews');
    const reviewsSnapshot = await getDocs(reviewsRef);
    let totalRating = 0;
    if (reviewsSnapshot.size > 0) {
      reviewsSnapshot.forEach(doc => {
        totalRating += doc.data().rating || 0;
      });
      averageRating = (totalRating / reviewsSnapshot.size).toFixed(1);
    }

    return {
      totalOrders,
      totalEarnings: totalEarnings.toFixed(2),
      completedOrders,
      completionRate: ((completedOrders / totalOrders) * 100 || 0).toFixed(1),
      averageRating,
      ordersByStatus,
      responseTime: '2h', // Placeholder - calculate from actual data
      repeatClientRate: '45%' // Placeholder
    };
  } catch (error) {
    console.error("[v0] Error getting seller metrics:", error);
    return null;
  }
}

export async function getSellerGrowth(sellerId, timeRange = '90d') {
  try {
    const startDate = getStartDate(timeRange);
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('sellerId', '==', sellerId),
      where('createdAt', '>=', startDate),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    const dailyData = {};

    snapshot.forEach(doc => {
      const order = doc.data();
      const date = order.createdAt?.toDate?.().toLocaleDateString() || new Date().toLocaleDateString();
      
      if (!dailyData[date]) {
        dailyData[date] = { orders: 0, earnings: 0 };
      }
      
      dailyData[date].orders++;
      if (order.status === 'completed') {
        dailyData[date].earnings += order.totalPrice || 0;
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      orders: data.orders,
      earnings: data.earnings
    }));
  } catch (error) {
    console.error("[v0] Error getting growth data:", error);
    return [];
  }
}

export async function getTopGigs(sellerId, limit = 5) {
  try {
    const gigsRef = collection(db, 'users', sellerId, 'gigs');
    const q = query(
      gigsRef,
      orderBy('ordersCompleted', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    const gigs = [];
    
    snapshot.forEach(doc => {
      gigs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return gigs;
  } catch (error) {
    console.error("[v0] Error getting top gigs:", error);
    return [];
  }
}

export async function getClientBreakdown(sellerId) {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('sellerId', '==', sellerId)
    );

    const snapshot = await getDocs(q);
    const clientMap = {};

    snapshot.forEach(doc => {
      const order = doc.data();
      const buyerId = order.buyerId;
      
      if (!clientMap[buyerId]) {
        clientMap[buyerId] = {
          buyerId,
          buyerName: order.buyerName || 'Unknown',
          ordersCount: 0,
          totalSpent: 0,
          lastOrder: null
        };
      }
      
      clientMap[buyerId].ordersCount++;
      clientMap[buyerId].totalSpent += order.totalPrice || 0;
      clientMap[buyerId].lastOrder = order.createdAt || clientMap[buyerId].lastOrder;
    });

    return Object.values(clientMap)
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 10);
  } catch (error) {
    console.error("[v0] Error getting client breakdown:", error);
    return [];
  }
}

export async function getPerformanceMetrics(sellerId) {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('sellerId', '==', sellerId)
    );

    const snapshot = await getDocs(q);
    const metrics = {
      onTimeDelivery: 0,
      qualityRating: 0,
      communicationRating: 0,
      cancellationRate: 0,
      revisionsAverage: 0,
      totalOrders: snapshot.size
    };

    let totalQuality = 0;
    let totalComm = 0;
    let cancelledOrders = 0;
    let totalRevisions = 0;
    let completedOrders = 0;

    snapshot.forEach(doc => {
      const order = doc.data();
      
      if (order.status === 'completed') {
        completedOrders++;
        if (order.deliveredOnTime) metrics.onTimeDelivery++;
        if (order.buyerRating?.quality) totalQuality += order.buyerRating.quality;
        if (order.buyerRating?.communication) totalComm += order.buyerRating.communication;
      }
      
      if (order.status === 'cancelled') cancelledOrders++;
      if (order.revisions) totalRevisions += order.revisions;
    });

    metrics.onTimeDelivery = completedOrders > 0 ? ((metrics.onTimeDelivery / completedOrders) * 100).toFixed(1) : 0;
    metrics.qualityRating = completedOrders > 0 ? (totalQuality / completedOrders).toFixed(1) : 0;
    metrics.communicationRating = completedOrders > 0 ? (totalComm / completedOrders).toFixed(1) : 0;
    metrics.cancellationRate = ((cancelledOrders / snapshot.size) * 100).toFixed(1);
    metrics.revisionsAverage = snapshot.size > 0 ? (totalRevisions / snapshot.size).toFixed(1) : 0;

    return metrics;
  } catch (error) {
    console.error("[v0] Error getting performance metrics:", error);
    return null;
  }
}

export async function getCategoryBreakdown(sellerId) {
  try {
    const gigsRef = collection(db, 'users', sellerId, 'gigs');
    const snapshot = await getDocs(gigsRef);
    const categoryMap = {};

    snapshot.forEach(doc => {
      const gig = doc.data();
      const category = gig.category || 'Uncategorized';
      
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category]++;
    });

    return Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count
    }));
  } catch (error) {
    console.error("[v0] Error getting category breakdown:", error);
    return [];
  }
}

function getStartDate(timeRange) {
  const now = new Date();
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
