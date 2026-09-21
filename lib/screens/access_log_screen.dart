import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../models/access_log.dart';
import '../widgets/glass_card.dart';

class AccessLogScreen extends StatefulWidget {
  final List<AccessLog> logs;

  const AccessLogScreen({super.key, required this.logs});

  @override
  State<AccessLogScreen> createState() => _AccessLogScreenState();
}

class _AccessLogScreenState extends State<AccessLogScreen> {
  String _filter = 'All';
  final _filters = ['All', 'Today', 'This Week', 'Unlock', 'Lock', 'Denied'];

  List<AccessLog> get _filtered {
    final now = DateTime.now();
    return widget.logs.where((l) {
      switch (_filter) {
        case 'Today':
          return l.timestamp.day == now.day && l.timestamp.month == now.month;
        case 'This Week':
          return l.timestamp.isAfter(now.subtract(const Duration(days: 7)));
        case 'Unlock':
          return l.action == 'unlock';
        case 'Lock':
          return l.action == 'lock';
        case 'Denied':
          return l.action == 'denied';
        default:
          return true;
      }
    }).toList();
  }

  String _timeStr(DateTime t) =>
      '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
  String _dateStr(DateTime t) => '${t.day}/${t.month}/${t.year}';

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
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Access Logs',
                      style: GoogleFonts.poppins(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary)),
                  Text('${widget.logs.length} total events',
                      style: GoogleFonts.poppins(
                          fontSize: 14, color: AppTheme.textSecondary)),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Filter chips
            SizedBox(
              height: 40,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _filters.length,
                itemBuilder: (_, i) {
                  final f = _filters[i];
                  final sel = _filter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _filter = f),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: sel
                              ? AppTheme.primary
                              : AppTheme.cardColor,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color:
                                sel ? AppTheme.primary : AppTheme.cardBorder,
                          ),
                        ),
                        child: Text(f,
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              color: sel
                                  ? Colors.black
                                  : AppTheme.textSecondary,
                              fontWeight: sel
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                            )),
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 14),

            // List
            Expanded(
              child: _filtered.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.history_rounded,
                              size: 64, color: AppTheme.textSecondary),
                          const SizedBox(height: 12),
                          Text('No logs found',
                              style: GoogleFonts.poppins(
                                  color: AppTheme.textSecondary)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: _filtered.length,
                      itemBuilder: (_, i) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _tile(_filtered[i], i),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tile(AccessLog log, int index) {
    final Color col;
    final IconData ico;
    final String lbl;
    switch (log.action) {
      case 'unlock':
        col = AppTheme.success;
        ico = Icons.lock_open_rounded;
        lbl = 'Unlocked';
        break;
      case 'lock':
        col = AppTheme.primary;
        ico = Icons.lock_rounded;
        lbl = 'Locked';
        break;
      default:
        col = AppTheme.error;
        ico = Icons.block_rounded;
        lbl = 'Denied';
    }

    return GlassCard(
      padding: const EdgeInsets.all(14),
      borderColor: col.withOpacity(0.20),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
                color: col.withOpacity(0.14), shape: BoxShape.circle),
            child: Center(
              child: Text(log.userAvatar,
                  style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: col)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(log.userName,
                    style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                          color: col.withOpacity(0.10),
                          borderRadius: BorderRadius.circular(10)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(ico, size: 11, color: col),
                          const SizedBox(width: 4),
                          Text(lbl,
                              style: GoogleFonts.poppins(
                                  fontSize: 10, color: col)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('• ${log.method}',
                        style: GoogleFonts.poppins(
                            fontSize: 11, color: AppTheme.textSecondary)),
                  ],
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(_timeStr(log.timestamp),
                  style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary)),
              Text(_dateStr(log.timestamp),
                  style: GoogleFonts.poppins(
                      fontSize: 11, color: AppTheme.textSecondary)),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (index * 45).ms).slideX(begin: 0.08, end: 0);
  }
}
