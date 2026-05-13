import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { X, ChevronRight, ChevronLeft, Map } from "lucide-react";

/**
 * VirtualTour - custom React 19 compatible guided tour
 * No external dependencies. Uses getBoundingClientRect to position tooltips.
 * Grade-adaptive: junior (cartoon, friendly) vs senior (professional, clean)
 */

const JUNIOR_STEPS = [
  { target: "[data-testid='welcome-card']", title: "👋 Hey Superstar!", content: "Welcome to NeuraLearn! This is your home base. Benny the Brain is here to help you learn amazing things every day! 🧠", placement: "bottom" },
  { target: "[data-testid='lessons-section']", title: "🎒 Your Lessons!", content: "These are your lessons! Click any card to start learning. Each lesson has fun questions - you can earn XP points! ⭐", placement: "top" },
  { target: "[data-testid='stats-grid']", title: "🏆 Your Superpowers!", content: "See your XP, streak, level, and badges here! Keep your streak going every day! ", placement: "bottom" },
  { target: "[data-testid='companion-toggle-btn']", title: "🤖 Meet Neura!", content: "Click here to meet Neura, your AI learning buddy! Neura changes colour based on how you're feeling! 🌈", placement: "bottom" },
  { target: "[data-testid='emotion-toggle-btn']", title: "😊 Mood Cam!", content: "This magic camera can see how you're feeling! If you look tired, Neura will help you take a break. .", placement: "bottom" },
  { target: "[data-testid='breathing-btn']", title: "🌿 Take a Breath!", content: "Feeling stressed? Click here for a calming breathing exercise! You've got this! 💙", placement: "bottom" },
  { target: "[data-testid='nav-knowledge-graph']", title: "🗺️ Learning Map!", content: "See all the topics you've learned on a cool map! Green means mastered, yellow means keep practising! 🗺️", placement: "bottom" },
  { target: "[data-testid='nav-analytics']", title: "📊 Your Progress!", content: "See charts of how much you've learned! Show your parents how awesome you're doing! 📈", placement: "bottom" },
];

const SENIOR_STEPS = [
  { target: "[data-testid='welcome-card']", title: "Dashboard Overview", content: "Your central command centre. Track XP, streaks, and upcoming reviews. The system adapts to your learning patterns in real-time.", placement: "bottom" },
  { target: "[data-testid='lessons-section']", title: "Adaptive Lesson Library", content: "Curriculum-aligned lessons for your grade. Content difficulty adjusts based on your performance history and spaced repetition schedule.", placement: "top" },
  { target: "[data-testid='stats-grid']", title: "Performance Metrics", content: "Real-time XP, streak continuity, level progression, and achievement tracking. XP resets per level at 100 points.", placement: "bottom" },
  { target: "[data-testid='companion-toggle-btn']", title: "AI Companion - Neura", content: "An adaptive 3D orb that mirrors your cognitive state. Colour and particle behaviour respond to detected emotion and attention score.", placement: "bottom" },
  { target: "[data-testid='emotion-toggle-btn']", title: "Emotion Detection Engine", content: "Webcam-based facial analysis feeds into cognitive load and attention metrics. Data stays local - nothing is transmitted.", placement: "bottom" },
  { target: "[data-testid='breathing-btn']", title: "Stress Regulation", content: "4-7-8 breathing protocol with haptic feedback. Auto-triggers after sustained frustration detection (30s threshold).", placement: "bottom" },
  { target: "[data-testid='nav-knowledge-graph']", title: "Knowledge Graph", content: "D3.js force-directed graph of concept prerequisites. Node colour indicates mastery level. Drag to explore dependencies.", placement: "bottom" },
  { target: "[data-testid='nav-analytics']", title: "Learning Analytics", content: "Session data, mastery distribution, and daily learning time. Identify knowledge gaps at a glance.", placement: "bottom" },
];

function getElementRect(selector) {
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { top: rect.top + window.scrollY, left: rect.left + window.scrollX, width: rect.width, height: rect.height, bottom: rect.bottom + window.scrollY, right: rect.right + window.scrollX };
  } catch { return null; }
}

