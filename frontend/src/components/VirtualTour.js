import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { ChevronRight, ChevronLeft } from "lucide-react";

const JUNIOR_STEPS = [
  { target: "[data-testid='welcome-card']",        title: "👋 Hey Superstar!",       content: "Welcome to NeuraLearn! This is your home base. Benny the Brain is here to help you learn amazing things every day! 🧠" },
  { target: "[data-testid='stats-grid']",           title: "🏆 Your Superpowers!",    content: "See your XP, streak, level, and reviews here! Keep your streak going every day to earn more XP! ⭐" },
  { target: "[data-testid='lessons-section']",      title: "🎒 Your Lessons!",        content: "These are your lessons! Click any card to start learning. Each lesson has fun questions — you can earn XP points!" },
  { target: "[data-testid='companion-toggle-btn']", title: "🤖 Meet Neura!",          content: "Click here to meet Neura, your AI learning buddy! Neura changes colour based on how you're feeling! 🌈" },
  { target: "[data-testid='emotion-toggle-btn']",   title: "😊 Mood Cam!",            content: "This magic camera can see how you're feeling! If you look tired, Neura will help you take a break." },
  { target: "[data-testid='breathing-btn']",        title: "🌿 Take a Breath!",       content: "Feeling stressed? Click here for a calming breathing exercise! You've got this! 💙" },
  { target: "[data-testid='nav-knowledge-graph']",  title: "🗺️ Learning Map!",        content: "See all the topics you've learned on a cool map! Green means mastered, yellow means keep practising!" },
  { target: "[data-testid='nav-analytics']",        title: "📊 Your Progress!",       content: "See charts of how much you've learned! Show your parents how awesome you're doing! 📈" },
];

const SENIOR_STEPS = [
  { target: "[data-testid='welcome-card']",        title: "Dashboard Overview",        content: "Your central command centre. Track XP, streaks, and upcoming reviews. The system adapts to your learning patterns in real-time." },
  { target: "[data-testid='stats-grid']",           title: "Performance Metrics",      content: "Real-time XP, streak continuity, level progression, and review tracking. XP resets per level at 100 points." },
  { target: "[data-testid='lessons-section']",      title: "Adaptive Lesson Library",  content: "Curriculum-aligned lessons for your grade. Content difficulty adjusts based on your performance history and spaced repetition schedule." },
  { target: "[data-testid='companion-toggle-btn']", title: "AI Companion — Neura",     content: "An adaptive 3D orb that mirrors your cognitive state. Colour and particle behaviour respond to detected emotion and attention score." },
  { target: "[data-testid='emotion-toggle-btn']",   title: "Emotion Detection",        content: "Webcam-based facial analysis feeds into cognitive load and attention metrics. Data stays local — nothing is transmitted." },
  { target: "[data-testid='breathing-btn']",        title: "Stress Regulation",        content: "4-7-8 breathing protocol with haptic feedback. Auto-triggers after sustained frustration detection (30s threshold)." },
  { target: "[data-testid='nav-knowledge-graph']",  title: "Knowledge Graph",          content: "D3.js force-directed graph of concept prerequisites. Node colour indicates mastery level. Drag to explore dependencies." },
  { target: "[data-testid='nav-analytics']",        title: "Learning Analytics",       content: "Session data, mastery distribution, and daily learning time. Identify knowledge gaps at a glance." },
];

const DISABILITY_STEPS = {
  visual: [
    { target: "body", title: "Audio-First Navigation", content: "Since you've enabled Visual Mode, I've activated my Voice Engine. You can navigate the entire app using voice commands. Say 'Next' to proceed through this tour!" },
    { target: "[data-testid='voice-nav-btn']", title: "Voice Assistant", content: "This button indicates that I'm listening to your voice. You can say 'Open Tutor', 'Go to Dashboard', or 'Read Lesson' anytime." },
  ],
  dyslexia: [
    { target: "body", title: "Specialized Fonts", content: "I've updated all text to use the OpenDyslexic font and increased spacing to make reading more comfortable for you." },
  ],
  cognitive: [
    { target: "body", title: "Simplified Mode", content: "I've reduced distractions and enabled Step-by-Step mode to help you focus on one concept at a time." },
  ],
  hearing: [
    { target: "body", title: "Visual Cues", content: "I've prioritized visual notifications and captions. You'll see a flash on the screen whenever there's an important update." },
  ],
};

const TOOLTIP_W = 280;
const MARGIN = 8;

/**
 * Get element's viewport-relative rect WITHOUT scrolling.
 * Returns null if element not found.
 */
function getViewportRect(selector) {
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    return el.getBoundingClientRect(); // always viewport-relative
  } catch { return null; }
}

/**
 * Compute tooltip top/left so it stays fully inside the viewport.
 * Prefers below the element; falls back to above if not enough space.
 */
function computeTooltipPos(elRect, tooltipH) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - elRect.bottom;
  const spaceAbove = elRect.top;

  let top, left;

  // Prefer below; fall back to above
  if (spaceBelow >= tooltipH + MARGIN) {
    top = elRect.bottom + MARGIN;
  } else if (spaceAbove >= tooltipH + MARGIN) {
    top = elRect.top - tooltipH - MARGIN;
  } else {
    // Not enough space either side — centre vertically in viewport
    top = Math.max(MARGIN, (vh - tooltipH) / 2);
  }

  // Horizontally centred on element, clamped to viewport
  left = elRect.left + elRect.width / 2 - TOOLTIP_W / 2;
  left = Math.max(MARGIN, Math.min(left, vw - TOOLTIP_W - MARGIN));

  // Final vertical clamp
  top = Math.max(MARGIN, Math.min(top, vh - tooltipH - MARGIN));

  return { top, left };
}

