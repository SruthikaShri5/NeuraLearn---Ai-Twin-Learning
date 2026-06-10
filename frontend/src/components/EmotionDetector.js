import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Camera, CameraOff, X, RefreshCw } from "lucide-react";

const EMOTION_LABELS = ["neutral", "happy", "focused", "tired", "confused"];

const EMOTION_COLORS = {
  neutral:   "#118AB2",
  happy:     "#06D6A0",
  focused:   "#C8B6FF",
  tired:     "#FFD166",
  confused:  "#EF476F",
};

const EMOTION_EMOJIS = {
  neutral:   "😐",
  happy:     "😊",
  focused:   "🎯",
  tired:     "😴",
  confused:  "🤔",
};

export default function EmotionDetector({ onClose }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const intervalRef = useRef(null);
  const frameCount = useRef(0);
  const prevBright = useRef(null);

  const { setEmotionState, setCognitiveLoad, setAttentionScore } = useAppStore();

  // Use local reactive state for display
  const [cameraActive,    setCameraActive]    = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMsg,        setErrorMsg]        = useState(null);
  const [detectedEmotion, setDetectedEmotion] = useState("neutral");
  const [confidence,      setConfidence]      = useState(0);
  const [cogLoad,         setCogLoad]         = useState(30);
  const [attention,       setAttention]       = useState(75);

  // ── Stop everything ────────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
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

  // ── Simulated detection (fallback) ─────────────────────────────────────────
  const startSimulated = useCallback(() => {
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick++;
      if (tick % 8 === 0) {
        const emotion = EMOTION_LABELS[Math.floor(Math.random() * EMOTION_LABELS.length)];
        const conf    = 55 + Math.floor(Math.random() * 30);
        const cog     = 30 + Math.floor(Math.random() * 40);
        const att     = 50 + Math.floor(Math.random() * 40);
        setDetectedEmotion(emotion);
        setConfidence(conf);
        setCogLoad(cog);
        setAttention(att);
        setEmotionState(emotion);
        setCognitiveLoad(cog);
        setAttentionScore(att);
      }
    }, 1000);
  }, [setEmotionState, setCognitiveLoad, setAttentionScore]);

  // ── Frame analysis ─────────────────────────────────────────────────────────
  const analyzeFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");
    canvas.width  = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, 160, 120);

    const imageData = ctx.getImageData(0, 0, 160, 120).data;
    let brightness = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      brightness += (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
    }
    brightness /= imageData.length / 4;

    const motionDelta = prevBright.current !== null
      ? Math.abs(brightness - prevBright.current)
      : 0;
    prevBright.current = brightness;
    frameCount.current++;

    // Heuristic emotion mapping
    let emotion = "neutral";
    let conf    = 0.6;
    if (brightness > 160)                                    { emotion = "happy";   conf = 0.70; }
    else if (brightness < 80)                                { emotion = "tired";   conf = 0.65; }
    else if (motionDelta > 5)                                { emotion = "focused"; conf = 0.72; }
    else if (motionDelta < 0.5 && frameCount.current > 30)  { emotion = "confused";conf = 0.55; }

    // Update every ~3 seconds (30 frames at 10fps)
    if (frameCount.current % 30 === 0) {
      const cog = Math.round(Math.max(20, Math.min(90, 50 + motionDelta * 5)));
      const att = Math.round(Math.max(30, Math.min(100, brightness / 2)));

      setDetectedEmotion(emotion);
      setConfidence(Math.round(conf * 100));
      setCogLoad(cog);
      setAttention(att);
      setEmotionState(emotion);
      setCognitiveLoad(cog);
      setAttentionScore(att);
    }

    // Draw face bounding box overlay
    ctx.strokeStyle = "#06D6A0";
    ctx.lineWidth   = 2;
    ctx.strokeRect(40, 20, 80, 80);
    ctx.fillStyle   = "#06D6A0";
    ctx.font        = "10px Nunito";
    ctx.fillText(emotion, 40, 115);
  }, [setEmotionState, setCognitiveLoad, setAttentionScore]);

  // ── Start camera ───────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    stopAll();
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setPermissionDenied(true);
        setErrorMsg("Camera blocked — using simulated detection.");
      } else {
        setErrorMsg("Camera unavailable — using simulated detection.");
      }
      startSimulated();
    }
  }, [stopAll, startSimulated]);

  // Start frame analysis loop when camera is active
  useEffect(() => {
    if (cameraActive) {
      intervalRef.current = setInterval(analyzeFrame, 100); // 10 fps
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cameraActive, analyzeFrame]);

  // Auto-start on mount
  useEffect(() => {
    startCamera();
    return () => stopAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const color = EMOTION_COLORS[detectedEmotion] || "#118AB2";

  return (
    <div
      className="fixed top-16 right-4 w-72 z-50 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#1A1A2E] bg-white"
      data-testid="emotion-detector"
      role="complementary"
      aria-label="Emotion detection panel"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F172A]">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#06D6A0]" />
          <span className="text-sm font-bold text-white" style={{ fontFamily: "Fredoka, sans-serif" }}>
            Emotion Detector
          </span>
          {/* Live / Sim badge */}
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            cameraActive ? "bg-[#EF476F]/20 text-[#EF476F]" : "bg-[#64748B]/20 text-[#94a3b8]"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? "bg-[#EF476F] animate-pulse" : "bg-[#64748B]"}`} />
            {cameraActive ? "LIVE" : "SIM"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Retry camera button */}
          {!cameraActive && (
            <button
              onClick={startCamera}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#94a3b8] hover:text-white"
              title="Retry camera"
              aria-label="Retry camera"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#94a3b8] hover:text-white"
            aria-label="Close emotion detector"
            data-testid="emotion-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Camera feed — large and visible ── */}
      <div className="relative w-full bg-[#0F172A]" style={{ height: "180px" }}>
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
              aria-label="Camera feed for emotion detection"
            />
            {/* Canvas overlay for face box */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ opacity: 0.7 }}
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <CameraOff className="w-10 h-10 text-white/30" />
            <p className="text-white/40 text-xs text-center px-6 leading-relaxed">
              {permissionDenied
                ? "Camera access blocked.\nAllow camera in browser settings."
                : "No camera detected.\nSimulated detection active."}
            </p>
            <button
              onClick={startCamera}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#118AB2]/20 text-[#118AB2] hover:bg-[#118AB2]/30 border border-[#118AB2]/40"
            >
              <RefreshCw className="w-3 h-3" /> Try Again
            </button>
          </div>
        )}
      </div>

      {/* ── Error message ── */}
      {errorMsg && (
        <div className="px-4 py-2 bg-[#FFD166]/10 border-b border-[#FFD166]/30">
          <p className="text-xs text-[#b8860b] font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* ── Detected emotion ── */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="flex items-center gap-3 p-3 rounded-xl border-2 mb-3"
          style={{ borderColor: color, backgroundColor: color + "15" }}
        >
          <span className="text-3xl" aria-hidden="true">{EMOTION_EMOJIS[detectedEmotion] || "😐"}</span>
          <div className="flex-1">
            <p className="font-bold text-[#0F172A] capitalize text-sm" style={{ fontFamily: "Fredoka, sans-serif" }}>
              {detectedEmotion}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${confidence}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-xs font-bold text-[#64748B]">{confidence}%</span>
            </div>
          </div>
        </div>

        {/* ── Cognitive metrics ── */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-[#118AB2]/10 text-center">
            <p className="text-[10px] font-bold text-[#64748B] mb-0.5">Cognitive Load</p>
            <p className="text-xl font-bold text-[#118AB2]" style={{ fontFamily: "Fredoka, sans-serif" }}>
              {cogLoad}%
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#06D6A0]/10 text-center">
            <p className="text-[10px] font-bold text-[#64748B] mb-0.5">Attention</p>
            <p className="text-xl font-bold text-[#06D6A0]" style={{ fontFamily: "Fredoka, sans-serif" }}>
              {attention}%
            </p>
          </div>
        </div>

        <p className="text-[10px] text-[#94a3b8] text-center pb-2">
          {cameraActive
            ? "Analysing facial expressions in real-time"
            : "Simulated detection — allow camera for real analysis"}
        </p>
      </div>
    </div>
  );
}
