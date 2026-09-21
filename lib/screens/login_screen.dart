import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../widgets/glass_card.dart';
import 'auth_gate.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  final _phoneCtrl = TextEditingController(text: '+');
  final _otpCtrl = TextEditingController();
  
  bool _isLoading = false;
  bool _otpSent = false;
  String? _errorMessage;
  
  late AnimationController _shakeCtrl;
  late Animation<double> _shakeAnim;

  @override
  void initState() {
    super.initState();
    _shakeCtrl = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _shakeAnim = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: -18.0), weight: 1),
      TweenSequenceItem(tween: Tween(begin: -18.0, end: 18.0), weight: 2),
      TweenSequenceItem(tween: Tween(begin: 18.0, end: -12.0), weight: 2),
      TweenSequenceItem(tween: Tween(begin: -12.0, end: 12.0), weight: 2),
      TweenSequenceItem(tween: Tween(begin: 12.0, end: 0.0), weight: 1),
    ]).animate(CurvedAnimation(parent: _shakeCtrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _shakeCtrl.dispose();
    _phoneCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  void _showError(String message) {
    setState(() {
      _errorMessage = message;
      _isLoading = false;
    });
    _shakeCtrl.forward(from: 0);
  }

  Future<void> _sendOtp() async {
    final phone = _phoneCtrl.text.trim();
    if (phone.isEmpty || phone.length < 8) {
      _showError('Please enter a valid phone number with country code');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    await AuthService.instance.verifyPhone(
      phone,
      onCodeSent: () {
        if (!mounted) return;
        setState(() {
          _otpSent = true;
          _isLoading = false;
        });
      },
      onError: (err) {
        if (!mounted) return;
        _showError(err);
      },
    );
  }

  Future<void> _verifyOtp() async {
    final otp = _otpCtrl.text.trim();
    if (otp.length != 6) {
      _showError('Please enter the 6-digit OTP');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    bool success = await AuthService.instance.verifyOTP(otp);
    
    if (!mounted) return;
    
    if (success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const AuthGate()),
      );
    } else {
      _showError('Invalid OTP. Please try again.');
    }
  }

  Widget _buildPhoneInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          controller: _phoneCtrl,
          keyboardType: TextInputType.phone,
          style: GoogleFonts.poppins(color: AppTheme.textPrimary),
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.phone_android, color: AppTheme.textSecondary),
            labelText: 'Phone Number (e.g. +1234567890)',
            labelStyle: GoogleFonts.poppins(color: AppTheme.textSecondary, fontSize: 13),
            filled: true,
            fillColor: AppTheme.background.withOpacity(0.5),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.cardBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.cardBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.primary, width: 1.5)),
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _isLoading ? null : _sendOtp,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: _isLoading 
            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : Text('Send OTP', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        ),
      ],
    );
  }

  Widget _buildOtpInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          controller: _otpCtrl,
          keyboardType: TextInputType.number,
          maxLength: 6,
          style: GoogleFonts.poppins(color: AppTheme.textPrimary, letterSpacing: 8, fontSize: 24, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
          decoration: InputDecoration(
            counterText: "",
            hintText: "••••••",
            hintStyle: GoogleFonts.poppins(color: AppTheme.textSecondary.withOpacity(0.5)),
            filled: true,
            fillColor: AppTheme.background.withOpacity(0.5),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.cardBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.cardBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.primary, width: 1.5)),
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _isLoading ? null : _verifyOtp,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: _isLoading 
            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : Text('Verify Secure Code', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () {
            setState(() {
              _otpSent = false;
              _otpCtrl.clear();
              _errorMessage = null;
            });
          },
          child: Text("Change Phone Number", style: GoogleFonts.poppins(color: AppTheme.textSecondary)),
        )
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        children: [
          Positioned(
            top: -80, right: -80,
            child: Container(
              width: 280, height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [AppTheme.primary.withOpacity(0.12), Colors.transparent]),
              ),
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: AnimatedBuilder(
                  animation: _shakeAnim,
                  builder: (_, child) => Transform.translate(
                    offset: Offset(_shakeAnim.value, 0),
                    child: child,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // App Logo
                      Container(
                        width: 120, height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: AppTheme.primary.withOpacity(0.35), blurRadius: 24, spreadRadius: 6),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            'assets/logo.png',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: AppTheme.primary,
                                child: const Icon(Icons.security, size: 60, color: Colors.white),
                              );
                            },
                          ),
                        ),
                      ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
                      
                      const SizedBox(height: 24),
                      Text('DoorSkill Access', style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
                      Text(
                        _otpSent ? 'Enter the 6-digit code sent to ${_phoneCtrl.text}' : 'Secure Phone Authentication',
                        style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textSecondary),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      
                      if (_errorMessage != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: AppTheme.error.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.error.withOpacity(0.4)),
                          ),
                          child: Text(_errorMessage!, style: GoogleFonts.poppins(color: AppTheme.error, fontSize: 12), textAlign: TextAlign.center),
                        ),
                        
                      GlassCard(
                        padding: const EdgeInsets.all(20),
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          child: _otpSent ? _buildOtpInput() : _buildPhoneInput(),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
