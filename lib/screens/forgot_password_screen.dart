import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../services/auth_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;
  bool _emailSent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleReset() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await AuthService.instance.resetPassword(_emailCtrl.text.trim());
      setState(() => _emailSent = true);
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
          // Background Glow Centered
          Positioned(
            top: 100, left: 20, right: 20,
            child: Container(
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [AppTheme.primary.withOpacity(0.08), Colors.transparent],
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
                      Align(
                        alignment: Alignment.topLeft,
                        child: IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.textPrimary),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ).animate().fadeIn(),

                      const SizedBox(height: 16),

                      Center(
                        child: Container(
                          width: 80, height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppTheme.warning.withOpacity(0.12),
                            border: Border.all(color: AppTheme.warning.withOpacity(0.4), width: 1.5),
                          ),
                          child: const Icon(Icons.lock_open_rounded, color: AppTheme.warning, size: 36),
                        ),
                      ).animate().scale(duration: 400.ms, curve: Curves.elasticOut),

                      const SizedBox(height: 24),

                      Text(
                        'Reset Security Credentials',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ).animate().fadeIn(delay: 150.ms),

                      const SizedBox(height: 8),

                      Text(
                        'Provide your registered email address to receive password reset keys',
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
                          margin: const EdgeInsets.only(bottom: 16),
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
                        ).animate().shake(),

                      if (_emailSent)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.success.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.success.withOpacity(0.5)),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.mark_email_read_rounded, color: AppTheme.success, size: 40),
                              const SizedBox(height: 12),
                              Text(
                                'Reset Instructions Dispatched!',
                                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                AuthService.instance.isSimulationMode
                                    ? 'SIMULATION MODE: Simulated security keys sent successfully. Use password "password123" for demo.'
                                    : 'A secure recovery connection email has been sent to ${_emailCtrl.text}. Check your inbox.',
                                style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ).animate().scale(duration: 400.ms)
                      else
                        GlassCard(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              TextFormField(
                                controller: _emailCtrl,
                                keyboardType: TextInputType.emailAddress,
                                style: GoogleFonts.poppins(fontSize: 14, color: AppTheme.textPrimary),
                                validator: (v) {
                                  if (v == null || v.trim().isEmpty) return 'Enter your email address';
                                  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(v.trim())) {
                                    return 'Enter a valid email address';
                                  }
                                  return null;
                                },
                                decoration: InputDecoration(
                                  prefixIcon: const Icon(Icons.email_outlined, color: AppTheme.textSecondary, size: 20),
                                  labelText: 'Email Address',
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
                              ),
                            ],
                          ),
                        ).animate().fadeIn(delay: 350.ms),

                      const SizedBox(height: 28),

                      if (!_emailSent)
                        SizedBox(
                          height: 52,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _handleReset,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primary,
                              foregroundColor: AppTheme.background,
                              disabledBackgroundColor: AppTheme.primary.withOpacity(0.4),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 0,
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 22, height: 22,
                                    child: CircularProgressIndicator(color: AppTheme.background, strokeWidth: 2.5),
                                  )
                                : Text(
                                    'Dispatch Reset Keys',
                                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                          ),
                        ).animate().fadeIn(delay: 450.ms),

                      const SizedBox(height: 40),
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
