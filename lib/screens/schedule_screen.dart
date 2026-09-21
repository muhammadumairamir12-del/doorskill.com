import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  bool _autoLockEnabled = true;
  double _autoLockDelay = 5.0; // minutes
  bool _guestAccessEnabled = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // Header
            Text('Automation',
                style: GoogleFonts.poppins(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary)),
            Text('Manage schedules and auto-locking',
                style: GoogleFonts.poppins(
                    fontSize: 14, color: AppTheme.textSecondary)),
            
            const SizedBox(height: 24),

            // Auto-lock Settings
            Text('Security', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.primary)),
            const SizedBox(height: 12),
            GlassCard(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                            child: const Icon(Icons.timer_rounded, color: AppTheme.primary, size: 20),
                          ),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Auto-Lock', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w500, color: AppTheme.textPrimary)),
                              Text('Automatically lock after delay', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                            ],
                          ),
                        ],
                      ),
                      Switch(
                        value: _autoLockEnabled,
                        onChanged: (v) => setState(() => _autoLockEnabled = v),
                        activeColor: AppTheme.primary,
                      ),
                    ],
                  ),
                  if (_autoLockEnabled) ...[
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8.0),
                      child: Divider(color: AppTheme.divider),
                    ),
                    Row(
                      children: [
                        Text('Delay: ${_autoLockDelay.toInt()} mins', style: GoogleFonts.poppins(color: AppTheme.textSecondary, fontSize: 13)),
                        Expanded(
                          child: Slider(
                            value: _autoLockDelay,
                            min: 1,
                            max: 15,
                            divisions: 14,
                            activeColor: AppTheme.primary,
                            onChanged: (v) => setState(() => _autoLockDelay = v),
                          ),
                        ),
                      ],
                    )
                  ]
                ],
              ),
            ).animate().fadeIn().slideY(begin: 0.1),

            const SizedBox(height: 24),

            // Schedules
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Active Schedules', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.secondary)),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add_rounded, size: 18, color: AppTheme.secondary),
                  label: Text('New', style: GoogleFonts.poppins(color: AppTheme.secondary)),
                )
              ],
            ),
            const SizedBox(height: 8),
            _scheduleCard('Morning Routine', 'Unlock 7:00 AM • Lock 9:00 AM', true, AppTheme.success, 0),
            const SizedBox(height: 12),
            _scheduleCard('Evening Lockup', 'Lock 10:00 PM • Daily', true, AppTheme.warning, 1),

            const SizedBox(height: 24),

            // Temporary Access
            Text('Temporary Access', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.accent)),
            const SizedBox(height: 12),
            GlassCard(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                       Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: AppTheme.accent.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.vpn_key_rounded, color: AppTheme.accent, size: 20),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Guest PIN Code', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w500, color: AppTheme.textPrimary)),
                          Text('Valid for next 24 hours', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                        ],
                      ),
                    ],
                  ),
                  Switch(
                    value: _guestAccessEnabled,
                    onChanged: (v) => setState(() => _guestAccessEnabled = v),
                    activeColor: AppTheme.accent,
                  ),
                ],
              ),
            ).animate().fadeIn().slideY(begin: 0.1),
          ],
        ),
      ),
    );
  }

  Widget _scheduleCard(String title, String subtitle, bool isActive, Color color, int index) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(color: color.withOpacity(0.15), shape: BoxShape.circle),
                child: Icon(Icons.event_note_rounded, color: color, size: 20),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                  Text(subtitle, style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                ],
              )
            ],
          ),
          Switch(
            value: isActive,
            onChanged: (v) {},
            activeColor: color,
          )
        ],
      )
    ).animate().fadeIn(delay: (100 * index).ms).slideX(begin: 0.05);
  }
}