function TooltipBox({ step, stepIndex, totalSteps, onNext, onPrev, onSkip, isJunior }) {
  const [pos, setPos] = useState(null);
  const [elRect, setElRect] = useState(null);
  const [visible, setVisible] = useState(false);
  const TOOLTIP_H = 180; // reduced estimated height

  useEffect(() => {
    setVisible(false);
    setPos(null);

    const compute = () => {
      const r = getViewportRect(step.target);
      if (!r) return;
      setElRect(r);
      setPos(computeTooltipPos(r, TOOLTIP_H));
      setTimeout(() => setVisible(true), 200);
    };

    compute();

    // Recompute on resize
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [step.target]);

  if (!pos || !elRect) return null;

  const spotPad = 6;

  return (
    <>
      {/* Semi-transparent overlay — fixed, covers whole viewport */}
      <div
        className="fixed inset-0 z-[9990] pointer-events-none"
        style={{ background: "rgba(0,0,0,0.55)" }}
      />

      {/* Spotlight cutout — punches a hole over the target element */}
      <div
        className="fixed z-[9991] pointer-events-none"
        style={{
          top:    elRect.top    - spotPad,
          left:   elRect.left   - spotPad,
          width:  elRect.width  + spotPad * 2,
          height: elRect.height + spotPad * 2,
          borderRadius: isJunior ? "16px" : "8px",
          boxShadow: isJunior
            ? "0 0 0 9999px rgba(0,0,0,0.55), 0 0 0 3px #FFD166, 0 0 0 6px rgba(255,209,102,0.3)"
            : "0 0 0 9999px rgba(0,0,0,0.55), 0 0 0 2px rgba(99,102,241,0.9), 0 0 20px rgba(99,102,241,0.4)",
          transition: "all 0.3s ease",
        }}
      />

      {/* Tooltip — always inside viewport */}
      <div
        className={`fixed z-[9992] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        style={{ top: pos.top, left: pos.left, width: TOOLTIP_W }}
      >
        <div
          className={`p-5 rounded-2xl shadow-2xl ${
            isJunior
              ? "bg-white border-[2.5px] border-[#1A1A2E] shadow-[5px_5px_0px_#1A1A2E]"
              : "bg-white border border-indigo-500/40 shadow-xl"
          }`}
        >
          {/* Progress dots */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex
                      ? isJunior ? "w-4 bg-[#FF6B35]" : "w-4 bg-indigo-500"
                      : i < stepIndex
                        ? isJunior ? "w-2 bg-[#06D6A0]" : "w-2 bg-indigo-400"
                        : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#6B7280]">{stepIndex + 1} / {totalSteps}</span>
          </div>

          {/* Title */}
          <h3
            className={`font-bold mb-1 ${isJunior ? "text-[#1A1A2E] text-base" : "text-[#1A1A2E] text-sm"}`}
            style={{ fontFamily: isJunior ? "Fredoka, sans-serif" : "Space Grotesk, sans-serif" }}
          >
            {step.title}
          </h3>

          {/* Content */}
          <p className={`text-[13px] leading-tight mb-3 ${isJunior ? "text-[#374151]" : "text-[#6B7280]"}`}>
            {step.content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onSkip}
              className="text-xs font-medium text-[#9CA3AF] hover:text-[#374151] transition-colors"
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {stepIndex > 0 && (
                <button
                  onClick={onPrev}
                  className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                    isJunior
                      ? "border-[#e5e7eb] text-[#374151] hover:border-[#1A1A2E]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-indigo-500"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                onClick={onNext}
                className={`flex items-center gap-1 text-sm font-bold px-4 py-1.5 rounded-lg transition-colors ${
                  isJunior
                    ? "bg-[#FF6B35] text-white border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E] hover:shadow-[3px_3px_0px_#1A1A2E]"
                    : "bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-700"
                }`}
              >
                {stepIndex === totalSteps - 1
                  ? (isJunior ? "🎉 Done!" : "Finish")
                  : (isJunior ? "Next →" : "Next")}
                {stepIndex < totalSteps - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VirtualTour({ onFinish, disability }) {
  const { tourActive, setTourActive, setTourCompleted } = useAppStore();
  const { isJunior } = useGradeTheme();
  const [stepIndex, setStepIndex] = useState(0);

  const baseSteps = isJunior ? JUNIOR_STEPS : SENIOR_STEPS;
  const disabilitySteps = DISABILITY_STEPS[disability] || [];
  const steps = [...disabilitySteps, ...baseSteps];

  const handleFinish = useCallback(() => {
    setTourActive(false);
    setTourCompleted(true);
    localStorage.setItem("neuralearn_tour_done", "1");
    setStepIndex(0);
    if (onFinish) onFinish();
  }, [setTourActive, setTourCompleted, onFinish]);

  const handleNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      handleFinish();
    }
  }, [stepIndex, steps.length, handleFinish]);

  const handlePrev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!tourActive) return;
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleFinish();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tourActive, handleNext, handlePrev, handleFinish]);

  if (!tourActive) return null;

  return (
    <div
      className="fixed inset-0 z-[9989]"
      role="dialog"
      aria-label="Guided tour"
      aria-modal="true"
    >
      <TooltipBox
        step={steps[stepIndex]}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={handleFinish}
        isJunior={isJunior}
      />
    </div>
  );
}
