import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _darkThemeEnabled = true;
  bool _biometricEnabled = true;

  String _userName = 'Ahmad Ali';
  String _userEmail = 'admin@doorskill.com';
  String _userAvatar = 'AA';

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    final name = await AuthService.instance.getCurrentUserName();
    final email = await AuthService.instance.getCurrentUserEmail() ?? 'admin@doorskill.com';
    
    final parts = name.split(' ');
    String initial = '';
    if (parts.isNotEmpty && parts[0].isNotEmpty) {
      initial = parts[0][0].toUpperCase();
      if (parts.length > 1 && parts[1].isNotEmpty) {
        initial += parts[1][0].toUpperCase();
      } else if (parts[0].length > 1) {
        initial += parts[0][1].toUpperCase();
      }
    }
    if (initial.isEmpty) initial = 'AA';

    setState(() {
      _userName = name;
      _userEmail = email;
      _userAvatar = initial;
    });
  }

  Future<void> _logout() async {
    await AuthService.instance.signOut();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // Header
            Text('Settings',
                style: GoogleFonts.poppins(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary)),
            Text('Preferences and account management',
                style: GoogleFonts.poppins(
                    fontSize: 14, color: AppTheme.textSecondary)),
            
            const SizedBox(height: 24),

            // Profile Section
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                   Container(
                    width: 60, height: 60,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.secondary]),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primary.withOpacity(0.5), width: 2),
                    ),
                    child: Center(
                      child: Text(_userAvatar, style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_userName, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                        Text(_userEmail, style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_rounded, color: AppTheme.primary),
                    onPressed: () {},
                  )
                ],
              ),
            ).animate().fadeIn().slideY(begin: 0.1),

            const SizedBox(height: 24),

            // Preferences
            Text('Preferences', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
            const SizedBox(height: 12),
            GlassCard(
              child: Column(
                children: [
                  _settingTile(
                    icon: Icons.notifications_active_rounded,
                    color: AppTheme.accent,
                    title: 'Push Notifications',
                    subtitle: 'Alerts for door activity',
                    trailing: Switch(
                      value: _notificationsEnabled,
                      onChanged: (v) => setState(() => _notificationsEnabled = v),
                      activeColor: AppTheme.accent,
                    ),
                  ),
                  const Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Divider(color: AppTheme.divider)),
                  _settingTile(
                    icon: Icons.dark_mode_rounded,
                    color: AppTheme.primary,
                    title: 'Dark Theme',
                    subtitle: 'Use dark appearance',
                    trailing: Switch(
                      value: _darkThemeEnabled,
                      onChanged: (v) => setState(() => _darkThemeEnabled = v),
                      activeColor: AppTheme.primary,
                    ),
                  ),
                  const Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Divider(color: AppTheme.divider)),
                  _settingTile(
                    icon: Icons.fingerprint_rounded,
                    color: AppTheme.success,
                    title: 'Biometric Unlock',
                    subtitle: 'Use fingerprint or face ID',
                    trailing: Switch(
                      value: _biometricEnabled,
                      onChanged: (v) => setState(() => _biometricEnabled = v),
                      activeColor: AppTheme.success,
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1),

            const SizedBox(height: 24),

            // Advanced
            Text('Advanced', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
            const SizedBox(height: 12),
            GlassCard(
              child: Column(
                children: [
                  _settingTile(
                    icon: Icons.lock_reset_rounded,
                    color: AppTheme.warning,
                    title: 'Change PIN',
                    subtitle: 'Update your access PIN',
                    trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.textSecondary),
                    onTap: () {},
                  ),
                  const Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Divider(color: AppTheme.divider)),
                  _settingTile(
                    icon: Icons.wifi_rounded,
                    color: AppTheme.secondary,
                    title: 'Network Setup',
                    subtitle: 'Configure smart lock WiFi',
                    trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.textSecondary),
                    onTap: () {},
                  ),
                  const Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Divider(color: AppTheme.divider)),
                  _settingTile(
                    icon: Icons.info_outline_rounded,
                    color: AppTheme.primaryDark,
                    title: 'About DoorSkill',
                    subtitle: 'Version 1.0.0',
                    trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.textSecondary),
                    onTap: () {},
                  ),
                ],
              ),
            ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),

            const SizedBox(height: 32),

            // Logout Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _logout,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.error.withOpacity(0.15),
                  foregroundColor: AppTheme.error,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: AppTheme.error.withOpacity(0.5))),
                ),
                icon: const Icon(Icons.logout_rounded),
                label: Text('Log Out', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.1),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _settingTile({required IconData icon, required Color color, required String title, required String subtitle, required Widget trailing, VoidCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w500, color: AppTheme.textPrimary)),
                  Text(subtitle, style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                ],
              ),
            ),
            trailing,
          ],
        ),
      ),
    );
  }
}
