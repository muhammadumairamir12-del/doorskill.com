// ===== MESSAGING & COMMUNICATION SYSTEM =====
// Built-in on-platform messaging system
// Off-platform contact (email, WhatsApp, Skype) is ToS violation

export const MESSAGING_CONFIG = {
  messageTypes: ['text', 'image', 'file', 'custom_offer'],
  maxFileSize: 50 * 1024 * 1024, // 50 MB
  responseTimeThreshold: 24 * 60, // 24 hours in minutes
  responseRateThreshold: 0.90, // 90% for ranking penalty
};

// ===== MESSAGE STATES =====
export const MESSAGE_STATES = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};

// ===== CREATE CONVERSATION =====
export function createConversation(buyerId, sellerId, gigId, conversationContext = {}) {
  return {
    id: `conv_${Date.now()}`,
    buyerId,
    sellerId,
    gigId,
    createdAt: new Date(),
    lastMessageAt: null,
    context: conversationContext, // Order ID, gig details, etc.
    archived: false,
    spam: false,
    messages: [],
    buyerRead: true,
    sellerRead: true,
  };
}

// ===== SEND MESSAGE =====
export function sendMessage(
  conversationId,
  senderId,
  messageType = 'text',
  content = '',
  attachments = []
) {
  if (messageType === 'text' && !content.trim()) {
    throw new Error('Text message cannot be empty');
  }

  if (attachments.length > 0) {
    attachments.forEach(attachment => {
      if (attachment.size > MESSAGING_CONFIG.maxFileSize) {
        throw new Error(`File too large: ${attachment.name}`);
      }
    });
  }

  return {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId,
    type: messageType,
    content,
    attachments,
    state: MESSAGE_STATES.SENT,
    sentAt: new Date(),
    deliveredAt: null,
    readAt: null,
    edited: false,
    editedAt: null,
  };
}

// ===== DELIVER MESSAGE =====
export function deliverMessage(message) {
  return {
    ...message,
    state: MESSAGE_STATES.DELIVERED,
    deliveredAt: new Date(),
  };
}

// ===== READ MESSAGE =====
export function readMessage(message) {
  return {
    ...message,
    state: MESSAGE_STATES.READ,
    readAt: new Date(),
  };
}

// ===== TRACK FIRST RESPONSE TIME =====
export function trackFirstResponse(conversation, response) {
  if (!conversation.firstResponseTime && response.senderId === conversation.sellerId) {
    const firstMessageTime = conversation.messages[0]?.sentAt;
    if (firstMessageTime) {
      const responseTimeMinutes = Math.floor(
        (new Date(response.sentAt) - new Date(firstMessageTime)) / (1000 * 60)
      );

      return {
        firstResponseTrackingId: `frt_${Date.now()}`,
        responseTimeMinutes,
        withinThreshold: responseTimeMinutes <= MESSAGING_CONFIG.responseTimeThreshold,
      };
    }
  }
  return null;
}

// ===== SEND CUSTOM OFFER =====
export function sendCustomOffer(
  conversationId,
  sellerId,
  offerDetails = {}
) {
  return {
    id: `offer_${Date.now()}`,
    conversationId,
    sellerId,
    type: 'custom_offer',
    offerDetails: {
      title: offerDetails.title || 'Custom Offer',
      description: offerDetails.description || '',
      deliveryDays: offerDetails.deliveryDays || 3,
      price: offerDetails.price || 0,
      revisions: offerDetails.revisions || 0,
      features: offerDetails.features || [],
    },
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    status: 'pending',
    createdAt: new Date(),
  };
}

// ===== ACCEPT CUSTOM OFFER =====
export function acceptCustomOffer(offer, buyerId) {
  if (offer.status !== 'pending') {
    throw new Error('Offer is no longer available');
  }

  if (new Date() > new Date(offer.expiryDate)) {
    throw new Error('Offer has expired');
  }

  return {
    offerId: offer.id,
    buyerId,
    orderId: `order_${Date.now()}`,
    acceptedAt: new Date(),
    status: 'accepted',
    originalOffer: offer,
  };
}

// ===== QUICK REPLY TEMPLATES =====
export const QUICK_REPLY_TEMPLATES = [
  {
    id: 'greeting',
    label: 'Greeting',
    text: 'Hi! Thank you for reaching out. I\'m happy to help.',
  },
  {
    id: 'clarification',
    label: 'Ask for clarification',
    text: 'Could you provide more details about what you need? This will help me deliver the best results.',
  },
  {
    id: 'timeline',
    label: 'Share timeline',
    text: 'I can start working on this immediately and deliver within the agreed timeframe.',
  },
  {
    id: 'revision',
    label: 'Offer revision',
    text: 'I\'m happy to make revisions to better match your expectations.',
  },
  {
    id: 'complete',
    label: 'Work is complete',
    text: 'Your work is complete and ready for download.',
  },
];

