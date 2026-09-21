import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../models/user_model.dart';
import '../widgets/glass_card.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  late List<UserModel> _users;

  @override
  void initState() {
    super.initState();
    _users = UserModel.getMockUsers();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Users',
                          style: GoogleFonts.poppins(
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary)),
                      Text('Manage access for ${_users.length} users',
                          style: GoogleFonts.poppins(
                              fontSize: 14, color: AppTheme.textSecondary)),
                    ],
                  ),
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.primary.withOpacity(0.3)),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.person_add_rounded, color: AppTheme.primary),
                      onPressed: () {
                        // TODO: Add new user
                        ScaffoldMessenger.of(context).showSnackBar(
                           const SnackBar(content: Text('Add user feature coming soon!'), backgroundColor: AppTheme.primary)
                        );
                      },
                    ),
                  )
                ],
              ),
            ),

            // List
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _users.length,
                itemBuilder: (_, i) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _userCard(_users[i], i),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _userCard(UserModel user, int index) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 52, height: 52,
            decoration: BoxDecoration(
              color: user.avatarColor.withOpacity(0.15),
              shape: BoxShape.circle,
              border: Border.all(color: user.avatarColor.withOpacity(0.3), width: 1.5),
            ),
            child: Center(
              child: Text(user.initials,
                  style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: user.avatarColor)),
            ),
          ),
          const SizedBox(width: 16),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(user.name,
                        style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimary)),
                    if (user.role == 'Admin')
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.primary.withOpacity(0.3)),
                        ),
                        child: Text('ADMIN', style: GoogleFonts.poppins(fontSize: 9, color: AppTheme.primary, fontWeight: FontWeight.bold)),
                      )
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.schedule_rounded, size: 12, color: AppTheme.textSecondary),
                    const SizedBox(width: 4),
                    Text(user.accessTime, style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                    const SizedBox(width: 12),
                    Icon(Icons.badge_rounded, size: 12, color: AppTheme.textSecondary),
                    const SizedBox(width: 4),
                    Text(user.role, style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                  ],
                )
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Toggle
          Switch(
            value: user.hasAccess,
            onChanged: user.role == 'Admin' ? null : (v) {
              setState(() {
                user.hasAccess = v;
              });
            },
            activeColor: AppTheme.success,
          ),
        ],
      ),
    ).animate().fadeIn(delay: (index * 50).ms).slideX(begin: 0.1, end: 0);
  }
}
