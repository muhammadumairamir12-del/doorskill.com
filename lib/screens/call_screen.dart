import 'package:flutter/material.dart';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/agora_service.dart';
import '../theme/app_theme.dart';

class CallScreen extends StatefulWidget {
  final String channelName;

  const CallScreen({super.key, this.channelName = "doorskill_service"});

  @override
  State<CallScreen> createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  int? _remoteUid;
  bool _localUserJoined = false;
  bool _muted = false;
  bool _cameraOn = true;

  @override
  void initState() {
    super.initState();
    _initAgora();
  }

  Future<void> _initAgora() async {
    await AgoraService.instance.initialize();

    AgoraService.instance.engine.registerEventHandler(
      RtcEngineEventHandler(
        onJoinChannelSuccess: (RtcConnection connection, int elapsed) {
          debugPrint("local user ${connection.localUid} joined");
          setState(() {
            _localUserJoined = true;
          });
        },
        onUserJoined: (RtcConnection connection, int remoteUid, int elapsed) {
          debugPrint("remote user $remoteUid joined");
          setState(() {
            _remoteUid = remoteUid;
          });
        },
        onUserOffline: (RtcConnection connection, int remoteUid, UserOfflineReasonType reason) {
          debugPrint("remote user $remoteUid left channel");
          setState(() {
            _remoteUid = null;
          });
        },
      ),
    );

    await AgoraService.instance.joinChannel(widget.channelName);
  }

  @override
  void dispose() {
    AgoraService.instance.leaveChannel();
    super.dispose();
  }

  void _onToggleMute() {
    setState(() {
      _muted = !_muted;
    });
    AgoraService.instance.toggleMute(_muted);
  }

  void _onToggleCamera() {
    setState(() {
      _cameraOn = !_cameraOn;
    });
    AgoraService.instance.toggleCamera(_cameraOn);
  }

  void _onCallEnd() {
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Remote Video
          Center(
            child: _remoteVideo(),
          ),
          
          // Local Video (PiP)
          Positioned(
            top: 60,
            right: 20,
            child: Container(
              width: 110,
              height: 150,
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.rose, width: 2),
                boxShadow: [
                  BoxShadow(color: AppTheme.rose.withOpacity(0.4), blurRadius: 10, spreadRadius: 2),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: _localVideo(),
              ),
            ),
          ),

          // Control Toolbar
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _controlButton(
                  icon: _muted ? Icons.mic_off : Icons.mic,
                  color: _muted ? Colors.redAccent : Colors.white24,
                  onPressed: _onToggleMute,
                ),
                const SizedBox(width: 24),
                _controlButton(
                  icon: Icons.call_end,
                  color: Colors.red,
                  size: 64,
                  iconSize: 32,
                  onPressed: _onCallEnd,
                ),
                const SizedBox(width: 24),
                _controlButton(
                  icon: _cameraOn ? Icons.videocam : Icons.videocam_off,
                  color: _cameraOn ? Colors.white24 : Colors.redAccent,
                  onPressed: _onToggleCamera,
                ),
              ],
            ),
          ),
          
          // Back button
          Positioned(
            top: 50,
            left: 16,
            child: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _localVideo() {
    if (_localUserJoined && _cameraOn) {
      return AgoraVideoView(
        controller: VideoViewController(
          rtcEngine: AgoraService.instance.engine,
          canvas: const VideoCanvas(uid: 0),
        ),
      );
    } else {
      return const Center(child: Icon(Icons.person, color: Colors.white, size: 40));
    }
  }

  Widget _remoteVideo() {
    if (_remoteUid != null) {
      return AgoraVideoView(
        controller: VideoViewController.remote(
          rtcEngine: AgoraService.instance.engine,
          canvas: VideoCanvas(uid: _remoteUid),
          connection: RtcConnection(channelId: widget.channelName),
        ),
      );
    } else {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: AppTheme.rose),
          const SizedBox(height: 24),
          Text(
            'Waiting for provider to join...',
            style: GoogleFonts.dmSans(color: Colors.white, fontSize: 16),
          ),
        ],
      );
    }
  }

  Widget _controlButton({
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
    double size = 52,
    double iconSize = 24,
  }) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 4)),
          ],
        ),
        child: Icon(icon, color: Colors.white, size: iconSize),
      ),
    );
  }
}
