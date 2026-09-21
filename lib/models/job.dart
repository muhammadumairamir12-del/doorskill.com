class Job {
  final String id;
  final String clientId;
  final String title;
  final String description;
  final String category;
  final int budget;
  final String status;
  final int createdAtMs;

  const Job({
    required this.id,
    required this.clientId,
    required this.title,
    required this.description,
    required this.category,
    required this.budget,
    required this.status,
    required this.createdAtMs,
  });

  factory Job.fromMap(String id, Map<String, dynamic> map) {
    return Job(
      id: id,
      clientId: (map['clientId'] ?? '') as String,
      title: (map['title'] ?? '') as String,
      description: (map['description'] ?? '') as String,
      category: (map['category'] ?? '') as String,
      budget: (map['budget'] ?? 0) as int,
      status: (map['status'] ?? 'open') as String,
      createdAtMs: (map['createdAtMs'] ?? 0) as int,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'clientId': clientId,
      'title': title,
      'description': description,
      'category': category,
      'budget': budget,
      'status': status,
      'createdAtMs': createdAtMs,
    };
  }
}

