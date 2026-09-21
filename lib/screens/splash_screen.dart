import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import 'auth_gate.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    Future.delayed(const Duration(milliseconds: 3200), () {
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const AuthGate(),
          transitionDuration: const Duration(milliseconds: 700),
          transitionsBuilder: (_, animation, __, child) =>
              FadeTransition(opacity: animation, child: child),
        ),
      );
    });
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        children: [
          // ── Background glow circles ──────────────────────────────────────
          Positioned(
            top: -120, right: -120,
            child: AnimatedBuilder(
              animation: _pulseCtrl,
              builder: (_, __) => Container(
                width: 420 + _pulseCtrl.value * 60,
                height: 420 + _pulseCtrl.value * 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(colors: [
                    AppTheme.primary.withOpacity(0.12),
                    Colors.transparent,
                  ]),
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -160, left: -100,
            child: AnimatedBuilder(
              animation: _pulseCtrl,
              builder: (_, __) => Container(
                width: 380 + _pulseCtrl.value * 50,
                height: 380 + _pulseCtrl.value * 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(colors: [
                    AppTheme.secondary.withOpacity(0.12),
                    Colors.transparent,
                  ]),
                ),
              ),
            ),
          ),

          // ── Center content ───────────────────────────────────────────────
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                  Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primary.withOpacity(0.4),
                          blurRadius: 32,
                          spreadRadius: 8,
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/logo.png',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: AppTheme.primary,
                            child: const Icon(
                              Icons.security_rounded,
                              color: Colors.white,
                              size: 64,
                            ),
                          );
                        },
                      ),
                    ),
                  )
                    .animate()
                    .scale(
                      duration: 700.ms,
                      curve: Curves.elasticOut,
                      begin: const Offset(0.3, 0.3),
                      end: const Offset(1.0, 1.0),
                    )
                    .fadeIn(duration: 400.ms),

                const SizedBox(height: 32),

                Text(
                  'DoorSkill',
                  style: GoogleFonts.poppins(
                    fontSize: 42,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                    letterSpacing: 1.5,
                  ),
                )
                    .animate()
                    .fadeIn(delay: 300.ms, duration: 600.ms)
                    .slideY(begin: 0.4, end: 0),

                const SizedBox(height: 6),

                Text(
                  'Smart Access Control',
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    color: AppTheme.textSecondary,
                    letterSpacing: 3,
                  ),
                ).animate().fadeIn(delay: 500.ms, duration: 600.ms),

                const SizedBox(height: 80),

                // Loading bar
                SizedBox(
                  width: 180,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: const LinearProgressIndicator(
                      backgroundColor: AppTheme.cardColor,
                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primary),
                      minHeight: 3,
                    ),
                  ),
                ).animate().fadeIn(delay: 700.ms),
              ],
            ),
          ),

          // ── Footer ───────────────────────────────────────────────────────
          Positioned(
            bottom: 36, left: 0, right: 0,
            child: Text(
              'Powered by SkyEagle Technologies',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 11,
                color: AppTheme.textSecondary.withOpacity(0.5),
              ),
            ).animate().fadeIn(delay: 900.ms),
          ),
        ],
      ),
    );
  }
}
