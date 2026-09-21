import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();

  bool _obscurePass = true;
  bool _obscureConfirmPass = true;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await AuthService.instance.signUp(
        _nameCtrl.text.trim(),
        _emailCtrl.text.trim(),
        _passCtrl.text,
      );

      if (!mounted) return;

      // Toast / SnackBar
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Account created successfully!', style: GoogleFonts.poppins(color: Colors.white)),
          backgroundColor: AppTheme.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );

      // Navigate to Home
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll(RegExp(r'\[.*?\]'), '').trim();
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        children: [
          // Background Glow Top Left
          Positioned(
            top: -120,
            left: -120,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [AppTheme.secondary.withOpacity(0.12), Colors.transparent],
                ),
              ),
            ),
          ),
          // Background Glow Bottom Right
          Positioned(
            bottom: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [AppTheme.primary.withOpacity(0.12), Colors.transparent],
                ),
              ),
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 20),
                      // Back Button
                      Align(
                        alignment: Alignment.topLeft,
                        child: IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.textPrimary),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ).animate().fadeIn(duration: 400.ms),

                      const SizedBox(height: 12),

                      // Logo Header
                      Center(
                        child: Container(
                          width: 72, height: 72,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.secondary]),
                            boxShadow: [
                              BoxShadow(color: AppTheme.primary.withOpacity(0.35), blurRadius: 20, spreadRadius: 4),
                            ],
                          ),
                          child: const Icon(Icons.shield_rounded, color: Colors.white, size: 34),
                        ),
                      ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),

                      const SizedBox(height: 20),

                      Text(
                        'Secure Registration',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ).animate().fadeIn(delay: 150.ms),

                      Text(
                        'Create new keys to initialize node access',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                        ),
                      ).animate().fadeIn(delay: 250.ms),

                      const SizedBox(height: 32),

                      if (_errorMessage != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: AppTheme.error.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.error.withOpacity(0.4)),
                          ),
                          child: Text(
                            _errorMessage!,
                            style: GoogleFonts.poppins(color: AppTheme.error, fontSize: 12),
                            textAlign: TextAlign.center,
                          ),
                        ).animate().shake(duration: 400.ms),

                      const SizedBox(height: 16),

                      // Glassmorphic Form
                      GlassCard(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            // Name Input
                            _buildTextField(
                              controller: _nameCtrl,
                              icon: Icons.person_outline_rounded,
                              label: 'Full Name',
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) return 'Enter your full name';
                                return null;
                              },
                            ),
                            const SizedBox(height: 18),
                            // Email Input
                            _buildTextField(
                              controller: _emailCtrl,
                              icon: Icons.email_outlined,
                              label: 'Email Address',
                              keyboardType: TextInputType.emailAddress,
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) return 'Enter your email address';
                                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(v.trim())) {
                                  return 'Enter a valid email address';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 18),
                            // Password Input
                            _buildTextField(
                              controller: _passCtrl,
                              icon: Icons.lock_outline_rounded,
                              label: 'Password',
                              obscureText: _obscurePass,
                              suffixIcon: IconButton(
                                icon: Icon(_obscurePass ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: AppTheme.textSecondary, size: 20),
                                onPressed: () => setState(() => _obscurePass = !_obscurePass),
                              ),
                              validator: (v) {
                                if (v == null || v.isEmpty) return 'Enter a password';
                                if (v.length < 6) return 'Password must be at least 6 characters';
                                return null;
                              },
                            ),
                            const SizedBox(height: 18),
                            // Confirm Password Input
                            _buildTextField(
                              controller: _confirmPassCtrl,
                              icon: Icons.lock_clock_outlined,
                              label: 'Confirm Password',
                              obscureText: _obscureConfirmPass,
                              suffixIcon: IconButton(
                                icon: Icon(_obscureConfirmPass ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: AppTheme.textSecondary, size: 20),
                                onPressed: () => setState(() => _obscureConfirmPass = !_obscureConfirmPass),
                              ),
                              validator: (v) {
                                if (v != _passCtrl.text) return 'Passwords do not match';
                                return null;
                              },
                            ),
                          ],
                        ),
                      ).animate().fadeIn(delay: 350.ms).slideY(begin: 0.1, end: 0),

                      const SizedBox(height: 28),

                      // Sign Up Button
                      SizedBox(
                        height: 52,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleSignup,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: AppTheme.background,
                            disabledBackgroundColor: AppTheme.primary.withOpacity(0.4),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 22, height: 22,
                                  child: CircularProgressIndicator(color: AppTheme.background, strokeWidth: 2.5),
                                )
                              : Text(
                                  'Generate Credentials',
                                  style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                        ),
                      ).animate().fadeIn(delay: 450.ms),

                      const SizedBox(height: 24),

                      // Connect to Firebase Alert note
                      if (AuthService.instance.isSimulationMode)
                        Center(
                          child: Text(
                            '🛡️ Running in Offline Simulation Mode',
                            style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary.withOpacity(0.6)),
                          ),
                        ).animate().fadeIn(delay: 550.ms),

                      const SizedBox(height: 24),
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

  Widget _buildTextField({
    required TextEditingController controller,
    required IconData icon,
    required String label,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      validator: validator,
      style: GoogleFonts.poppins(fontSize: 14, color: AppTheme.textPrimary),
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: AppTheme.textSecondary, size: 20),
        suffixIcon: suffixIcon,
        labelText: label,
        labelStyle: GoogleFonts.poppins(color: AppTheme.textSecondary, fontSize: 13),
        filled: true,
        fillColor: AppTheme.background.withOpacity(0.5),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.cardBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.cardBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.error, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}
