import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/app_user.dart';
import '../models/job.dart';
import '../models/bid.dart';

class FirestoreService {
  static final FirestoreService instance = FirestoreService._internal();
  FirestoreService._internal();

  final FirebaseFirestore _db = FirebaseFirestore.instance;

  DocumentReference<Map<String, dynamic>> userDoc(String uid) => _db.collection('users').doc(uid);
  CollectionReference<Map<String, dynamic>> jobsCol() => _db.collection('jobs');
  DocumentReference<Map<String, dynamic>> jobDoc(String jobId) => jobsCol().doc(jobId);
  CollectionReference<Map<String, dynamic>> bidsCol(String jobId) => jobsCol().doc(jobId).collection('bids');
  CollectionReference<Map<String, dynamic>> chatsCol() => _db.collection('chats');

  Future<AppUser?> getUser(String uid) async {
    final snap = await userDoc(uid).get();
    final data = snap.data();
    if (!snap.exists || data == null) return null;
    return AppUser.fromMap(snap.id, data);
  }

  Stream<AppUser?> watchUser(String uid) {
    return userDoc(uid).snapshots().map((snap) {
      final data = snap.data();
      if (!snap.exists || data == null) return null;
      return AppUser.fromMap(snap.id, data);
    });
  }

  Future<void> upsertUser(AppUser user) async {
    await userDoc(user.id).set(
      {
        ...user.toMap(),
        'updatedAtMs': DateTime.now().millisecondsSinceEpoch,
        'createdAtMs': DateTime.now().millisecondsSinceEpoch,
      },
      SetOptions(merge: true),
    );
  }

  Future<String> createJob({
    required String clientId,
    required String title,
    required String description,
    required String category,
    required int budget,
  }) async {
    final ref = await jobsCol().add(
      Job(
        id: '',
        clientId: clientId,
        title: title,
        description: description,
        category: category,
        budget: budget,
        status: 'open',
        createdAtMs: DateTime.now().millisecondsSinceEpoch,
      ).toMap(),
    );
    return ref.id;
  }

  Future<Job?> getJob(String jobId) async {
    final snap = await jobDoc(jobId).get();
    final data = snap.data();
    if (!snap.exists || data == null) return null;
    return Job.fromMap(snap.id, data);
  }

  Stream<Job?> watchJob(String jobId) {
    return jobDoc(jobId).snapshots().map((snap) {
      final data = snap.data();
      if (!snap.exists || data == null) return null;
      return Job.fromMap(snap.id, data);
    });
  }

  Stream<List<Job>> watchOpenJobs() {
    return jobsCol()
        .where('status', isEqualTo: 'open')
        .orderBy('createdAtMs', descending: true)
        .snapshots()
        .map((q) => q.docs.map((d) => Job.fromMap(d.id, d.data())).toList());
  }

  Stream<List<Job>> watchClientJobs(String clientId) {
    return jobsCol()
        .where('clientId', isEqualTo: clientId)
        .orderBy('createdAtMs', descending: true)
        .snapshots()
        .map((q) => q.docs.map((d) => Job.fromMap(d.id, d.data())).toList());
  }

  Future<void> createBid({
    required String jobId,
    required String workerId,
    required int amount,
    required String message,
  }) async {
    await bidsCol(jobId).add(
      Bid(
        id: '',
        jobId: jobId,
        workerId: workerId,
        amount: amount,
        message: message,
        status: 'pending',
        createdAtMs: DateTime.now().millisecondsSinceEpoch,
      ).toMap(),
    );
  }

  Stream<List<Bid>> watchBidsForJob(String jobId) {
    return bidsCol(jobId)
        .orderBy('createdAtMs', descending: true)
        .snapshots()
        .map((q) => q.docs.map((d) => Bid.fromMap(d.id, jobId, d.data())).toList());
  }
}
