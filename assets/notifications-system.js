// ===== NOTIFICATIONS SYSTEM =====
// Triggers, channels, and notification management per Fiverr spec

export const NOTIFICATION_TRIGGERS = {
  MESSAGE_RECEIVED: 'message_received',
  ORDER_PLACED: 'order_placed',
  REQUIREMENTS_SUBMITTED: 'requirements_submitted',
  DELIVERY_MADE: 'delivery_made',
  REVISION_REQUESTED: 'revision_requested',
  ORDER_COMPLETED: 'order_completed',
  REVIEW_RECEIVED: 'review_received',
  LEVEL_CHANGE: 'level_change',
  WITHDRAWAL_PROCESSED: 'withdrawal_processed',
  PROMOTED_BUDGET_LOW: 'promoted_budget_low',
  DISPUTE_UPDATE: 'dispute_update',
  SELLER_REPLY: 'seller_reply',
  REQUIREMENTS_REMINDER: 'requirements_reminder',
  DELIVERY_REMINDER: 'delivery_reminder'
};

export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms'
};

// ===== DEFAULT NOTIFICATION SETTINGS =====
export const DEFAULT_NOTIFICATION_SETTINGS = {
  [NOTIFICATION_TRIGGERS.MESSAGE_RECEIVED]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: true,
    [NOTIFICATION_CHANNELS.SMS]: false
  },
  [NOTIFICATION_TRIGGERS.ORDER_PLACED]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: true,
    [NOTIFICATION_CHANNELS.SMS]: false
  },
  [NOTIFICATION_TRIGGERS.REQUIREMENTS_SUBMITTED]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: true,
    [NOTIFICATION_CHANNELS.SMS]: false
  },
  [NOTIFICATION_TRIGGERS.DELIVERY_MADE]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: true,
    [NOTIFICATION_CHANNELS.SMS]: false
  },
  [NOTIFICATION_TRIGGERS.REVISION_REQUESTED]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: true,
    [NOTIFICATION_CHANNELS.SMS]: false
  },
  [NOTIFICATION_TRIGGERS.ORDER_COMPLETED]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: true,
    [NOTIFICATION_CHANNELS.SMS]: false
  },
  [NOTIFICATION_TRIGGERS.REVIEW_RECEIVED]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: false,
    [NOTIFICATION_CHANNELS.SMS]: false
  },
  [NOTIFICATION_TRIGGERS.LEVEL_CHANGE]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: false,
    [NOTIFICATION_CHANNELS.SMS]: false
  },
  [NOTIFICATION_TRIGGERS.WITHDRAWAL_PROCESSED]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: false,
    [NOTIFICATION_CHANNELS.SMS]: true // Critical - SMS enabled
  },
  [NOTIFICATION_TRIGGERS.PROMOTED_BUDGET_LOW]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: true,
    [NOTIFICATION_CHANNELS.SMS]: false
  },
  [NOTIFICATION_TRIGGERS.DISPUTE_UPDATE]: {
    [NOTIFICATION_CHANNELS.IN_APP]: true,
    [NOTIFICATION_CHANNELS.EMAIL]: true,
    [NOTIFICATION_CHANNELS.PUSH]: true,
    [NOTIFICATION_CHANNELS.SMS]: true // Critical - SMS enabled
  }
};

// ===== NOTIFICATION TEMPLATES =====
export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TRIGGERS.MESSAGE_RECEIVED]: {
    title: 'New message from {senderName}',
    message: '{senderName} sent you a message on order {orderNumber}',
    data_fields: ['senderId', 'senderName', 'threadId', 'orderNumber'],
    action_url: '/messages/{threadId}'
  },
  [NOTIFICATION_TRIGGERS.ORDER_PLACED]: {
    title: 'New order received!',
    message: '{buyerName} purchased your "{gigTitle}" gig (Order {orderNumber})',
    data_fields: ['buyerId', 'buyerName', 'gigTitle', 'orderId', 'orderNumber'],
    action_url: '/orders/{orderId}',
    recipient_type: 'seller' // Only sent to seller
  },
  [NOTIFICATION_TRIGGERS.REQUIREMENTS_SUBMITTED]: {
    title: 'Order requirements submitted',
    message: '{buyerName} submitted requirements for order {orderNumber}. Review and start working!',
    data_fields: ['buyerId', 'buyerName', 'orderId', 'orderNumber'],
    action_url: '/orders/{orderId}',
    recipient_type: 'seller',
    countdown_start: true // Starts 3-day delivery timer
  },
  [NOTIFICATION_TRIGGERS.DELIVERY_MADE]: {
    title: 'Order delivered!',
    message: '{sellerName} delivered the work on order {orderNumber}. Review it now!',
    data_fields: ['sellerId', 'sellerName', 'orderId', 'orderNumber'],
    action_url: '/orders/{orderId}',
    recipient_type: 'buyer'
  },
  [NOTIFICATION_TRIGGERS.REVISION_REQUESTED]: {
    title: 'Revision requested',
    message: '{buyerName} requested a revision for order {orderNumber}',
    data_fields: ['buyerId', 'buyerName', 'orderId', 'orderNumber'],
    action_url: '/orders/{orderId}',
    recipient_type: 'seller',
    countdown_reset: true // Resets 3-day timer
  },
  [NOTIFICATION_TRIGGERS.ORDER_COMPLETED]: {
    title: 'Order completed!',
    message: 'Order {orderNumber} is now complete. Thank you!',
    data_fields: ['orderId', 'orderNumber'],
    action_url: '/orders/{orderId}'
  },
  [NOTIFICATION_TRIGGERS.REVIEW_RECEIVED]: {
    title: 'You received a review',
    message: '{reviewerName} left you a {rating}-star review',
    data_fields: ['reviewerId', 'reviewerName', 'rating', 'reviewId', 'orderId'],
    action_url: '/reviews/{reviewId}'
  },
  [NOTIFICATION_TRIGGERS.LEVEL_CHANGE]: {
    title: 'Level change!',
    message: 'Congratulations! You are now {newLevel}. New benefits unlocked!',
    data_fields: ['previousLevel', 'newLevel'],
    action_url: '/dashboard/seller',
    is_positive: true
  },
  [NOTIFICATION_TRIGGERS.WITHDRAWAL_PROCESSED]: {
    title: 'Withdrawal processed',
    message: '${amount} has been withdrawn to your {method}',
    data_fields: ['amount', 'method', 'transactionId'],
    action_url: '/account/withdrawals'
  },
  [NOTIFICATION_TRIGGERS.PROMOTED_BUDGET_LOW]: {
    title: 'Promoted gig budget running low',
    message: 'Your promoted gig "{gigTitle}" budget is at {percentage}%. Add funds to continue promoting.',
    data_fields: ['gigTitle', 'gigId', 'percentage', 'remainingBudget'],
    action_url: '/gigs/{gigId}/promote'
  },
  [NOTIFICATION_TRIGGERS.DISPUTE_UPDATE]: {
    title: 'Dispute update',
    message: '{status} on order {orderNumber}',
    data_fields: ['disputeId', 'orderId', 'orderNumber', 'status'],
    action_url: '/disputes/{disputeId}'
  }
};

