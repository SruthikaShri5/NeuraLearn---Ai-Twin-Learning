import { useState, useEffect } from "react";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  { keys: ["?"],          description: "Show / hide this shortcuts overlay" },
  { keys: ["N"],          description: "Next question in quiz" },
  { keys: ["H"],          description: "Show hint (quiz)" },
  { keys: ["R"],          description: "Read aloud current content (TTS)" },
  { keys: ["F"],          description: "Toggle Focus Mode" },
  { keys: ["T"],          description: "Start / replay guided tour" },
  { keys: ["B"],          description: "Open Breathing Exercise" },
  { keys: ["C"],          description: "Toggle AI Companion" },
  { keys: ["E"],          description: "Toggle Emotion Detector" },
  { keys: ["S"],          description: "Toggle Soundscape" },
  { keys: ["1","2","3","4"], description: "Select quiz answer (Motor mode)" },
  { keys: ["Enter"],      description: "Submit / confirm" },
  { keys: ["←","→"],      description: "Navigate lesson steps" },
  { keys: ["Esc"],        description: "Close any open panel" },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const { isJunior, isSenior, headingFont } = useGradeTheme();

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
    >
      <div
        className={`neura-card w-full max-w-lg p-6 ${isSenior ? "bg-white" : "bg-white"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isJunior ? "bg-[#FFD166] border-2 border-[#1A1A2E]" : "bg-indigo-600/20 border border-indigo-500/40"
            }`}>
              <Keyboard className={`w-5 h-5 ${isJunior ? "text-[#1A1A2E]" : "text-[#4F46E5]"}`} />
            </div>
            <h2
              className={`text-xl font-bold ${isJunior ? "text-[#1A1A2E]" : "text-[#1A1A2E]"}`}
              style={headingFont}
            >
              {isJunior ? "⌨️ Keyboard Shortcuts" : "Keyboard Shortcuts"}
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className={`p-2 rounded-lg ${isJunior ? "hover:bg-gray-100 text-[#6B7280]" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
            aria-label="Close shortcuts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SHORTCUTS.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                isJunior
                  ? "bg-[#FFFBF0] border-2 border-[#e5e7eb]"
                  : "bg-[#F3F4F6]/50 border border-[#E5E7EB]/50"
              }`}
            >
              <div className="flex gap-1 shrink-0">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      isJunior
                        ? "bg-[#FFD166] text-[#1A1A2E] border-2 border-[#1A1A2E]"
                        : "bg-[#E5E7EB] text-[#1A1A2E] border border-[#D1D5DB] font-mono"
                    }`}
                  >
                    {k}
                  </kbd>
                ))}
              </div>
              <span className={`text-sm ${isJunior ? "text-[#374151] font-semibold" : "text-[#374151]"}`}>
                {s.description}
              </span>
            </div>
          ))}
        </div>

        <p className={`text-xs mt-4 text-center ${isJunior ? "text-[#6B7280]" : "text-[#6B7280]"}`}>
          Press <kbd className={`px-1.5 py-0.5 rounded text-xs ${isJunior ? "bg-gray-100 border border-gray-300" : "bg-[#F3F4F6] border border-[#E5E7EB]"}`}>?</kbd> anytime to toggle this overlay
        </p>
      </div>
    </div>
  );
}
