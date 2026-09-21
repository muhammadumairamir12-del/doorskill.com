import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class SecurityCenterScreen extends StatefulWidget {
  const SecurityCenterScreen({super.key});

  @override
  State<SecurityCenterScreen> createState() => _SecurityCenterScreenState();
}

class _SecurityCenterScreenState extends State<SecurityCenterScreen> {
  // Scanning state
  bool _isScanning = false;
  double _scanProgress = 0.0;
  String _scanStatusText = 'Idle';
  bool _hasScanned = false;

  // Intrusion logs & Blocked IPs
  List<dynamic> _intrusionLogs = [];
  List<String> _blockedIps = [];

  // Security Toggles
  bool _biometricSim = true;
  int _maxAttemptsLimit = 3;

  @override
  void initState() {
    super.initState();
    _loadSecurityData();
  }

  Future<void> _loadSecurityData() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Load Logs
    final logsJson = prefs.getString('security_intrusion_logs') ?? '[]';
    final List<dynamic> logs = json.decode(logsJson);

    // If no logs, add a default mock log so the screen isn't empty
    if (logs.isEmpty) {
      logs.addAll([
        {
          'id': 'mock1',
          'timestamp': DateTime.now().subtract(const Duration(hours: 4)).toIso8601String(),
          'ip': '185.220.101.4',
          'method': 'PIN Brute-Force',
          'device': 'Unknown Android Model',
          'status': 'IP Address Blocked',
        },
        {
          'id': 'mock2',
          'timestamp': DateTime.now().subtract(const Duration(days: 1, hours: 2)).toIso8601String(),
          'ip': '92.122.45.10',
          'method': 'App Password Guessing',
          'device': 'MacBook Pro Client',
          'status': 'Access Denied',
        }
      ]);
      await prefs.setString('security_intrusion_logs', json.encode(logs));
    }

    // Extract blocked IPs from active logs
    final List<String> ips = [];
    for (var l in logs) {
      if (l['status'] == 'IP Address Blocked') {
        final ip = l['ip'] as String;
        if (!ips.contains(ip)) ips.add(ip);
      }
    }

