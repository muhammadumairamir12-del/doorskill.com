class Bid {
  final String id;
  final String jobId;
  final String workerId;
  final int amount;
  final String message;
  final String status;
  final int createdAtMs;

  const Bid({
    required this.id,
    required this.jobId,
    required this.workerId,
    required this.amount,
    required this.message,
    required this.status,
    required this.createdAtMs,
  });

  factory Bid.fromMap(String id, String jobId, Map<String, dynamic> map) {
    return Bid(
      id: id,
      jobId: jobId,
      workerId: (map['workerId'] ?? '') as String,
      amount: (map['amount'] ?? 0) as int,
      message: (map['message'] ?? '') as String,
      status: (map['status'] ?? 'pending') as String,
      createdAtMs: (map['createdAtMs'] ?? 0) as int,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'workerId': workerId,
      'amount': amount,
      'message': message,
      'status': status,
      'createdAtMs': createdAtMs,
    };
  }
}

