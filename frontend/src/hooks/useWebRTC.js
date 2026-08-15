import { useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC({ socket, sessionId, onCallEnded }) {
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection  = useRef(null);
  const localStream     = useRef(null);

  const [callStatus, setCallStatus] = useState('idle');
  // idle | waiting | connected | ended

  // ── Start local camera/mic ─────────────────────────────
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Failed to get media devices:', err);
      throw err;
    }
  }, []);

  // Create peer connection ─────────────────────────────
  const createPeerConnection = useCallback((volunteerId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to connection
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current);
      });
    }

    // When we receive remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallStatus('connected');
    };

    // Send ICE candidates to volunteer via socket
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice_candidate', {
          target:    volunteerId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [socket]);

  // Join queue 
  const joinQueue = useCallback(async () => {
    try {
      await startLocalStream();
      setCallStatus('waiting');
      if (socket) {
        socket.emit('user_join_queue', { session_id: sessionId });
      }
    } catch (err) {
      console.error('Failed to join queue:', err);
      setCallStatus('idle');
    }
  }, [socket, sessionId, startLocalStream]);

  // Handle incoming call offer from volunteer
  const handleCallOffer = useCallback(async (data) => {
    const pc = createPeerConnection(data.volunteer_id);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (socket) {
      socket.emit('call_answer', {
        target_volunteer_id: data.volunteer_id,
        answer,
        session_id: sessionId,
      });
    }
  }, [socket, sessionId, createPeerConnection]);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (data) => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    } catch (err) {
      console.error('ICE candidate error:', err);
    }
  }, []);

  // ── End call ───────────────────────────────────────────
  const endCall = useCallback((volunteerId) => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (socket) {
      socket.emit('call_ended', {
        session_id:   sessionId,
        volunteer_id: volunteerId,
      });
    }

    setCallStatus('ended');
    if (onCallEnded) onCallEnded();
  }, [socket, sessionId, onCallEnded]);

  return {
    localVideoRef,
    remoteVideoRef,
    callStatus,
    setCallStatus,
    joinQueue,
    handleCallOffer,
    handleIceCandidate,
    endCall,
  };
}