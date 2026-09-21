import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:permission_handler/permission_handler.dart';

class AgoraService {
  static final AgoraService instance = AgoraService._internal();
  AgoraService._internal();

  late RtcEngine _engine;
  bool _isInitialized = false;

  static const String appId = String.fromEnvironment('AGORA_APP_ID');
  static const String token = String.fromEnvironment('AGORA_TOKEN', defaultValue: '');

  Future<void> initialize() async {
    if (_isInitialized) return;
    if (appId.isEmpty) {
      throw Exception('Missing AGORA_APP_ID');
    }

    // Request permissions
    await [Permission.microphone, Permission.camera].request();

    // Initialize engine
    _engine = createAgoraRtcEngine();
    await _engine.initialize(const RtcEngineContext(
      appId: appId,
      channelProfile: ChannelProfileType.channelProfileCommunication,
    ));

    await _engine.enableVideo();
    await _engine.startPreview();
    
    _isInitialized = true;
  }

  Future<void> joinChannel(String channelName, {int uid = 0}) async {
    if (!_isInitialized) await initialize();
    
    await _engine.joinChannel(
      token: token,
      channelId: channelName,
      uid: uid,
      options: const ChannelMediaOptions(
        autoSubscribeVideo: true,
        autoSubscribeAudio: true,
        publishCameraTrack: true,
        publishMicrophoneTrack: true,
        clientRoleType: ClientRoleType.clientRoleBroadcaster,
      ),
    );
  }

  Future<void> leaveChannel() async {
    if (!_isInitialized) return;
    await _engine.leaveChannel();
  }

  Future<void> toggleMute(bool muted) async {
    if (!_isInitialized) return;
    await _engine.muteLocalAudioStream(muted);
  }

  Future<void> toggleCamera(bool enabled) async {
    if (!_isInitialized) return;
    await _engine.muteLocalVideoStream(!enabled);
  }

  Future<void> switchCamera() async {
    if (!_isInitialized) return;
    await _engine.switchCamera();
  }

  RtcEngine get engine => _engine;

  Future<void> dispose() async {
    if (!_isInitialized) return;
    await _engine.leaveChannel();
    await _engine.release();
    _isInitialized = false;
  }
}
