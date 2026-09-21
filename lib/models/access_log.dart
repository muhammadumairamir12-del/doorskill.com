class AccessLog {
  final String id;
  final String userName;
  final String userAvatar;
  final String action; // 'unlock' | 'lock' | 'denied'
  final DateTime timestamp;
  final String method; // 'PIN' | 'App' | 'Schedule' | 'Remote'

  AccessLog({
    required this.id,
    required this.userName,
    required this.userAvatar,
    required this.action,
    required this.timestamp,
    required this.method,
  });

  static List<AccessLog> getMockLogs() {
    final now = DateTime.now();
    return [
      AccessLog(id: '1',  userName: 'Ahmad Ali',       userAvatar: 'AA', action: 'unlock', timestamp: now.subtract(const Duration(minutes: 5)),              method: 'PIN'),
      AccessLog(id: '2',  userName: 'Sara Khan',        userAvatar: 'SK', action: 'lock',   timestamp: now.subtract(const Duration(hours: 1)),               method: 'App'),
      AccessLog(id: '3',  userName: 'Unknown',          userAvatar: '??', action: 'denied', timestamp: now.subtract(const Duration(hours: 2)),               method: 'PIN'),
      AccessLog(id: '4',  userName: 'Mohammad Usman',   userAvatar: 'MU', action: 'unlock', timestamp: now.subtract(const Duration(hours: 3)),               method: 'Schedule'),
      AccessLog(id: '5',  userName: 'Admin',            userAvatar: 'AD', action: 'unlock', timestamp: now.subtract(const Duration(hours: 5)),               method: 'Remote'),
      AccessLog(id: '6',  userName: 'Sara Khan',        userAvatar: 'SK', action: 'unlock', timestamp: now.subtract(const Duration(hours: 8)),               method: 'App'),
      AccessLog(id: '7',  userName: 'Ahmad Ali',        userAvatar: 'AA', action: 'lock',   timestamp: now.subtract(const Duration(days: 1)),                method: 'App'),
      AccessLog(id: '8',  userName: 'Guest User',       userAvatar: 'GU', action: 'unlock', timestamp: now.subtract(const Duration(days: 1, hours: 2)),      method: 'PIN'),
      AccessLog(id: '9',  userName: 'Unknown',          userAvatar: '??', action: 'denied', timestamp: now.subtract(const Duration(days: 2)),                method: 'PIN'),
      AccessLog(id: '10', userName: 'Mohammad Usman',   userAvatar: 'MU', action: 'lock',   timestamp: now.subtract(const Duration(days: 2, hours: 4)),      method: 'Schedule'),
      AccessLog(id: '11', userName: 'Office Helper',    userAvatar: 'OH', action: 'unlock', timestamp: now.subtract(const Duration(days: 3)),                method: 'PIN'),
      AccessLog(id: '12', userName: 'Ahmad Ali',        userAvatar: 'AA', action: 'unlock', timestamp: now.subtract(const Duration(days: 3, hours: 6)),      method: 'Remote'),
    ];
  }
}
