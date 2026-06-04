// ===== MESSAGING SYSTEM =====

export async function sendMessage(orderId, senderId, senderName, senderAvatar, messageText, messageType = 'text') {
  try {
    const messagesRef = collection(db, 'orders', orderId, 'messages');
    const msgRef = await addDoc(messagesRef, {
      senderId,
      senderName,
      senderAvatar,
      message: messageText,
      messageType, // 'text', 'image', 'file', 'offer'
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update order lastMessage for quick access
    await updateDoc(doc(db, 'orders', orderId), {
      lastMessage: messageText.substring(0, 100),
      lastMessageTime: new Date(),
      lastMessageSenderId: senderId
    });

    return msgRef.id;
  } catch (error) {
    console.error("[v0] Error sending message:", error);
    return null;
  }
}

export async function getMessages(orderId, limit = 50) {
  try {
    const messagesRef = collection(db, 'orders', orderId, 'messages');
    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    const snapshot = await getDocs(q);
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error("[v0] Error fetching messages:", error);
    return [];
  }
}

export async function markMessageAsRead(orderId, messageId) {
  try {
    const messageRef = doc(db, 'orders', orderId, 'messages', messageId);
    await updateDoc(messageRef, {
      isRead: true,
      readAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("[v0] Error marking message as read:", error);
    return false;
  }
}

export async function sendCustomOffer(buyerId, sellerId, orderId, offerData) {
  try {
    const offersRef = collection(db, 'orders', orderId, 'customOffers');
    const offerRef = await addDoc(offersRef, {
      buyerId,
      sellerId,
      title: offerData.title,
      description: offerData.description,
      price: offerData.price,
      deliveryDays: offerData.deliveryDays,
      revisions: offerData.revisions || 3,
      status: 'pending', // pending, accepted, declined, expired
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date()
    });

    // Send offer notification message
    await sendMessage(
      orderId,
      sellerId,
      'System',
      '',
      `Custom offer: ${offerData.title} - $${offerData.price}`,
      'offer'
    );

    return offerRef.id;
  } catch (error) {
    console.error("[v0] Error creating custom offer:", error);
    return null;
  }
}

export async function respondToOffer(orderId, offerId, response) {
  try {
    const offerRef = doc(db, 'orders', orderId, 'customOffers', offerId);
    await updateDoc(offerRef, {
      status: response === 'accept' ? 'accepted' : 'declined',
      respondedAt: new Date(),
      respondedBy: response
    });

    if (response === 'accept') {
      // Update order with accepted offer
      await updateDoc(doc(db, 'orders', orderId), {
        customOfferApplied: offerId,
        status: 'accepted'
      });
    }

    return true;
  } catch (error) {
    console.error("[v0] Error responding to offer:", error);
    return false;
  }
}

export async function getConversations(userId, role = 'buyer') {
  try {
    const ordersRef = collection(db, 'orders');
    let q;

    if (role === 'buyer') {
      q = query(
        ordersRef,
        where('buyerId', '==', userId),
        orderBy('lastMessageTime', 'desc')
      );
    } else {
      q = query(
        ordersRef,
        where('sellerId', '==', userId),
        orderBy('lastMessageTime', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const conversations = [];
    snapshot.forEach(doc => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
    return conversations;
  } catch (error) {
    console.error("[v0] Error fetching conversations:", error);
    return [];
  }
}

export async function getUnreadCount(userId, role = 'buyer') {
  try {
    const ordersRef = collection(db, 'orders');
    let q;

    if (role === 'buyer') {
      q = query(
        ordersRef,
        where('buyerId', '==', userId),
        where('unreadBuyerMessages', '>', 0)
      );
    } else {
      q = query(
        ordersRef,
        where('sellerId', '==', userId),
        where('unreadSellerMessages', '>', 0)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("[v0] Error fetching unread count:", error);
    return 0;
  }
}

export async function uploadMessageAttachment(orderId, file, fileType = 'image') {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const storagePath = `orders/${orderId}/attachments/${fileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      name: file.name,
      type: fileType,
      size: file.size
    };
  } catch (error) {
    console.error("[v0] Error uploading attachment:", error);
    return null;
  }
}

export function subscribeToMessages(orderId, callback) {
  try {
    const messagesRef = collection(db, 'orders', orderId, 'messages');
    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      callback(messages);
    });

    return unsubscribe;
  } catch (error) {
    console.error("[v0] Error subscribing to messages:", error);
    return null;
  }
}
