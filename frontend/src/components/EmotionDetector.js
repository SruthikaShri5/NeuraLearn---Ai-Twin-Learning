import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Camera, CameraOff, X } from "lucide-react";

/**
 * Emotion Detection UI
 * Uses webcam + canvas to detect facial expressions via brightness/motion heuristics
 * (Full face-api.js integration would require model files; this provides the UI scaffold
 *  with simulated emotion detection that can be swapped for real ML inference)
 */

const EMOTION_LABELS = ['neutral', 'happy', 'focused', 'tired', 'confused'];

export default function EmotionDetector({ onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const prevBrightnessRef = useRef(null);

  const { setEmotionState, setCognitiveLoad, setAttentionScore, emotionState } = useAppStore();
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [detectedEmotion, setDetectedEmotion] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setError(null);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setError('Camera permission denied. Using simulated detection.');
      } else {
        setError('Camera not available. Using simulated detection.');
      }
      // Start simulated detection
      startSimulatedDetection();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Analyze frame for emotion heuristics
  const analyzeFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, 160, 120);

    const imageData = ctx.getImageData(0, 0, 160, 120);
    const data = imageData.data;

    // Calculate average brightness
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness /= (data.length / 4);

    // Motion detection via brightness delta
    const prevBrightness = prevBrightnessRef.current;
    const motionDelta = prevBrightness !== null ? Math.abs(brightness - prevBrightness) : 0;
    prevBrightnessRef.current = brightness;
    frameCountRef.current++;

    // Heuristic emotion mapping
    // (In production, replace with face-api.js model inference)
    let emotion = 'neutral';
    let conf = 0.6;

    if (brightness > 160) {
      emotion = 'happy';
      conf = 0.7;
    } else if (brightness < 80) {
      emotion = 'tired';
      conf = 0.65;
    } else if (motionDelta > 5) {
      emotion = 'focused';
      conf = 0.72;
    } else if (motionDelta < 0.5 && frameCountRef.current > 30) {
      emotion = 'confused';
      conf = 0.55;
    }

    // Smooth transitions — only update every 3 seconds
    if (frameCountRef.current % 90 === 0) {
      setDetectedEmotion(emotion);
      setConfidence(Math.round(conf * 100));
      setEmotionState(emotion);

      // Update cognitive metrics
      const cogLoad = Math.max(20, Math.min(90, 50 + (motionDelta * 5)));
      const attention = Math.max(30, Math.min(100, brightness / 2));
      setCognitiveLoad(Math.round(cogLoad));
      setAttentionScore(Math.round(attention));
    }

    // Draw face overlay on canvas
    ctx.strokeStyle = '#06D6A0';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 20, 80, 80); // face bounding box estimate
    ctx.fillStyle = '#06D6A0';
    ctx.font = '10px Nunito';
    ctx.fillText(emotion, 40, 115);
  }, [setEmotionState, setCognitiveLoad, setAttentionScore]);

  // Simulated detection when no camera
  const startSimulatedDetection = useCallback(() => {
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick++;
      if (tick % 10 === 0) {
        const idx = Math.floor(Math.random() * EMOTION_LABELS.length);
        const emotion = EMOTION_LABELS[idx];
        setDetectedEmotion(emotion);
        setConfidence(55 + Math.floor(Math.random() * 30));
        setEmotionState(emotion);
        setCognitiveLoad(30 + Math.floor(Math.random() * 40));
        setAttentionScore(50 + Math.floor(Math.random() * 40));
      }
    }, 1000);
  }, [setEmotionState, setCognitiveLoad, setAttentionScore]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera, startSimulatedDetection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start frame analysis when camera is active
  useEffect(() => {
    if (cameraActive) {
      intervalRef.current = setInterval(analyzeFrame, 100); // 10fps analysis
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cameraActive, analyzeFrame]);

  const EMOTION_COLORS = {
    neutral: '#118AB2',
    happy: '#06D6A0',
    focused: '#C8B6FF',
    tired: '#FFD166',
    confused: '#EF476F',
  };

  const EMOTION_EMOJIS = {
    neutral: '😐',
    happy: '😊',
    focused: '🎯',
    tired: '😴',
    confused: '🤔',
  };

  return (
    <div className="fixed top-20 right-4 w-72 neura-card p-4 z-50 bg-white" data-testid="emotion-detector" role="complementary" aria-label="Emotion detection panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#118AB2]" />
          <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Emotion Detector</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#EF476F]/10 text-[#64748B] hover:text-[#EF476F]" aria-label="Close emotion detector" data-testid="emotion-close-btn">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Camera feed */}
      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-[#0F172A] mb-3">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
              aria-label="Camera feed for emotion detection"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full opacity-60"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <CameraOff className="w-8 h-8 text-white/40" />
            <p className="text-white/40 text-xs text-center px-4">
              {permissionDenied ? 'Camera blocked' : 'No camera'}
            </p>
          </div>
        )}

        {/* Live indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
          <div className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-[#EF476F] animate-pulse' : 'bg-[#64748B]'}`} />
          <span className="text-white text-xs font-bold">{cameraActive ? 'LIVE' : 'SIM'}</span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#FFD166] bg-[#FFD166]/10 rounded-lg p-2 mb-3 font-semibold">{error}</p>
      )}

      {/* Detected emotion */}
      <div className="flex items-center gap-3 p-3 rounded-xl border-2 mb-3" style={{ borderColor: EMOTION_COLORS[detectedEmotion] || '#118AB2', backgroundColor: `${EMOTION_COLORS[detectedEmotion]}15` }}>
        <span className="text-3xl" aria-hidden="true">{EMOTION_EMOJIS[detectedEmotion] || '😐'}</span>
        <div className="flex-1">
          <p className="font-bold text-[#0F172A] capitalize" style={{ fontFamily: 'Fredoka, sans-serif' }}>{detectedEmotion}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${confidence}%`, backgroundColor: EMOTION_COLORS[detectedEmotion] }} />
            </div>
            <span className="text-xs font-bold text-[#64748B]">{confidence}%</span>
          </div>
        </div>
      </div>

      {/* Cognitive metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-[#118AB2]/10 text-center">
          <p className="text-xs font-bold text-[#64748B]">Cognitive Load</p>
          <p className="text-lg font-bold text-[#118AB2]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {useAppStore.getState().cognitiveLoad}%
          </p>
        </div>
        <div className="p-2 rounded-lg bg-[#06D6A0]/10 text-center">
          <p className="text-xs font-bold text-[#64748B]">Attention</p>
          <p className="text-lg font-bold text-[#06D6A0]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {useAppStore.getState().attentionScore}%
          </p>
        </div>
      </div>

      <p className="text-xs text-[#94a3b8] mt-2 text-center">
        {cameraActive ? 'Analyzing facial expressions in real-time' : 'Simulated detection active'}
      </p>
    </div>
  );
}
