import 'package:flutter/material.dart';

class UserModel {
  final String id;
  String name;
  String initials;
  String role; // 'Admin' | 'Family' | 'Guest' | 'Temporary'
  bool hasAccess;
  String accessTime; // 'Always' | 'Weekdays' | 'Custom'
  Color avatarColor;

  UserModel({
    required this.id,
    required this.name,
    required this.initials,
    required this.role,
    required this.hasAccess,
    required this.accessTime,
    required this.avatarColor,
  });

  static List<UserModel> getMockUsers() {
    return [
      UserModel(
        id: '1', name: 'Ahmad Ali',       initials: 'AA',
        role: 'Admin',     hasAccess: true,  accessTime: 'Always',
        avatarColor: const Color(0xFF00D4FF),
      ),
      UserModel(
        id: '2', name: 'Sara Khan',        initials: 'SK',
        role: 'Family',    hasAccess: true,  accessTime: 'Always',
        avatarColor: const Color(0xFFFF6B9D),
      ),
      UserModel(
        id: '3', name: 'Mohammad Usman',   initials: 'MU',
        role: 'Family',    hasAccess: true,  accessTime: 'Weekdays',
        avatarColor: const Color(0xFF7C3AED),
      ),
      UserModel(
        id: '4', name: 'Delivery Guest',   initials: 'DG',
        role: 'Guest',     hasAccess: false, accessTime: 'Custom',
        avatarColor: const Color(0xFFFF6B35),
      ),
      UserModel(
        id: '5', name: 'Office Helper',    initials: 'OH',
        role: 'Temporary', hasAccess: true,  accessTime: 'Weekdays',
        avatarColor: const Color(0xFF00E676),
      ),
    ];
  }
}
