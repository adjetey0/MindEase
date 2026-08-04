import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useWebRTC } from '../../hooks/useWebRTC';
import API_BASE from '../../utils/api';

const SOCKET_URL = API_BASE;

function CallModal({ onClose, sessionId }) {
  const socketRef      = useRef(null);
  const [volunteerId, setVolunteerId] = useState(null);
  const [available, setAvailable]     = useState(null);
  const [error, setError]             = useState('');
  const [isMuted, setIsMuted]         = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const {
    localVideoRef,
    remoteVideoRef,
    callStatus,
    setCallStatus,
    joinQueue,
    handleCallOffer,
    handleIceCandidate,
    endCall,
  } = useWebRTC({
    socket:      socketRef.current,
    sessionId,
    onCallEnded: onClose,
  });

  // ── Connect to socket & check volunteers ───────────────
  useEffect(() => {
    // Check available volunteers
    fetch(`${API_BASE}/api/call/volunteers/available`)
      .then((r) => r.json())
      .then((d) => setAvailable(d.available))
      .catch(() => setAvailable(0));

    // Connect socket
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      upgrade: true
    });
    socketRef.current = socket;

    // Socket event listeners
    socket.on('volunteer_available', () => {
      setCallStatus('waiting');
    });

    socket.on('call_accepted', (data) => {
      setVolunteerId(data.volunteer_id);
    });

    socket.on('call_offer', (data) => {
      handleCallOffer(data);
    });

    socket.on('ice_candidate', (data) => {
      handleIceCandidate(data);
    });

    socket.on('call_terminated', () => {
      endCall(volunteerId);
    });

    socket.on('waiting_in_queue', () => {
      setCallStatus('waiting');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Toggle mic ─────────────────────────────────────────
  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  // ── Toggle camera ──────────────────────────────────────
  const toggleCamera = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff((prev) => !prev);
    }
  };

  // ── Handle connect button ──────────────────────────────
  const handleConnect = async () => {
    if (available === 0) {
      setError('No volunteers are available right now. Please try again later.');
      return;
    }
    try {
      await joinQueue();
    } catch {
      setError('Could not access your camera/microphone. Please check permissions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-[2rem] w-full max-w-2xl mx-4 overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">call</span>
            <h2 className="font-bold text-on-surface text-lg">Talk to Someone</h2>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* ── Idle State ── */}
          {callStatus === 'idle' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-4xl">support_agent</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-on-surface text-xl">Connect with a Volunteer</h3>
                <p className="text-on-surface-variant text-sm">
                  Talk to a trained mental health volunteer. All calls are completely private and confidential.
                </p>
              </div>

              {/* Volunteer availability */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                available === null ? 'bg-surface-container text-on-surface-variant' :
                available > 0 ? 'bg-secondary-container text-on-secondary-container' :
                'bg-error-container text-on-error-container'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  available === null ? 'bg-outline' :
                  available > 0 ? 'bg-secondary animate-pulse' : 'bg-error'
                }`} />
                {available === null ? 'Checking availability...' :
                 available > 0 ? `${available} volunteer${available > 1 ? 's' : ''} available` :
                 'No volunteers available right now'}
              </div>

              {error && (
                <p className="text-error text-sm bg-error-container px-4 py-3 rounded-xl">{error}</p>
              )}

              <button
                onClick={handleConnect}
                disabled={available === 0}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">video_call</span>
                Connect Now
              </button>

              <p className="text-xs text-on-surface-variant">
                🔒 This call is private, encrypted, and never recorded.
              </p>
            </div>
          )}

          {/* ── Waiting State ── */}
          {callStatus === 'waiting' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <span className="material-symbols-outlined text-primary text-4xl">hourglass_top</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-on-surface text-xl">Connecting you...</h3>
                <p className="text-on-surface-variant text-sm">
                  Please wait while we connect you with an available volunteer. This usually takes less than a minute.
                </p>
              </div>
              <button
                onClick={() => { endCall(null); }}
                className="px-6 py-3 border border-error/50 text-error rounded-2xl text-sm font-semibold hover:bg-error/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── Connected State (Video Call) ── */}
          {callStatus === 'connected' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {isCameraOff && (
                    <div className="absolute inset-0 bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">videocam_off</span>
                    </div>
                  )}
                </div>
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  Connected
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isMuted ? 'bg-error text-white' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isMuted ? 'mic_off' : 'mic'}
                  </span>
                </button>

                <button
                  onClick={() => endCall(volunteerId)}
                  className="w-16 h-16 rounded-full bg-error text-white flex items-center justify-center shadow-lg shadow-error/30 hover:bg-error/90 active:scale-95 transition-all"
                  title="End Call"
                >
                  <span className="material-symbols-outlined text-2xl">call_end</span>
                </button>

                <button
                  onClick={toggleCamera}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCameraOff ? 'bg-error text-white' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }`}
                  title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isCameraOff ? 'videocam_off' : 'videocam'}
                  </span>
                </button>
              </div>

              <p className="text-center text-xs text-on-surface-variant">
                🔒 This call is private and encrypted. Never recorded.
              </p>
            </div>
          )}

          {/* ── Ended State ── */}
          {callStatus === 'ended' && (
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-on-secondary-container text-4xl">check_circle</span>
              </div>
              <h3 className="font-bold text-on-surface text-xl">Call Ended</h3>
              <p className="text-on-surface-variant text-sm">
                We hope that helped. Remember, support is always here when you need it.
              </p>
              <button
                onClick={onClose}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all"
              >
                Back to Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CallModal;