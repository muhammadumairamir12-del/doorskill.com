import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/app_user.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class ProfileSetupScreen extends StatefulWidget {
  final String phone;
  const ProfileSetupScreen({super.key, required this.phone});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final _nameCtrl = TextEditingController();
  String _role = 'client';
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final uid = AuthService.instance.currentUserId;
    if (uid == null) return;
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      setState(() => _error = 'Name required');
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      await FirestoreService.instance.upsertUser(
        AppUser(
          id: uid,
          phone: widget.phone,
          name: name,
          role: _role,
        ),
      );
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Complete Profile', style: GoogleFonts.poppins(fontSize: 26, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                const SizedBox(height: 8),
                Text(widget.phone, style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textSecondary)),
                const SizedBox(height: 20),
                GlassCard(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    children: [
                      TextField(
                        controller: _nameCtrl,
                        style: GoogleFonts.poppins(color: AppTheme.textPrimary),
                        decoration: InputDecoration(
                          labelText: 'Full Name',
                          labelStyle: GoogleFonts.poppins(color: AppTheme.textSecondary),
                          filled: true,
                          fillColor: AppTheme.background.withOpacity(0.5),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.cardBorder)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.cardBorder)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.primary, width: 1.5)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      _roleChipRow(),
                      if (_error != null) ...[
                        const SizedBox(height: 14),
                        Text(_error!, style: GoogleFonts.poppins(color: AppTheme.error, fontSize: 12), textAlign: TextAlign.center),
                      ],
                      const SizedBox(height: 18),
                      SizedBox(
                        height: 52,
                        child: ElevatedButton(
                          onPressed: _saving ? null : _save,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: _saving
                              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                              : Text('Continue', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, color: Colors.white)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _roleChipRow() {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: [
        _chip('client', 'Client'),
        _chip('worker', 'Worker'),
        _chip('admin', 'Admin'),
      ],
    );
  }

  Widget _chip(String value, String label) {
    final selected = _role == value;
    return ChoiceChip(
      selected: selected,
      label: Text(label, style: GoogleFonts.poppins(color: selected ? Colors.white : AppTheme.textPrimary, fontWeight: FontWeight.w600)),
      selectedColor: AppTheme.primary,
      backgroundColor: AppTheme.cardColor,
      onSelected: (_) => setState(() => _role = value),
    );
  }
}

