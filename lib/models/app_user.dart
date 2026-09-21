class AppUser {
  final String id;
  final String phone;
  final String name;
  final String role;

  const AppUser({
    required this.id,
    required this.phone,
    required this.name,
    required this.role,
  });

  factory AppUser.fromMap(String id, Map<String, dynamic> map) {
    return AppUser(
      id: id,
      phone: (map['phone'] ?? '') as String,
      name: (map['name'] ?? '') as String,
      role: (map['role'] ?? '') as String,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'phone': phone,
      'name': name,
      'role': role,
    };
  }
}

