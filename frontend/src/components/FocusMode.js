import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { Focus, X, TreePine, Zap } from "lucide-react";
import FocusTree from "./FocusTree";
import api from "@/lib/api";
import { toast } from "sonner";

/**
 * Focus Mode Toggle Button
 */
export function FocusModeToggle() {
  const { focusMode, setFocusMode } = useAppStore();
  const { isJunior } = useGradeTheme();

  return (
    <button
      onClick={() => setFocusMode(!focusMode)}
      className={`neura-btn text-sm h-10 px-4 ${
        focusMode
          ? isJunior ? "bg-[#1A1A2E] text-white" : "bg-indigo-600 text-white border-indigo-500"
          : isJunior ? "bg-white text-[#1A1A2E]" : "bg-[#F3F4F6] text-[#1A1A2E] border-[#D1D5DB]"
      }`}
      aria-pressed={focusMode}
      title="Focus Mode - hide distractions"
      data-testid="focus-mode-toggle"
    >
      <Focus className="w-4 h-4" />
      {focusMode ? "Exit Focus" : "Focus Mode"}
    </button>
  );
}

/**
 * Focus Mode Overlay - banner + tree gamification
 */
export function FocusModeOverlay() {
  const { focusMode, setFocusMode, emotionState, focusTreeMinutes, incrementFocusTree, resetFocusTree } = useAppStore();
  const { isJunior, isSenior } = useGradeTheme();
  const frustrationTimerRef = useRef(null);
  const treeTimerRef = useRef(null);
  const xpAwardedRef = useRef(false);
  const [showTree, setShowTree] = useState(false);

  // Auto-trigger after 30 continuous seconds of confused/tired
  useEffect(() => {
    if (emotionState === "confused" || emotionState === "tired") {
      if (!frustrationTimerRef.current) {
        frustrationTimerRef.current = setTimeout(() => {
          if (!focusMode) setFocusMode(true);
          frustrationTimerRef.current = null;
        }, 30000);
      }
    } else {
      if (frustrationTimerRef.current) {
        clearTimeout(frustrationTimerRef.current);
        frustrationTimerRef.current = null;
      }
    }
    return () => {
      if (frustrationTimerRef.current) {
        clearTimeout(frustrationTimerRef.current);
        frustrationTimerRef.current = null;
      }
    };
  }, [emotionState, focusMode, setFocusMode]);

  // Reset XP awarded flag when focus mode exits
  useEffect(() => {
    if (!focusMode) {
      xpAwardedRef.current = false;
    }
  }, [focusMode]);

  // Award +50 XP when 25 minutes milestone is reached
  useEffect(() => {
    if (focusMode && focusTreeMinutes >= 25 && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      api.post("/focus/complete").then(() => {
        toast.success(isJunior ? "🏆 +50 XP earned! You're a Focus Champion!" : "+50 XP — Focus session complete", { duration: 5000 });
        api.get("/auth/me").then((res) => {
          if (res.data.user) {
            window.dispatchEvent(new CustomEvent("neura-xp-update", { detail: res.data.user }));
          }
        }).catch(() => {});
      }).catch(() => {});
    }
  }, [focusTreeMinutes, focusMode, isJunior]);

  // Tree grows every minute in focus mode
  useEffect(() => {
    if (focusMode) {
      treeTimerRef.current = setInterval(() => {
        incrementFocusTree();
      }, 60000); // every 1 minute
    } else {
      if (treeTimerRef.current) {
        clearInterval(treeTimerRef.current);
        treeTimerRef.current = null;
      }
    }
    return () => {
      if (treeTimerRef.current) clearInterval(treeTimerRef.current);
    };
  }, [focusMode, incrementFocusTree]);

  if (!focusMode) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 px-6 py-2 flex items-center justify-between ${
        isJunior
          ? "bg-[#FFFBEB] border-b-4 border-[#FFD166]"
          : "bg-[#EEF2FF]/90 border-b border-indigo-500/30 backdrop-blur-xl"
      }`}
      role="banner"
      aria-label="Focus mode active"
    >
      <div className="flex items-center gap-3">
        <Focus className={`w-4 h-4 ${isJunior ? "text-[#b8860b]" : "text-[#4F46E5]"}`} />
        <span className={`text-sm font-bold ${isJunior ? "text-[#b8860b]" : "text-[#6366F1]"}`}>
          {isJunior ? "🌿 Focus Mode - distractions hidden!" : "Focus Mode Active"}
        </span>
        {/* Tree preview */}
        <button
          onClick={() => setShowTree((v) => !v)}
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
            isJunior
              ? "bg-[#FFD166]/30 text-[#b8860b] hover:bg-[#FFD166]/50"
              : "bg-indigo-500/10 text-[#4F46E5] hover:bg-indigo-500/20"
          }`}
          title="View your focus tree"
        >
          {isJunior ? <TreePine className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
          {focusTreeMinutes}m
        </button>
      </div>
      <button
        onClick={() => setFocusMode(false)}
        className={`flex items-center gap-1 text-xs font-bold ${
          isJunior ? "text-[#b8860b] hover:text-[#1A1A2E]" : "text-[#4F46E5] hover:text-indigo-200"
        }`}
      >
        <X className="w-3 h-3" /> Exit
      </button>

      {/* Tree popup */}
      {showTree && (
        <div
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 p-4 rounded-2xl border-2 shadow-xl z-50 flex flex-col items-center gap-2 ${
            isJunior
              ? "bg-white border-[#1A1A2E]"
              : "bg-white border-indigo-500/30"
          }`}
        >
          <FocusTree minutes={focusTreeMinutes} size={100} />
          <p className={`text-xs font-bold ${isJunior ? "text-[#374151]" : "text-[#6B7280]"}`}>
            {isJunior
              ? `Your tree has grown for ${focusTreeMinutes} min! 🌿`
              : `${focusTreeMinutes} / 25 min - ${Math.round(Math.min(focusTreeMinutes / 25, 1) * 100)}% complete`}
          </p>
          {focusTreeMinutes >= 25 && (
            <div className={`text-xs font-bold px-3 py-1 rounded-full ${
              isJunior ? "bg-[#FFD166] text-[#1A1A2E]" : "bg-indigo-600 text-white"
            }`}>
              {isJunior ? "🏆 +50 XP earned!" : "+50 XP - Focus Master"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
