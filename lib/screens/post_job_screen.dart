import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../theme/app_theme.dart';

class PostJobScreen extends StatefulWidget {
  const PostJobScreen({super.key});

  @override
  State<PostJobScreen> createState() => _PostJobScreenState();
}

class _PostJobScreenState extends State<PostJobScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _catCtrl = TextEditingController(text: 'General');
  final _budgetCtrl = TextEditingController();

  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _catCtrl.dispose();
    _budgetCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final uid = AuthService.instance.currentUserId;
    if (uid == null) return;
    final title = _titleCtrl.text.trim();
    final desc = _descCtrl.text.trim();
    final cat = _catCtrl.text.trim();
    final budget = int.tryParse(_budgetCtrl.text.trim());

    if (title.isEmpty || desc.isEmpty || cat.isEmpty || budget == null || budget <= 0) {
      setState(() => _error = 'Fill all fields correctly');
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      await FirestoreService.instance.createJob(
        clientId: uid,
        title: title,
        description: desc,
        category: cat,
        budget: budget,
      );
      if (!mounted) return;
      Navigator.pop(context);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
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
        title: Text('Post Job', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: AppTheme.dark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _field('Title', _titleCtrl),
          const SizedBox(height: 12),
          _field('Category', _catCtrl),
          const SizedBox(height: 12),
          _field('Budget (PKR)', _budgetCtrl, keyboardType: TextInputType.number),
          const SizedBox(height: 12),
          _field('Description', _descCtrl, maxLines: 5),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: GoogleFonts.dmSans(color: AppTheme.error)),
          ],
          const SizedBox(height: 18),
          SizedBox(
            height: 50,
            child: ElevatedButton(
              onPressed: _saving ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.rose,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _saving
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                  : Text('Publish', style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _field(
    String label,
    TextEditingController ctrl, {
    int maxLines = 1,
    TextInputType? keyboardType,
  }) {
    return TextField(
      controller: ctrl,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppTheme.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppTheme.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppTheme.rose, width: 1.5)),
      ),
    );
  }
}

