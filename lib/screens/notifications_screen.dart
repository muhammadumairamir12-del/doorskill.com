import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, String>> _allNotifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Core default alerts
    final List<Map<String, String>> list = [
      {'title': 'Door Left Open', 'body': 'The front door has been open for 5 minutes.', 'time': '5m ago', 'type': 'alert'},
      {'title': 'Guest Arrival', 'body': 'Delivery Guest unlocked the door using PIN.', 'time': '1h ago', 'type': 'info'},
      {'title': 'Auto-Lock Engaged', 'body': 'Front door was automatically locked.', 'time': '2h ago', 'type': 'success'},
      {'title': 'Low Battery', 'body': 'Smart lock battery is at 15%. Please replace soon.', 'time': '1d ago', 'type': 'warning'},
    ];

    // Load SharedPreferences custom security notifications
    final String notificationsJson = prefs.getString('security_notifications') ?? '[]';
    try {
      final List<dynamic> customList = json.decode(notificationsJson);
      for (var item in customList) {
        final timestampStr = item['timestamp'] as String;
        final dt = DateTime.parse(timestampStr);
        final diff = DateTime.now().difference(dt);
        String timeAgo = 'Just now';
        if (diff.inMinutes >= 1 && diff.inMinutes < 60) {
          timeAgo = '${diff.inMinutes}m ago';
        } else if (diff.inHours >= 1 && diff.inHours < 24) {
          timeAgo = '${diff.inHours}h ago';
        } else if (diff.inDays >= 1) {
          timeAgo = '${diff.inDays}d ago';
        }

        list.insert(0, {
          'title': item['title']?.toString() ?? 'Security Alert',
          'body': item['message']?.toString() ?? 'Security Alert details',
          'time': timeAgo,
          'type': 'alert',
        });
      }
    } catch (e) {
      print("Error loading custom notifications: $e");
    }

    setState(() {
      _allNotifications = list;
      _isLoading = false;
    });
  }

  Future<void> _clearAllNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('security_notifications', '[]');
    await _loadNotifications();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Notifications'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (_allNotifications.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_outlined, color: AppTheme.error),
              onPressed: () {
                _clearAllNotifications();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Custom notification logs cleared.', style: GoogleFonts.poppins()),
                    backgroundColor: AppTheme.error,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                );
              },
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _allNotifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.notifications_off_rounded, size: 64, color: AppTheme.textSecondary),
                      const SizedBox(height: 16),
                      Text('No new notifications', style: GoogleFonts.poppins(color: AppTheme.textSecondary)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _allNotifications.length,
                  itemBuilder: (context, i) {
                    final notif = _allNotifications[i];
                    Color col;
                    IconData icon;

                    switch (notif['type']) {
                      case 'alert':
                        col = AppTheme.error;
                        icon = Icons.warning_rounded;
                        break;
                      case 'warning':
                        col = AppTheme.warning;
                        icon = Icons.battery_alert_rounded;
                        break;
                      case 'success':
                        col = AppTheme.success;
                        icon = Icons.lock_rounded;
                        break;
                      default:
                        col = AppTheme.primary;
                        icon = Icons.info_outline_rounded;
                    }

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GlassCard(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(color: col.withOpacity(0.15), shape: BoxShape.circle),
                              child: Icon(icon, color: col, size: 22),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          notif['title']!,
                                          style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      Text(notif['time']!, style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textSecondary)),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(notif['body']!, style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                    ).animate().fadeIn(delay: (i * 80).ms).slideX(begin: 0.08),
                  },
                ),
    );
  }
}
