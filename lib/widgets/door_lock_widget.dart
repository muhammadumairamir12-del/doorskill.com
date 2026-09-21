import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class DoorLockWidget extends StatefulWidget {
  final bool isLocked;
  final VoidCallback onToggle;

  const DoorLockWidget({
    super.key,
    required this.isLocked,
    required this.onToggle,
  });

  @override
  State<DoorLockWidget> createState() => _DoorLockWidgetState();
}

class _DoorLockWidgetState extends State<DoorLockWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _pressCtrl;
  late Animation<double> _pressAnim;

  @override
  void initState() {
    super.initState();
    _pressCtrl = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _pressAnim = Tween<double>(begin: 1.0, end: 0.88).animate(
      CurvedAnimation(parent: _pressCtrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pressCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleTap() async {
    await _pressCtrl.forward();
    await _pressCtrl.reverse();
    widget.onToggle();
  }

  @override
  Widget build(BuildContext context) {
    final locked = widget.isLocked;
    final col = locked ? AppTheme.error : AppTheme.success;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: col.withOpacity(0.30), width: 1.5),
        boxShadow: [
          BoxShadow(color: col.withOpacity(0.12), blurRadius: 24, spreadRadius: 4),
        ],
      ),
      child: Column(
        children: [
          // Title row
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.door_front_door_rounded,
                  size: 18, color: AppTheme.textSecondary),
              const SizedBox(width: 8),
              Text(
                'Front Door Control',
                style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary),
              ),
            ],
          ),

          const SizedBox(height: 28),

          // ── Animated lock button ─────────────────────────────────────────
          GestureDetector(
            onTap: _handleTap,
            child: ScaleTransition(
              scale: _pressAnim,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Outer glow ring
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 600),
                    curve: Curves.easeInOut,
                    width: 170,
                    height: 170,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: col.withOpacity(0.18), width: 2),
                    ),
                  ),
                  // Middle ring
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 600),
                    curve: Curves.easeInOut,
                    width: 136,
                    height: 136,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: col.withOpacity(0.35), width: 2),
                    ),
                  ),
                  // Core button
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 600),
                    curve: Curves.easeInOut,
                    width: 106,
                    height: 106,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [col.withOpacity(0.32), col.withOpacity(0.10)],
                      ),
                      border: Border.all(color: col.withOpacity(0.6), width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: col.withOpacity(0.35),
                          blurRadius: 24,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 400),
                      transitionBuilder: (child, anim) => ScaleTransition(
                        scale: anim,
                        child: child,
                      ),
                      child: Icon(
                        locked
                            ? Icons.lock_rounded
                            : Icons.lock_open_rounded,
                        key: ValueKey(locked),
                        size: 46,
                        color: col,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Status text
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 350),
            child: Text(
              locked ? '🔒  LOCKED' : '🔓  UNLOCKED',
              key: ValueKey(locked),
              style: GoogleFonts.poppins(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: col,
                letterSpacing: 2,
              ),
            ),
          ),

          const SizedBox(height: 6),

          Text(
            locked ? 'Tap the button above to unlock' : 'Tap the button above to lock',
            style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textSecondary),
          ),

          const SizedBox(height: 20),

          // Info bar
          Container(
            height: 46,
            decoration: BoxDecoration(
              color: AppTheme.background,
              borderRadius: BorderRadius.circular(23),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.touch_app_rounded, size: 16, color: AppTheme.textSecondary),
                const SizedBox(width: 8),
                Text(
                  'Tap the glowing circle to toggle',
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 500.ms)
        .slideY(begin: 0.2, end: 0, curve: Curves.easeOutCubic);
  }
}