function TooltipBox({ step, stepIndex, totalSteps, onNext, onPrev, onSkip, isJunior }) {
  const [rect, setRect] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const update = () => {
      const r = getElementRect(step.target);
      setRect(r);
      if (r) {
        // Scroll element into view
        const el = document.querySelector(step.target);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setVisible(true), 400);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [step.target]);

  if (!rect) return null;

  // Calculate tooltip position
  const TOOLTIP_W = 320;
  const TOOLTIP_H = 200;
  const MARGIN = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight + window.scrollY;

  let top, left;
  const placement = step.placement || "bottom";

  if (placement === "bottom") {
    top = rect.bottom + MARGIN;
    left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
  } else if (placement === "top") {
    top = rect.top - TOOLTIP_H - MARGIN;
    left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
  } else if (placement === "left") {
    top = rect.top + rect.height / 2 - TOOLTIP_H / 2;
    left = rect.left - TOOLTIP_W - MARGIN;
  } else {
    top = rect.top + rect.height / 2 - TOOLTIP_H / 2;
    left = rect.right + MARGIN;
  }

  // Clamp to viewport
  left = Math.max(MARGIN, Math.min(left, vw - TOOLTIP_W - MARGIN));
  top = Math.max(MARGIN + window.scrollY, top);

  const spotlightPad = 8;

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div
        className="fixed inset-0 z-[9990] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse ${rect.width + spotlightPad * 2}px ${rect.height + spotlightPad * 2}px at ${rect.left + rect.width / 2}px ${rect.top - window.scrollY + rect.height / 2}px, transparent 100%, rgba(0,0,0,0.7) 100%)`,
        }}
      />
      {/* Spotlight border */}
      <div
        className="fixed z-[9991] pointer-events-none"
        style={{
          top: rect.top - window.scrollY - spotlightPad,
          left: rect.left - spotlightPad,
          width: rect.width + spotlightPad * 2,
          height: rect.height + spotlightPad * 2,
          borderRadius: isJunior ? "16px" : "8px",
          border: isJunior ? "3px solid #FFD166" : "2px solid rgba(99,102,241,0.8)",
          boxShadow: isJunior ? "0 0 0 4px rgba(255,209,102,0.3)" : "0 0 20px rgba(99,102,241,0.4)",
          transition: "all 0.3s ease",
        }}
      />

      {/* Tooltip */}
      <div
        className={`fixed z-[9992] transition-all duration-300 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        style={{ top, left, width: TOOLTIP_W }}
      >
        <div
          className={`p-5 rounded-2xl shadow-2xl ${
            isJunior
              ? "bg-white border-[2.5px] border-[#1A1A2E] shadow-[5px_5px_0px_#1A1A2E]"
              : "bg-white/95 border border-indigo-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.3)]"
          }`}
        >
          {/* Step counter */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex
                      ? isJunior ? "w-4 bg-[#FF6B35]" : "w-4 bg-indigo-500"
                      : i < stepIndex
                        ? isJunior ? "w-2 bg-[#06D6A0]" : "w-2 bg-indigo-700"
                        : isJunior ? "w-2 bg-gray-200" : "w-2 bg-[#E5E7EB]"
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-bold ${isJunior ? "text-[#6B7280]" : "text-[#6B7280]"}`}>
              {stepIndex + 1} / {totalSteps}
            </span>
          </div>

          <h3
            className={`font-bold mb-2 ${isJunior ? "text-[#1A1A2E] text-lg" : "text-[#1A1A2E] text-base"}`}
            style={{ fontFamily: isJunior ? "Fredoka, sans-serif" : "Space Grotesk, sans-serif" }}
          >
            {step.title}
          </h3>
          <p className={`text-sm leading-relaxed mb-4 ${isJunior ? "text-[#374151]" : "text-[#6B7280]"}`}>
            {step.content}
          </p>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onSkip}
              className={`text-xs font-medium ${isJunior ? "text-[#9CA3AF] hover:text-[#374151]" : "text-[#6B7280] hover:text-[#6B7280]"}`}
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {stepIndex > 0 && (
                <button
                  onClick={onPrev}
                  className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg border ${
                    isJunior
                      ? "border-[#e5e7eb] text-[#374151] hover:border-[#1A1A2E]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-indigo-500"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {isJunior ? "Back" : "Back"}
                </button>
              )}
              <button
                onClick={onNext}
                className={`flex items-center gap-1 text-sm font-bold px-4 py-1.5 rounded-lg ${
                  isJunior
                    ? "bg-[#FF6B35] text-white border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E]"
                    : "bg-indigo-600 text-white border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
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

export default function VirtualTour({ onFinish }) {
  const { tourActive, setTourActive, setTourCompleted } = useAppStore();
  const { isJunior } = useGradeTheme();
  const [stepIndex, setStepIndex] = useState(0);

  const steps = isJunior ? JUNIOR_STEPS : SENIOR_STEPS;

  const handleNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      handleFinish();
    }
  }, [stepIndex, steps.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleFinish = useCallback(() => {
    setTourActive(false);
    setTourCompleted(true);
    localStorage.setItem("neuralearn_tour_done", "1");
    setStepIndex(0);
    if (onFinish) onFinish();
  }, [setTourActive, setTourCompleted, onFinish]);

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
    <div className="fixed inset-0 z-[9989]" role="dialog" aria-label="Guided tour" aria-modal="true">
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