// ===== MESSAGE FILTERING =====
export function filterMessages(
  conversation,
  filterType = 'all'
) {
  const filters = {
    all: m => true,
    unread: m => m.state !== MESSAGE_STATES.READ,
    text: m => m.type === 'text',
    files: m => m.attachments?.length > 0,
    offers: m => m.type === 'custom_offer',
  };

  const filterFn = filters[filterType] || filters.all;
  return conversation.messages.filter(filterFn);
}

// ===== AUTO-TRANSLATE MESSAGE =====
export function autoTranslateMessage(message, targetLanguage) {
  return {
    ...message,
    originalLanguage: 'auto',
    translatedTo: targetLanguage,
    translations: {
      [targetLanguage]: message.content, // Placeholder for actual translation
    },
    showTranslation: true,
  };
}

// ===== CALCULATE RESPONSE RATE =====
export function calculateResponseRate(
  sellerId,
  firstResponses = []
) {
  if (firstResponses.length === 0) return 0;

  const withinThreshold = firstResponses.filter(
    fr => fr.withinThreshold === true
  ).length;

  const responseRate = withinThreshold / firstResponses.length;
  const isPenalized = responseRate < MESSAGING_CONFIG.responseRateThreshold;

  return {
    responseRate,
    percentage: Math.round(responseRate * 100),
    withinThresholdCount: withinThreshold,
    totalTrackedResponses: firstResponses.length,
    isPenalized,
    rankingPenalty: isPenalized
      ? Math.max(0, (MESSAGING_CONFIG.responseRateThreshold - responseRate) * 100)
      : 0,
  };
}

// ===== ARCHIVE/UNARCHIVE CONVERSATION =====
export function archiveConversation(conversation) {
  return {
    ...conversation,
    archived: true,
    archivedAt: new Date(),
  };
}

export function unarchiveConversation(conversation) {
  return {
    ...conversation,
    archived: false,
  };
}

// ===== MARK AS SPAM =====
export function reportAsSpam(conversation, reportReason) {
  return {
    ...conversation,
    spam: true,
    spamReportedAt: new Date(),
    spamReason: reportReason,
    status: 'reported',
  };
}

// ===== BLOCK OFF-PLATFORM CONTACT DETECTION =====
export function detectOffPlatformContact(messageContent) {
  const offPlatformPatterns = [
    /email:\s*[\w\.-]+@[\w\.-]+/gi,
    /whatsapp/gi,
    /skype:\s*\w+/gi,
    /telegram/gi,
    /discord/gi,
    /gmail\.com/gi,
    /outlook\.com/gi,
  ];

  const flaggedContent = [];
  offPlatformPatterns.forEach(pattern => {
    const matches = messageContent.match(pattern);
    if (matches) {
      flaggedContent.push(...matches);
    }
  });

  return {
    containsOffPlatformContact: flaggedContent.length > 0,
    flaggedContent,
    warning: 'Sharing off-platform contact information violates Terms of Service',
    message: flaggedContent.length > 0
      ? 'This message may contain off-platform contact information. Please use in-app messaging only.'
      : null,
  };
}

// ===== INBOX MANAGEMENT =====
export function getInboxSummary(conversations, userId) {
  const userConversations = conversations.filter(
    c => c.buyerId === userId || c.sellerId === userId
  );

  const unreadCount = userConversations.filter(conv => {
    if (conv.buyerId === userId) return !conv.buyerRead;
    if (conv.sellerId === userId) return !conv.sellerRead;
    return false;
  }).length;

  const activeCount = userConversations.filter(c => !c.archived && !c.spam).length;
  const archivedCount = userConversations.filter(c => c.archived).length;
  const spamCount = userConversations.filter(c => c.spam).length;

  return {
    totalConversations: userConversations.length,
    unreadCount,
    activeCount,
    archivedCount,
    spamCount,
    lastMessageTime: userConversations[0]?.lastMessageAt,
  };
}

// ===== MESSAGING SYSTEM EXPORT =====
export const MessagingSystem = {
  createConversation,
  sendMessage,
  deliverMessage,
  readMessage,
  trackFirstResponse,
  sendCustomOffer,
  acceptCustomOffer,
  getQuickReplies: () => QUICK_REPLY_TEMPLATES,
  filterMessages,
  autoTranslate: autoTranslateMessage,
  calculateResponseRate,
  archiveConversation,
  unarchiveConversation,
  reportAsSpam,
  detectOffPlatformContact,
  getInboxSummary,
};

export default MessagingSystem;
