import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  print('Handling a background message ${message.messageId}');
}

class NotificationService {
  static final NotificationService instance = NotificationService._internal();

  factory NotificationService() {
    return instance;
  }

  NotificationService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // Request permission for notifications
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    print('User granted permission: ${settings.authorizationStatus}');

    // Register background handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Get FCM Token
    try {
      String? token = await _firebaseMessaging.getToken(
        vapidKey: "BFu8WBoBYwtMM91wy6UJq_x81OYFy1mY0uifASGa1ae94dY0Ask7UnEjAHIECnedraW8JBKOcoP4ggZypbnd1qE",
      );
      print("FCM Token: $token");
      
      // Listen to token updates
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        print("FCM Token refreshed: $newToken");
        // TODO: Save the new token to backend/Firestore
      });
    } catch (e) {
      print("Error getting FCM token: $e");
    }

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');

      if (message.notification != null) {
        print('Message also contained a notification: ${message.notification}');
      }
    });
  }
}
