import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/bid.dart';
import '../models/job.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../theme/app_theme.dart';

class JobDetailScreen extends StatefulWidget {
  final String jobId;
  const JobDetailScreen({super.key, required this.jobId});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final _amountCtrl = TextEditingController();
  final _msgCtrl = TextEditingController();
  bool _sending = false;
  String? _error;

  @override
  void dispose() {
    _amountCtrl.dispose();
    _msgCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitBid() async {
    final uid = AuthService.instance.currentUserId;
    if (uid == null) return;
    final amount = int.tryParse(_amountCtrl.text.trim());
    final msg = _msgCtrl.text.trim();
    if (amount == null || amount <= 0) {
      setState(() => _error = 'Enter valid amount');
      return;
    }
    if (msg.isEmpty) {
      setState(() => _error = 'Message required');
      return;
    }

    setState(() {
      _sending = true;
      _error = null;
    });

    try {
      await FirestoreService.instance.createBid(
        jobId: widget.jobId,
        workerId: uid,
        amount: amount,
        message: msg,
      );
      if (!mounted) return;
      _amountCtrl.clear();
      _msgCtrl.clear();
      FocusScope.of(context).unfocus();
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.cream,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.dark),
        title: Text('Job', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: AppTheme.dark)),
      ),
      body: StreamBuilder<Job?>(
        stream: FirestoreService.instance.watchJob(widget.jobId),
        builder: (context, snap) {
          final job = snap.data;
          if (!snap.hasData) return const Center(child: CircularProgressIndicator());
          if (job == null) return const Center(child: Text('Job not found'));

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(job.title, style: GoogleFonts.dmSans(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.dark)),
                    const SizedBox(height: 8),
                    Text(job.description, style: GoogleFonts.dmSans(color: AppTheme.muted)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _pill(job.category),
                        const Spacer(),
                        Text('PKR ${job.budget}', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: AppTheme.rose)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text('Send Bid', style: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.dark)),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  children: [
                    TextField(
                      controller: _amountCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Bid Amount (PKR)'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _msgCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(labelText: 'Message'),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 10),
                      Text(_error!, style: GoogleFonts.dmSans(color: AppTheme.error, fontSize: 12)),
                    ],
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: _sending ? null : _submitBid,
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.rose, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                        child: _sending
                            ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                            : Text('Submit Bid', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Text('Bids', style: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.dark)),
              const SizedBox(height: 10),
              StreamBuilder<List<Bid>>(
                stream: FirestoreService.instance.watchBidsForJob(widget.jobId),
                builder: (context, bidsSnap) {
                  final bids = bidsSnap.data ?? <Bid>[];
                  if (!bidsSnap.hasData) {
                    return const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()));
                  }
                  if (bids.isEmpty) {
                    return Text('No bids yet', style: GoogleFonts.dmSans(color: AppTheme.muted));
                  }
                  return Column(
                    children: bids.map((b) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('PKR ${b.amount}', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: AppTheme.dark)),
                                  const SizedBox(height: 4),
                                  Text(b.message, style: GoogleFonts.dmSans(color: AppTheme.muted)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 10),
                            _pill(b.status),
                          ],
                        ),
                      );
                    }).toList(),
                  );
                },
              ),
            ],
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

