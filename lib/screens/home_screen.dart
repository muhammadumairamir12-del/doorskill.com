import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/job.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../theme/app_theme.dart';
import 'call_screen.dart';
import 'job_detail_screen.dart';
import 'post_job_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _isScrolled = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(() {
      if (_scrollController.offset > 50 && !_isScrolled) {
        setState(() => _isScrolled = true);
      } else if (_scrollController.offset <= 50 && _isScrolled) {
        setState(() => _isScrolled = false);
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.instance.currentUserId;
    return Scaffold(
      backgroundColor: AppTheme.cream,
      extendBodyBehindAppBar: true,
      floatingActionButton: uid == null
          ? null
          : FloatingActionButton.extended(
              backgroundColor: AppTheme.rose,
              foregroundColor: Colors.white,
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const PostJobScreen()));
              },
              icon: const Icon(Icons.add),
              label: Text('Post Job', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold)),
            ),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(68),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          decoration: BoxDecoration(
            color: _isScrolled ? Colors.white.withOpacity(0.95) : Colors.transparent,
            border: Border(bottom: BorderSide(color: _isScrolled ? AppTheme.border : Colors.transparent)),
            boxShadow: _isScrolled ? [const BoxShadow(color: Color(0x1AF43F5E), blurRadius: 24, offset: Offset(0, 4))] : [],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Image.asset('assets/logo.png', height: 32, errorBuilder: (c,e,s) => const Icon(Icons.security, color: AppTheme.rose)),
                      const SizedBox(width: 8),
                      Text('DoorSkill', style: GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.rose, letterSpacing: -0.5)),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton(icon: const Icon(Icons.search, color: AppTheme.dark), onPressed: () {}),
                      IconButton(
                        icon: const Icon(Icons.settings_outlined, color: AppTheme.dark),
                        onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
                        },
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        controller: _scrollController,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeroSection(),
            if (uid != null) _buildMyJobs(uid),
            _buildParallaxStats(),
            _buildServicesSection(),
            _buildHowItWorks(),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildMyJobs(String uid) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('My Jobs', style: GoogleFonts.playfairDisplay(fontSize: 26, fontWeight: FontWeight.w900, color: AppTheme.dark)),
              const Spacer(),
              Text('Tap to view bids', style: GoogleFonts.dmSans(fontSize: 12, color: AppTheme.muted)),
            ],
          ),
          const SizedBox(height: 14),
          StreamBuilder<List<Job>>(
            stream: FirestoreService.instance.watchClientJobs(uid),
            builder: (context, snap) {
              final jobs = snap.data ?? <Job>[];
              if (!snap.hasData) {
                return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()));
              }
              if (jobs.isEmpty) {
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.border)),
                  child: Text('No jobs posted yet', style: GoogleFonts.dmSans(color: AppTheme.muted)),
                );
              }
              return Column(
                children: jobs.take(3).map((j) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.border)),
                    child: ListTile(
                      title: Text(j.title, style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: AppTheme.dark)),
                      subtitle: Text(j.category, style: GoogleFonts.dmSans(color: AppTheme.muted)),
                      trailing: Text('PKR ${j.budget}', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: AppTheme.rose)),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => JobDetailScreen(jobId: j.id)));
                      },
                    ),
                  );
                }).toList(),
              );
            },
          )
        ],
      ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 80, bottom: 60, left: 24, right: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.white, AppTheme.pinkBg, AppTheme.roseLight, Color(0xFFFFD6E4)],
          stops: [0.0, 0.35, 0.65, 1.0],
        ),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Background Blobs (Simplified for Flutter)
          Positioned(
            top: -50, right: -100,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(shape: BoxShape.circle, color: AppTheme.roseMedium.withOpacity(0.18)),
            ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(begin: const Offset(1,1), end: const Offset(1.1, 1.1), duration: 4.seconds),
          ),
          
          Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Live Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.rose.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: AppTheme.rose.withOpacity(0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8, height: 8,
                      decoration: const BoxDecoration(color: AppTheme.green, shape: BoxShape.circle),
                    ).animate(onPlay: (c) => c.repeat(reverse: true)).fade(begin: 1, end: 0.5, duration: 1.seconds),
                    const SizedBox(width: 8),
                    Text('1,200+ Workers Online', style: GoogleFonts.dmSans(color: AppTheme.rose, fontWeight: FontWeight.w600, fontSize: 13)),
                  ],
                ),
              ).animate().fadeIn(duration: 600.ms).slideY(begin: -0.2),
              
              const SizedBox(height: 24),
              
              // Heading
              Text(
                'Find Any Professional\nAnywhere in the World',
                textAlign: TextAlign.center,
                style: GoogleFonts.playfairDisplay(fontSize: 36, fontWeight: FontWeight.w900, color: AppTheme.dark, height: 1.1),
              ).animate().fadeIn(delay: 100.ms, duration: 600.ms).slideY(begin: 0.1),
              
              const SizedBox(height: 32),
              
              // Colorful Search Bar
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: const LinearGradient(colors: [AppTheme.blue, AppTheme.indigo, AppTheme.rose, AppTheme.cyan]),
                  boxShadow: [BoxShadow(color: AppTheme.indigo.withOpacity(0.25), blurRadius: 20, spreadRadius: 2)],
                ),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(17)),
                  child: Row(
                    children: [
                      const Icon(Icons.search, color: AppTheme.muted),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            hintText: 'Search "Plumber", "Doctor"...',
                            hintStyle: GoogleFonts.dmSans(color: AppTheme.muted),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      Container(width: 1, height: 24, color: AppTheme.border, margin: const EdgeInsets.symmetric(horizontal: 8)),
                      Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [AppTheme.blue, AppTheme.indigo]),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [BoxShadow(color: AppTheme.blue.withOpacity(0.3), blurRadius: 10)],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(12),
                            onTap: () {},
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              child: Text('Search', style: GoogleFonts.dmSans(color: Colors.white, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(delay: 200.ms, duration: 600.ms).slideY(begin: 0.1),
              
              const SizedBox(height: 24),
              
              Text(
                'DoorSkill connects you with verified professionals globally for freelance, local services, and remote work.',
                textAlign: TextAlign.center,
                style: GoogleFonts.dmSans(color: AppTheme.mid, fontSize: 15, height: 1.5),
              ).animate().fadeIn(delay: 300.ms, duration: 600.ms),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildParallaxStats() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [AppTheme.dark, Color(0xFF2D0A1E)]),
      ),
      child: Column(
        children: [
          Text('Global Marketplace', style: GoogleFonts.playfairDisplay(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white)),
          const SizedBox(height: 8),
          Text('Connecting thousands daily', style: GoogleFonts.dmSans(color: Colors.white70, fontSize: 15)),
          const SizedBox(height: 40),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatItem('5,000+', 'Daily Jobs'),
              _buildStatItem('2,400+', 'Active Providers'),
              _buildStatItem('99%', 'Satisfaction'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String num, String label) {
    return Column(
      children: [
        Text(num, style: GoogleFonts.playfairDisplay(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.roseLight)),
        const SizedBox(height: 4),
        Text(label, style: GoogleFonts.dmSans(fontSize: 13, color: Colors.white70)),
      ],
    );
  }

  Widget _buildServicesSection() {
    final services = [
      {'icon': Icons.plumbing, 'title': 'Home Repair', 'count': '420+ Providers', 'color': const Color(0xFFFFF0F5)},
      {'icon': Icons.school, 'title': 'Education', 'count': '350+ Tutors', 'color': const Color(0xFFEFF6FF)},
      {'icon': Icons.medical_services, 'title': 'Health', 'count': '180+ Professionals', 'color': const Color(0xFFF0FDF4)},
      {'icon': Icons.computer, 'title': 'IT & Tech', 'count': '500+ Experts', 'color': const Color(0xFFF0F9FF)},
    ];

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(color: AppTheme.roseLight, borderRadius: BorderRadius.circular(20)),
            child: Text('CATEGORIES', style: GoogleFonts.dmSans(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.rose, letterSpacing: 1.2)),
          ),
          const SizedBox(height: 12),
          Text('Explore Services', style: GoogleFonts.playfairDisplay(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.dark)),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 0.85,
            ),
            itemCount: services.length,
            itemBuilder: (context, index) {
              final s = services[index];
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                  boxShadow: [BoxShadow(color: AppTheme.rose.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () {},
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 48, height: 48,
                            decoration: BoxDecoration(color: s['color'] as Color, borderRadius: BorderRadius.circular(12)),
                            child: Icon(s['icon'] as IconData, color: AppTheme.dark),
                          ),
                          const Spacer(),
                          Text(s['title'] as String, style: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.dark)),
                          const SizedBox(height: 4),
                          Text(s['count'] as String, style: GoogleFonts.dmSans(fontSize: 12, color: AppTheme.muted)),
                          const SizedBox(height: 12),
                          // LIVE CALLING BUTTON (AGORA INTEGRATION)
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.push(context, MaterialPageRoute(builder: (_) => const CallScreen()));
                              },
                              icon: const Icon(Icons.video_camera_front, size: 16, color: Colors.white),
                              label: Text('Call Now', style: GoogleFonts.dmSans(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.rose,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildHowItWorks() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [AppTheme.pinkBg, Colors.white]),
      ),
      child: Column(
        children: [
          Text('How It Works', style: GoogleFonts.playfairDisplay(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.dark)),
          const SizedBox(height: 32),
          _buildStepCard('1', Icons.search, 'Find a Service', 'Search for exactly what you need.'),
          const SizedBox(height: 16),
          _buildStepCard('2', Icons.phone_in_talk, 'Connect & Call', 'Use live audio/video calling to discuss details.'),
          const SizedBox(height: 16),
          _buildStepCard('3', Icons.check_circle, 'Get it Done', 'Hire the professional and securely pay.'),
        ],
      ),
    );
  }

  Widget _buildStepCard(String num, IconData icon, String title, String desc) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Text(num, style: GoogleFonts.playfairDisplay(fontSize: 44, fontWeight: FontWeight.w900, color: AppTheme.roseLight)),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, color: AppTheme.rose, size: 28),
                const SizedBox(height: 8),
                Text(title, style: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.dark)),
                const SizedBox(height: 4),
                Text(desc, style: GoogleFonts.dmSans(fontSize: 13, color: AppTheme.muted)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