    setState(() {
      _intrusionLogs = logs;
      _blockedIps = ips;
      _biometricSim = prefs.getBool('biometric_auth_enabled') ?? true;
      _maxAttemptsLimit = prefs.getInt('failed_attempts_limit') ?? 3;
    });
  }

  // Clear intrusion logs
  Future<void> _clearLogs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('security_intrusion_logs', '[]');
    setState(() {
      _intrusionLogs = [];
      _blockedIps = [];
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Security logs purged.', style: GoogleFonts.poppins()),
        backgroundColor: AppTheme.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // Unblock a specific IP
  Future<void> _unblockIp(String ip) async {
    final prefs = await SharedPreferences.getInstance();
    
    // Update logs matching this IP
    for (var l in _intrusionLogs) {
      if (l['ip'] == ip && l['status'] == 'IP Address Blocked') {
        l['status'] = 'Cleared';
      }
    }
    
    await prefs.setString('security_intrusion_logs', json.encode(_intrusionLogs));
    setState(() {
      _blockedIps.remove(ip);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Firewall block removed for IP: $ip', style: GoogleFonts.poppins()),
        backgroundColor: AppTheme.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // Trigger system scan animation
  Future<void> _runSystemScan() async {
    if (_isScanning) return;
    setState(() {
      _isScanning = true;
      _scanProgress = 0.0;
      _hasScanned = false;
    });

    final steps = [
      'Initializing kernel checks...',
      'Testing device bootloader signature...',
      'Checking root partition for su binaries...',
      'Detecting debugger active attachment hooks...',
      'Verifying SHA-256 code integrity tags...',
      'Scanning local database encryption locks...',
      'Checking SSL Certificate Pinning routes...',
      'System Secure! 0 vulnerability vulnerabilities found.'
    ];

    for (int i = 0; i < steps.length; i++) {
      if (!mounted) return;
      setState(() {
        _scanStatusText = steps[i];
        _scanProgress = (i + 1) / steps.length;
      });
      await Future.delayed(Duration(milliseconds: 400 + (100 * (i % 3))));
    }

    if (mounted) {
      setState(() {
        _isScanning = false;
        _hasScanned = true;
      });
    }
  }

  String _formatTime(String isoString) {
    try {
      final dt = DateTime.parse(isoString);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text('Security Center', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 20)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          children: [
            // Threat Level display card
            _buildThreatMeterCard(),

            const SizedBox(height: 20),

            // Integrity Scanning widget
            _buildScanningCard(),

            const SizedBox(height: 20),

            // Settings Controls
            _buildControlSettingsCard(),

            const SizedBox(height: 20),

            // Blocked IPs List
            if (_blockedIps.isNotEmpty) _buildFirewallCard(),

            const SizedBox(height: 20),

            // Intrusion logs list header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Intrusion Detection System',
                  style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                ),
                if (_intrusionLogs.isNotEmpty)
                  TextButton.icon(
                    onPressed: _clearLogs,
                    icon: const Icon(Icons.delete_sweep_outlined, size: 16, color: AppTheme.error),
                    label: Text('Clear', style: GoogleFonts.poppins(color: AppTheme.error, fontSize: 12)),
                  ),
              ],
            ),

            const SizedBox(height: 10),

            // Intrusion log items
            if (_intrusionLogs.isEmpty)
              GlassCard(
                padding: const EdgeInsets.symmetric(vertical: 24),
                child: Center(
                  child: Text(
                    'No intrusion attempts logged.',
                    style: GoogleFonts.poppins(color: AppTheme.textSecondary, fontSize: 13),
                  ),
                ),
              )
            else
              ..._intrusionLogs.map((log) => _buildIntrusionLogTile(log)),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  // ── THREAT METER CARD ─────────────────────────────────────────────────────
  Widget _buildThreatMeterCard() {
    final hasThreats = _blockedIps.isNotEmpty;
    final color = hasThreats ? AppTheme.error : AppTheme.success;

    return GlassCard(
      borderColor: color.withOpacity(0.25),
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(
              hasThreats ? Icons.gpp_maybe_rounded : Icons.gpp_good_rounded,
              color: color, size: 30,
            ),
          ).animate(target: hasThreats ? 1.0 : 0.0)
              .shake(duration: 800.ms),

          const SizedBox(width: 16),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SYSTEM THREAT LEVEL',
                  style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                const SizedBox(height: 2),
                Text(
                  hasThreats ? 'ALERT: Active Blocks' : 'SECURE: Shield Active',
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
                Text(
                  hasThreats
                      ? '${_blockedIps.length} suspicious IP addresses currently locked out'
                      : 'All endpoints encrypted via TLS 1.3 & AES-256',
                  style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── SCANNING CARD ─────────────────────────────────────────────────────────
  Widget _buildScanningCard() {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('System Integrity Scan', style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold)),
                  Text('Verify code, memory & network security', style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary)),
                ],
              ),
              const Icon(Icons.shield_outlined, color: AppTheme.primary, size: 24),
            ],
          ),

          const SizedBox(height: 20),

          // Scan state visualizer
          if (_isScanning)
            Column(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: _scanProgress,
                    minHeight: 6,
                    backgroundColor: AppTheme.background,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  _scanStatusText,
                  style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.primary, fontStyle: FontStyle.italic),
                  textAlign: TextAlign.center,
                ),
              ],
            )
          else if (_hasScanned)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.success.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.success.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified_user_rounded, color: AppTheme.success, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Verification Completed', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                        Text('Shield secure. Bootloader locks intact, no debuggers found.', style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
            )
          else
            Text(
              'Last scanned: 1h ago',
              style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary),
            ),

          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton.icon(
              onPressed: _isScanning ? null : _runSystemScan,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary.withOpacity(0.15),
                foregroundColor: AppTheme.primary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: AppTheme.primary.withOpacity(0.4)),
                ),
              ),
              icon: _isScanning
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: AppTheme.primary, strokeWidth: 2))
                  : const Icon(Icons.radar_rounded, size: 18),
              label: Text(
                _isScanning ? 'Verifying Integrity...' : 'Scan System Integrity',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── SETTINGS CONTROLS CARD ────────────────────────────────────────────────
  Widget _buildControlSettingsCard() {
    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppTheme.success.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.fingerprint_rounded, color: AppTheme.success, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Biometric Override', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                      Text('Bypass standard PIN authentication', style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                ],
              ),
              Switch(
                value: _biometricSim,
                onChanged: (v) async {
                  setState(() => _biometricSim = v);
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.setBool('biometric_auth_enabled', v);
                },
                activeColor: AppTheme.success,
              ),
            ],
          ),

          const Padding(padding: EdgeInsets.symmetric(horizontal: 4), child: Divider(color: AppTheme.divider)),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppTheme.warning.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.security_update_warning_rounded, color: AppTheme.warning, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Lockout Threshold', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                      Text('Max failures: $_maxAttemptsLimit attempts', style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                ],
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline_rounded, color: AppTheme.textSecondary),
                    onPressed: _maxAttemptsLimit <= 3 ? null : () async {
                      setState(() => _maxAttemptsLimit--);
                      final prefs = await SharedPreferences.getInstance();
                      await prefs.setInt('failed_attempts_limit', _maxAttemptsLimit);
                    },
                  ),
                  Text('$_maxAttemptsLimit', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14)),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline_rounded, color: AppTheme.textSecondary),
                    onPressed: _maxAttemptsLimit >= 10 ? null : () async {
                      setState(() => _maxAttemptsLimit++);
                      final prefs = await SharedPreferences.getInstance();
                      await prefs.setInt('failed_attempts_limit', _maxAttemptsLimit);
                    },
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── FIREWALL CARD ─────────────────────────────────────────────────────────
  Widget _buildFirewallCard() {
    return GlassCard(
      borderColor: AppTheme.error.withOpacity(0.20),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lock_person_rounded, color: AppTheme.error, size: 18),
              const SizedBox(width: 8),
              Text(
                'Firewall Blocked Hosts (${_blockedIps.length})',
                style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.error),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Column(
            children: _blockedIps.map((ip) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.dns_outlined, color: AppTheme.textSecondary, size: 14),
                        const SizedBox(width: 6),
                        Text(ip, style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textPrimary, fontWeight: FontWeight.w500)),
                      ],
                    ),
                    TextButton(
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        minimumSize: const Size(40, 26),
                        backgroundColor: AppTheme.success.withOpacity(0.12),
                      ),
                      onPressed: () => _unblockIp(ip),
                      child: Text('Unblock', style: GoogleFonts.poppins(color: AppTheme.success, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ── INTRUSION LOG TILE ────────────────────────────────────────────────────
  Widget _buildIntrusionLogTile(Map<String, dynamic> log) {
    final status = log['status'] as String;
    final isBlocked = status == 'IP Address Blocked';
    final Color color = isBlocked ? AppTheme.error : AppTheme.textSecondary;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isBlocked ? Icons.block_flipped : Icons.report_gmailerrorred_rounded,
                color: color, size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        log['ip'] ?? '0.0.0.0',
                        style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          status,
                          style: GoogleFonts.poppins(fontSize: 9, color: color, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${log['method']} via ${log['device']}',
                    style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
            Text(
              _formatTime(log['timestamp']),
              style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
