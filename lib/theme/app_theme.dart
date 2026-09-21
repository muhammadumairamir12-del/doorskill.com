import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color rose = Color(0xFFF43F5E);
  static const Color roseLight = Color(0xFFFFE4EC);
  static const Color roseMedium = Color(0xFFFB7185);
  static const Color pinkBg = Color(0xFFFFF0F5);
  static const Color cream = Color(0xFFFFFAF9);
  
  // Text & Background
  static const Color dark = Color(0xFF1A0A14);
  static const Color mid = Color(0xFF5C3D4E);
  static const Color muted = Color(0xFF9D7589);
  static const Color white = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFF3D6E0);
  
  // Accents
  static const Color green = Color(0xFF10B981);
  static const Color greenLight = Color(0xFFD1FAE5);
  static const Color blue = Color(0xFF3B82F6);
  static const Color blueLight = Color(0xFFDBEAFE);
  static const Color blueDark = Color(0xFF1D4ED8);
  static const Color indigo = Color(0xFF6366F1);
  static const Color violet = Color(0xFF8B5CF6);
  static const Color cyan = Color(0xFF06B6D4);

  // Fallbacks for existing references
  static const Color primary = rose;
  static const Color secondary = indigo;
  static const Color background = cream;
  static const Color surface = white;
  static const Color error = Color(0xFFEF4444);
  static const Color success = green;
  static const Color textPrimary = dark;
  static const Color textSecondary = mid;
  static const Color cardColor = white;
  static const Color cardBorder = border;

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: rose,
      scaffoldBackgroundColor: cream,
      textTheme: GoogleFonts.dmSansTextTheme().copyWith(
        displayLarge: GoogleFonts.playfairDisplay(
          color: dark,
          fontWeight: FontWeight.w900,
        ),
        displayMedium: GoogleFonts.playfairDisplay(
          color: dark,
          fontWeight: FontWeight.w900,
        ),
        titleLarge: GoogleFonts.dmSans(
          color: dark,
          fontWeight: FontWeight.bold,
        ),
        bodyLarge: GoogleFonts.dmSans(color: dark),
        bodyMedium: GoogleFonts.dmSans(color: mid),
      ),
      colorScheme: const ColorScheme.light(
        primary: rose,
        secondary: indigo,
        surface: white,
        error: error,
        onPrimary: white,
        onSecondary: white,
        onSurface: dark,
      ),
    );
  }

  // Keeping dark theme just in case but modifying to fit the brand
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: rose,
      scaffoldBackgroundColor: const Color(0xFF1A0814),
      textTheme: GoogleFonts.dmSansTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.playfairDisplay(
          color: white,
          fontWeight: FontWeight.w900,
        ),
        displayMedium: GoogleFonts.playfairDisplay(
          color: white,
          fontWeight: FontWeight.w900,
        ),
      ),
      colorScheme: const ColorScheme.dark(
        primary: rose,
        secondary: indigo,
        surface: Color(0xFF2D0A1E),
        error: error,
        onPrimary: white,
        onSecondary: white,
        onSurface: white,
      ),
    );
  }
}
