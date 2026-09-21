import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.dark),
        title: Text(
          'Admin Dashboard',
          style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: AppTheme.dark),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          const Padding(
            padding: EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              backgroundColor: AppTheme.roseLight,
              child: Icon(Icons.person, color: AppTheme.rose),
            ),
          )
        ],
      ),
      drawer: Drawer(
        backgroundColor: AppTheme.dark,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Color(0xFF2D0A1E)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.asset('assets/logo.png', height: 40, errorBuilder: (c,e,s) => const Icon(Icons.security, color: AppTheme.rose, size: 40)),
                  const SizedBox(height: 12),
                  Text('DoorSkill Admin', style: GoogleFonts.playfairDisplay(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            _buildDrawerItem(Icons.dashboard, 'Dashboard', true),
            _buildDrawerItem(Icons.people, 'Users', false),
            _buildDrawerItem(Icons.work, 'Jobs', false),
            _buildDrawerItem(Icons.payment, 'Transactions', false),
            _buildDrawerItem(Icons.settings, 'Settings', false),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Overview', style: GoogleFonts.playfairDisplay(fontSize: 28, fontWeight: FontWeight.w900, color: AppTheme.dark)),
            const SizedBox(height: 24),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.2,
              children: [
                _buildStatCard('Total Users', '12,543', Icons.people, AppTheme.blueLight, AppTheme.blue),
                _buildStatCard('Active Jobs', '1,205', Icons.work, AppTheme.greenLight, AppTheme.green),
                _buildStatCard('Total Revenue', '\$45,230', Icons.attach_money, AppTheme.roseLight, AppTheme.rose),
                _buildStatCard('Reports', '12', Icons.flag, const Color(0xFFFFF7ED), const Color(0xFFF97316)),
              ],
            ),
            const SizedBox(height: 32),
            Text('Recent Activity', style: GoogleFonts.dmSans(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.dark)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  _buildActivityItem('New user registered', 'Ali Hassan joined as Plumber', '2 mins ago'),
                  const Divider(),
                  _buildActivityItem('Job Completed', 'AC Repair in Lahore finished', '15 mins ago'),
                  const Divider(),
                  _buildActivityItem('Payment Processed', '\$150 paid to Usman Dev', '1 hour ago'),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, bool isActive) {
    return ListTile(
      leading: Icon(icon, color: isActive ? AppTheme.rose : Colors.white70),
      title: Text(title, style: GoogleFonts.dmSans(color: isActive ? AppTheme.rose : Colors.white70, fontWeight: isActive ? FontWeight.bold : FontWeight.normal)),
      onTap: () {},
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color bgColor, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
        boxShadow: [BoxShadow(color: AppTheme.dark.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const Spacer(),
          Text(value, style: GoogleFonts.playfairDisplay(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.dark)),
          Text(title, style: GoogleFonts.dmSans(fontSize: 13, color: AppTheme.muted)),
        ],
      ),
    );
  }

  Widget _buildActivityItem(String title, String subtitle, String time) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const CircleAvatar(backgroundColor: AppTheme.pinkBg, child: Icon(Icons.notifications, color: AppTheme.rose, size: 16)),
      title: Text(title, style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text(subtitle, style: GoogleFonts.dmSans(fontSize: 12, color: AppTheme.muted)),
      trailing: Text(time, style: GoogleFonts.dmSans(fontSize: 11, color: AppTheme.muted)),
    );
  }
}
