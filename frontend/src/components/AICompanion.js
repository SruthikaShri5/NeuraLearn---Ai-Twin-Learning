import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { X, Sparkles } from "lucide-react";

const MASCOT_URL =
  "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/0d5a58ad11917c107d19197bb800270b2ab4affe5ac9d9ef444167284e0b11be.png";

const EMOTION_CONFIG = {
  neutral:   { color: "#118AB2", glow: "rgba(17,138,178,0.4)",  label: "Calm",      msg: "I'm here with you! 😊" },
  happy:     { color: "#06D6A0", glow: "rgba(6,214,160,0.5)",   label: "Happy",     msg: "You're doing amazing! 🌟" },
  focused:   { color: "#C8B6FF", glow: "rgba(200,182,255,0.5)", label: "Focused",   msg: "Deep focus mode! 🎯" },
  tired:     { color: "#FFD166", glow: "rgba(255,209,102,0.4)", label: "Tired",     msg: "Take a breath, you've got this 💛" },
  confused:  { color: "#EF476F", glow: "rgba(239,71,111,0.4)",  label: "Confused",  msg: "Let's slow down and try again 🤔" },
  excited:   { color: "#FF6B35", glow: "rgba(255,107,53,0.5)",  label: "Excited",   msg: "Love the energy! Keep going 🚀" },
  frustrated:{ color: "#EF476F", glow: "rgba(239,71,111,0.4)",  label: "Frustrated",msg: "It's okay — every mistake is learning 💪" },
  bored:     { color: "#94a3b8", glow: "rgba(148,163,184,0.3)", label: "Bored",     msg: "Let's try something different! ✨" },
};

const MESSAGES_JR = [
  "You're a superstar! ⭐",
  "Keep going, you've got this! 💪",
  "Every question makes you smarter! 🧠",
  "I believe in you! 🌈",
  "Mistakes help us grow! 🌱",
  "You're doing so well! 🎉",
];

const MESSAGES_SR = [
  "Consistent effort compounds over time.",
  "Each session builds your knowledge graph.",
  "Spaced repetition is working for you.",
  "Your attention score is being tracked.",
  "Focus on understanding, not memorising.",
  "Progress is non-linear — keep going.",
];

export default function AICompanion({ onClose }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tickRef = useRef(0);
  const { emotionState, cognitiveLoad, attentionScore } = useAppStore();
  const { isJunior } = useGradeTheme();
  const [message, setMessage] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);

  const cfg = EMOTION_CONFIG[emotionState] || EMOTION_CONFIG.neutral;

  // Rotate messages every 8 seconds
  useEffect(() => {
    const msgs = isJunior ? MESSAGES_JR : MESSAGES_SR;
    setMessage(msgs[msgIndex % msgs.length]);
    const t = setInterval(() => {
      setMsgIndex((i) => {
        const next = (i + 1) % msgs.length;
        setMessage(msgs[next]);
        return next;
      });
    }, 8000);
    return () => clearInterval(t);
  }, [isJunior, msgIndex]);

  // Canvas orb animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const S = 120;
    canvas.width = S;
    canvas.height = S;

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      tickRef.current++;
      const t = tickRef.current;
      ctx.clearRect(0, 0, S, S);

      const cx = S / 2;
      const cy = S / 2;
      const pulse = Math.sin(t * 0.04) * 6;
      const r = 38 + pulse;

      // Outer glow
      const grd = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.6);
      grd.addColorStop(0, cfg.glow);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Core orb
      const orbGrd = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, r);
      orbGrd.addColorStop(0, "#ffffff");
      orbGrd.addColorStop(0.3, cfg.color);
      orbGrd.addColorStop(1, cfg.glow.replace("0.", "0.6").replace(",0.", ",0.6"));
      ctx.fillStyle = orbGrd;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      const particleCount = 6;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + t * 0.02;
        const dist = r + 10 + Math.sin(t * 0.05 + i) * 5;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const pr = 2 + Math.sin(t * 0.07 + i * 1.3) * 1.5;
        ctx.fillStyle = cfg.color;
        ctx.globalAlpha = 0.5 + Math.sin(t * 0.06 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [cfg]);

  return (
    <div
      className="fixed top-20 left-4 w-64 neura-card p-4 z-50 bg-white"
      role="complementary"
      aria-label="AI Companion Neura"
      data-testid="ai-companion"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#118AB2]" />
          <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "Fredoka, sans-serif" }}>
            Neura
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: cfg.color + "20", color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#EF476F]/10 text-[#64748B] hover:text-[#EF476F]"
          aria-label="Close companion"
          data-testid="companion-close-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Orb + mascot */}
      <div className="flex flex-col items-center mb-3">
        {isJunior ? (
          <img
            src={MASCOT_URL}
            alt="Neura mascot"
            className="w-24 h-24 object-contain float-animation"
          />
        ) : (
          <canvas ref={canvasRef} className="w-24 h-24" aria-hidden="true" />
        )}
        {/* Emotion message */}
        <div
          className="mt-2 px-3 py-2 rounded-xl text-xs font-semibold text-center w-full"
          style={{ background: cfg.color + "15", color: cfg.color }}
          aria-live="polite"
        >
          {cfg.msg}
        </div>
      </div>

      {/* Rotating tip */}
      <div className="p-3 rounded-xl bg-[#f8fafc] border-2 border-[#e2e8f0] mb-3">
        <p className="text-xs text-[#334155] font-semibold text-center leading-relaxed" aria-live="polite">
          {message}
        </p>
      </div>

      {/* Cognitive metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-[#118AB2]/10 text-center">
          <p className="text-xs font-bold text-[#64748B]">Cog. Load</p>
          <p className="text-lg font-bold text-[#118AB2]" style={{ fontFamily: "Fredoka, sans-serif" }}>
            {cognitiveLoad}%
          </p>
        </div>
        <div className="p-2 rounded-lg bg-[#06D6A0]/10 text-center">
          <p className="text-xs font-bold text-[#64748B]">Attention</p>
          <p className="text-lg font-bold text-[#06D6A0]" style={{ fontFamily: "Fredoka, sans-serif" }}>
            {attentionScore}%
          </p>
        </div>
      </div>
    </div>
  );
}