// ===== NOTIFICATION MANAGEMENT =====

export function createNotification(userId, trigger, data, userSettings) {
  const template = NOTIFICATION_TEMPLATES[trigger];
  if (!template) throw new Error(`Unknown trigger: ${trigger}`);

  // Determine recipient if specified in template
  if (template.recipient_type) {
    if (template.recipient_type === 'seller' && data.recipientRole !== 'seller') {
      return null; // Don't send
    }
    if (template.recipient_type === 'buyer' && data.recipientRole !== 'buyer') {
      return null; // Don't send
    }
  }

  // Get user's notification preferences
  const channelSettings = userSettings?.notification_preferences?.[trigger] ||
    DEFAULT_NOTIFICATION_SETTINGS[trigger];

  const channels = Object.entries(channelSettings)
    .filter(([_, enabled]) => enabled)
    .map(([channel]) => channel);

  return {
    id: generateUUID(),
    user_id: userId,
    type: trigger,
    title: interpolateTemplate(template.title, data),
    message: interpolateTemplate(template.message, data),
    data: data,
    channels: channels,
    read: false,
    read_at: null,
    action_url: interpolateTemplate(template.action_url, data),
    created_at: new Date()
  };
}

export function sendNotification(notification, channels = []) {
  const toSend = channels.length > 0 ? channels : notification.channels;

  const sent = [];

  if (toSend.includes(NOTIFICATION_CHANNELS.IN_APP)) {
    // Store in database
    sent.push({
      channel: NOTIFICATION_CHANNELS.IN_APP,
      status: 'queued'
    });
  }

  if (toSend.includes(NOTIFICATION_CHANNELS.EMAIL)) {
    // Queue email
    sent.push({
      channel: NOTIFICATION_CHANNELS.EMAIL,
      status: 'queued'
    });
  }

  if (toSend.includes(NOTIFICATION_CHANNELS.PUSH)) {
    // Send push notification (requires device registration)
    sent.push({
      channel: NOTIFICATION_CHANNELS.PUSH,
      status: 'queued'
    });
  }

  if (toSend.includes(NOTIFICATION_CHANNELS.SMS)) {
    // Send SMS (critical alerts only, uses SMS provider API)
    sent.push({
      channel: NOTIFICATION_CHANNELS.SMS,
      status: 'queued'
    });
  }

  return {
    notification_id: notification.id,
    sent_channels: sent,
    sent_at: new Date()
  };
}

export function getUserNotifications(userId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    unread_only = false,
    types = []
  } = options;

  // Query notifications from database
  return {
    total: 0,
    notifications: [],
    limit,
    offset
  };
}

export function markNotificationAsRead(notificationId) {
  return {
    notification_id: notificationId,
    read: true,
    read_at: new Date()
  };
}

export function markAllNotificationsAsRead(userId) {
  return {
    user_id: userId,
    marked_as_read: 0, // Would return count from DB
    marked_at: new Date()
  };
}

export function updateNotificationPreference(userId, trigger, channel, enabled) {
  return {
    user_id: userId,
    trigger: trigger,
    channel: channel,
    enabled: enabled,
    updated_at: new Date()
  };
}

export function getNotificationStats(userId) {
  return {
    unread_count: 0,
    today_count: 0,
    this_week_count: 0,
    types_breakdown: {} // Count by notification type
  };
}

// ===== HELPER FUNCTIONS =====

function interpolateTemplate(template, data) {
  let result = template;
  const regex = /{(\w+)}/g;
  
  result = result.replace(regex, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });

  return result;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
