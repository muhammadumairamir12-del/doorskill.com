import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';
import 'services/auth_service.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AuthService.instance.initialize();
  await NotificationService.instance.initialize();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppTheme.surface,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const DoorSkillApp());
}

class DoorSkillApp extends StatelessWidget {
  const DoorSkillApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DoorSkill',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const SplashScreen(),
    );
  }
}
