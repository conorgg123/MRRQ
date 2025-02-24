import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceChatState {
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  volume: number;
  inputDevice: string | null;
  outputDevice: string | null;
  error: string | null;
}

interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  audioStream: MediaStream | null;
  isSpeaking: boolean;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' }
];

export function useVoiceChat(partyId: string | null, userId: string | null) {
  const [state, setState] = useState<VoiceChatState>({
    isMuted: false,
    isDeafened: false,
    isSpeaking: false,
    volume: 1,
    inputDevice: null,
    outputDevice: null,
    error: null
  });

  const [devices, setDevices] = useState<{
    inputs: MediaDeviceInfo[];
    outputs: MediaDeviceInfo[];
  }>({
    inputs: [],
    outputs: []
  });

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize audio context and devices
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        // Get available devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        setDevices({
          inputs: devices.filter(device => device.kind === 'audioinput'),
          outputs: devices.filter(device => device.kind === 'audiooutput')
        });

        // Set default devices
        if (devices.length > 0) {
          setState(prev => ({
            ...prev,
            inputDevice: devices.find(d => d.kind === 'audioinput')?.deviceId || null,
            outputDevice: devices.find(d => d.kind === 'audiooutput')?.deviceId || null
          }));
        }
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setState(prev => ({ ...prev, error: 'Failed to initialize audio devices' }));
      }
    };

    initAudio();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', initAudio);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', initAudio);
    };
  }, []);

  // Handle voice activity detection
  useEffect(() => {
    if (!localStreamRef.current || !analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let animationFrame: number;

    const detectVoiceActivity = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const isSpeaking = average > 30; // Adjust threshold as needed

      setState(prev => {
        if (prev.isSpeaking !== isSpeaking) {
          return { ...prev, isSpeaking };
        }
        return prev;
      });

      animationFrame = requestAnimationFrame(detectVoiceActivity);
    };

    detectVoiceActivity();
    return () => cancelAnimationFrame(animationFrame);
  }, [localStreamRef.current]);

  // Initialize local stream when party is joined
  useEffect(() => {
    if (!partyId || !userId || state.isMuted) return;

    const initLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: state.inputDevice || undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        localStreamRef.current = stream;

        // Connect stream to audio analyzer
        if (audioContextRef.current && analyserRef.current) {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
        }

        // Update all peer connections with the new stream
        peerConnectionsRef.current.forEach(peer => {
          stream.getTracks().forEach(track => {
            peer.connection.getSenders().forEach(sender => {
              if (sender.track?.kind === track.kind) {
                sender.replaceTrack(track);
              }
            });
          });
        });
      } catch (error) {
        console.error('Failed to get local stream:', error);
        setState(prev => ({ ...prev, error: 'Failed to access microphone' }));
      }
    };

    initLocalStream();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    };
  }, [partyId, userId, state.isMuted, state.inputDevice]);

  const createPeerConnection = useCallback((targetUserId: string) => {
    if (!localStreamRef.current) return;

    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local stream
    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current!);
    });

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      const peer = peerConnectionsRef.current.get(targetUserId);
      if (peer) {
        peer.audioStream = event.streams[0];
      }
    };

    // Store the connection
    peerConnectionsRef.current.set(targetUserId, {
      userId: targetUserId,
      connection: peerConnection,
      audioStream: null,
      isSpeaking: false
    });

    return peerConnection;
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => {
      const newMuted = !prev.isMuted;
      
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = !newMuted;
        });
      }

      return { ...prev, isMuted: newMuted };
    });
  }, []);

  const toggleDeafen = useCallback(() => {
    setState(prev => {
      const newDeafened = !prev.isDeafened;
      
      peerConnectionsRef.current.forEach(peer => {
        if (peer.audioStream) {
          peer.audioStream.getAudioTracks().forEach(track => {
            track.enabled = !newDeafened;
          });
        }
      });

      return { ...prev, isDeafened: newDeafened };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
    
    peerConnectionsRef.current.forEach(peer => {
      if (peer.audioStream) {
        peer.audioStream.getAudioTracks().forEach(track => {
          // @ts-ignore: MediaStreamTrack doesn't have volume property in TypeScript
          track.volume = volume;
        });
      }
    });
  }, []);

  const setInputDevice = useCallback(async (deviceId: string) => {
    try {
      setState(prev => ({ ...prev, inputDevice: deviceId }));
      
      if (localStreamRef.current) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = newStream;

        // Update all peer connections with the new stream
        peerConnectionsRef.current.forEach(peer => {
          newStream.getTracks().forEach(track => {
            peer.connection.getSenders().forEach(sender => {
              if (sender.track?.kind === track.kind) {
                sender.replaceTrack(track);
              }
            });
          });
        });
      }
    } catch (error) {
      console.error('Failed to set input device:', error);
      setState(prev => ({ ...prev, error: 'Failed to switch microphone' }));
    }
  }, []);

  const setOutputDevice = useCallback((deviceId: string) => {
    setState(prev => ({ ...prev, outputDevice: deviceId }));
    
    peerConnectionsRef.current.forEach(peer => {
      if (peer.audioStream) {
        const audioEl = new Audio();
        audioEl.srcObject = peer.audioStream;
        // @ts-ignore: HTMLAudioElement doesn't have setSinkId in TypeScript
        if (audioEl.setSinkId) {
          // @ts-ignore
          audioEl.setSinkId(deviceId);
        }
      }
    });
  }, []);

  return {
    state,
    devices,
    toggleMute,
    toggleDeafen,
    setVolume,
    setInputDevice,
    setOutputDevice,
    createPeerConnection
  };
}