import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static final AuthService instance = AuthService._internal();
  AuthService._internal();

  bool _isFirebaseInitialized = false;

  // Firebase auth instance (if initialized)
  FirebaseAuth? _firebaseAuth;

  // Local storage keys
  static const String _userPinKey = 'user_pin';

  bool get isFirebaseReady => _isFirebaseInitialized;
  bool get isSimulationMode => !_isFirebaseInitialized || _firebaseAuth == null;

  FirebaseAuth? get firebaseAuth => _firebaseAuth;
  User? get currentUser => _firebaseAuth?.currentUser;
  String? get currentUserId => currentUser?.uid;

  String? _verificationId;

  // Initialize service
  Future<void> initialize() async {
    try {
      await Firebase.initializeApp();
      _firebaseAuth = FirebaseAuth.instance;
      _isFirebaseInitialized = true;
    } catch (e) {
      _isFirebaseInitialized = false;
    }
  }

  // Check if user is logged in
  bool get isLoggedIn {
    if (!_isFirebaseInitialized || _firebaseAuth == null) return false;
    return _firebaseAuth!.currentUser != null;
  }

  // Get current authenticated user phone number
  String? getCurrentUserPhone() {
    if (!_isFirebaseInitialized || _firebaseAuth == null) return null;
    return _firebaseAuth!.currentUser?.phoneNumber;
  }

  Future<String> getCurrentUserName() async {
    final u = currentUser;
    if (u == null) return 'User';
    final n = u.displayName;
    if (n != null && n.trim().isNotEmpty) return n.trim();
    final p = u.phoneNumber;
    if (p != null && p.trim().isNotEmpty) return p.trim();
    final e = u.email;
    if (e != null && e.trim().isNotEmpty) return e.trim();
    return 'User';
  }

  Future<String?> getCurrentUserEmail() async {
    return currentUser?.email;
  }

  // Verify Phone Number (Sends OTP)
  Future<void> verifyPhone(
    String phoneNumber, {
    required Function() onCodeSent,
    required Function(String) onError,
  }) async {
    if (!_isFirebaseInitialized || _firebaseAuth == null) {
      onError("Firebase is not initialized.");
      return;
    }

    try {
      await _firebaseAuth!.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          // Auto-resolution (mostly Android only)
          await _firebaseAuth!.signInWithCredential(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          onError(e.message ?? "Verification failed");
        },
        codeSent: (String verificationId, int? resendToken) {
          _verificationId = verificationId;
          onCodeSent();
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          _verificationId = verificationId;
        },
      );
    } catch (e) {
      onError(e.toString());
    }
  }

  // Verify OTP Code
  Future<bool> verifyOTP(String smsCode) async {
    if (!_isFirebaseInitialized || _firebaseAuth == null || _verificationId == null) {
      return false;
    }

    try {
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: smsCode,
      );

      await _firebaseAuth!.signInWithCredential(credential);
      
      // Default PIN for new users
      final prefs = await SharedPreferences.getInstance();
      if (prefs.getString(_userPinKey) == null) {
        await prefs.setString(_userPinKey, '1234');
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> signUp(String name, String email, String password) async {
    if (!_isFirebaseInitialized || _firebaseAuth == null) {
      throw Exception('Firebase is not initialized.');
    }
    final cred = await _firebaseAuth!.createUserWithEmailAndPassword(email: email, password: password);
    await cred.user?.updateDisplayName(name);
  }

  Future<void> signInWithEmail(String email, String password) async {
    if (!_isFirebaseInitialized || _firebaseAuth == null) {
      throw Exception('Firebase is not initialized.');
    }
    await _firebaseAuth!.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<void> resetPassword(String email) async {
    if (!_isFirebaseInitialized || _firebaseAuth == null) {
      throw Exception('Firebase is not initialized.');
    }
    await _firebaseAuth!.sendPasswordResetEmail(email: email);
  }

  // Sign Out
  Future<void> signOut() async {
    if (!_isFirebaseInitialized || _firebaseAuth == null) return;
    await _firebaseAuth!.signOut();
  }

  // Update Access PIN
  Future<void> updatePin(String newPin) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userPinKey, newPin);
  }

  // Get current lock PIN
  Future<String> getPin() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userPinKey) ?? '1234';
  }
}
