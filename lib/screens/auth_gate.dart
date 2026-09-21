import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../models/app_user.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import 'admin_screen.dart';
import 'home_screen.dart';
import 'login_screen.dart';
import 'profile_setup_screen.dart';
import 'worker_dashboard_screen.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    if (!AuthService.instance.isFirebaseReady) {
      return const Scaffold(
        body: Center(child: Text('Firebase is not configured properly.')),
      );
    }

    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snap) {
        final user = snap.data;
        if (user == null) return const LoginScreen();

        return StreamBuilder<AppUser?>(
          stream: FirestoreService.instance.watchUser(user.uid),
          builder: (context, userSnap) {
            final appUser = userSnap.data;
            if (appUser == null) {
              return ProfileSetupScreen(phone: user.phoneNumber ?? '');
            }

            switch (appUser.role) {
              case 'admin':
                return const AdminScreen();
              case 'worker':
                return const WorkerDashboardScreen();
              case 'client':
              default:
                return const HomeScreen();
            }
          },
        );
      },
    );
  }
}
