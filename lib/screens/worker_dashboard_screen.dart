import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/job.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../theme/app_theme.dart';
import 'job_detail_screen.dart';
import 'settings_screen.dart';

class WorkerDashboardScreen extends StatelessWidget {
  const WorkerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.instance.currentUserId;
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Worker', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: AppTheme.dark)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: AppTheme.dark),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
            },
          ),
        ],
      ),
      body: uid == null
          ? const Center(child: Text('Not signed in'))
          : StreamBuilder<List<Job>>(
              stream: FirestoreService.instance.watchOpenJobs(),
              builder: (context, snap) {
                final jobs = snap.data ?? <Job>[];
                if (!snap.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (jobs.isEmpty) {
                  return Center(
                    child: Text('No open jobs right now', style: GoogleFonts.dmSans(color: AppTheme.muted)),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: jobs.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final j = jobs[i];
                    return InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => JobDetailScreen(jobId: j.id)),
                        );
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(j.title, style: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.dark)),
                            const SizedBox(height: 6),
                            Text(j.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: GoogleFonts.dmSans(color: AppTheme.muted)),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                _pill(j.category),
                                const Spacer(),
                                Text('PKR ${j.budget}', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: AppTheme.rose)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }

  Widget _pill(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: AppTheme.pinkBg, borderRadius: BorderRadius.circular(30)),
      child: Text(text, style: GoogleFonts.dmSans(fontSize: 12, color: AppTheme.rose, fontWeight: FontWeight.bold)),
    );
  }
}
