import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { X } from "lucide-react";

const MOODS = [
  { emoji: "😄", label: "Great", value: "happy", color: "#06D6A0" },
  { emoji: "😊", label: "Good", value: "neutral", color: "#118AB2" },
  { emoji: "😐", label: "Okay", value: "neutral", color: "#FFD166" },
  { emoji: "😴", label: "Tired", value: "tired", color: "#C8B6FF" },
  { emoji: "😤", label: "Frustrated", value: "confused", color: "#EF476F" },
];

export default function MoodPicker({ onClose }) {
  const { emotionState, setSelfReportMood, resetQuizCount } = useAppStore();
  const { isJunior, isSenior, headingFont } = useGradeTheme();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    setSelfReportMood(selected.value);
    resetQuizCount();
    setSubmitted(true);

    // Check mismatch with webcam emotion
    const mismatch = selected.value !== emotionState;
    setTimeout(() => {
      onClose(selected, mismatch);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div className={`neura-card w-full max-w-sm p-6 ${isSenior ? "bg-white" : "bg-white"}`}>
        {!submitted ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold ${isJunior ? "text-[#1A1A2E]" : "text-[#1A1A2E]"}`}
                style={headingFont}
              >
                {isJunior ? "How are you feeling? 😊" : "Quick Check-In"}
              </h2>
              <button onClick={() => onClose(null, false)} className="text-[#6B7280] hover:text-[#6B7280]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-sm mb-5 ${isJunior ? "text-[#374151]" : "text-[#6B7280]"}`}>
              {isJunior
                ? "After 3 quizzes, let us know how you're doing!"
                : "Self-report your current state. This helps calibrate your learning experience."}
            </p>

            <div className="grid grid-cols-5 gap-2 mb-5">
              {MOODS.map((mood) => (
                <button
                  key={mood.value + mood.emoji}
                  onClick={() => setSelected(mood)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    selected?.emoji === mood.emoji
                      ? isJunior
                        ? "border-[#1A1A2E] shadow-[3px_3px_0px_#1A1A2E] scale-105"
                        : "border-indigo-500 bg-indigo-500/10 scale-105"
                      : isJunior
                        ? "border-[#e5e7eb] hover:border-[#1A1A2E]"
                        : "border-[#E5E7EB] hover:border-indigo-500/50"
                  }`}
                  aria-label={mood.label}
                  aria-pressed={selected?.emoji === mood.emoji}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className={`text-xs font-bold ${isJunior ? "text-[#374151]" : "text-[#6B7280]"}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selected}
              className={`neura-btn w-full h-12 disabled:opacity-40 ${
                isJunior
                  ? "bg-[#118AB2] text-white"
                  : "bg-indigo-600 text-white border-indigo-500"
              }`}
            >
              {isJunior ? "Tell Neura! 🧠" : "Submit"}
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">{selected?.emoji}</div>
            <p className={`font-bold text-lg ${isJunior ? "text-[#1A1A2E]" : "text-[#1A1A2E]"}`} style={headingFont}>
              {isJunior ? "Thanks for telling me! 💙" : "Got it. Adjusting your experience."}
            </p>
            <p className={`text-sm mt-2 ${isJunior ? "text-[#6B7280]" : "text-[#6B7280]"}`}>
              {isJunior
                ? "Neura will help you feel better!"
                : "TTS speed and content pacing will adapt accordingly."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
