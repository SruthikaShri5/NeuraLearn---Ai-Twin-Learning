import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { Mic, MicOff } from "lucide-react";
import { getAdaptiveRate } from "@/lib/tts";

const COMMANDS = [
  { patterns: ["next question", "next", "continue"],        action: "next_question" },
  { patterns: ["previous", "back", "go back"],              action: "prev_question" },
  { patterns: ["hint", "give me a hint", "help"],           action: "hint" },
  { patterns: ["focus mode", "focus", "concentrate"],       action: "focus_mode" },
  { patterns: ["breathe", "breathing", "calm down"],        action: "breathe" },
  { patterns: ["open tour", "start tour", "tour"],          action: "open_tour" },
  { patterns: ["open tutor", "tutor", "ask neura"],         action: "open_tutor" },
  { patterns: ["dashboard", "go home", "home"],             action: "go_dashboard" },
  { patterns: ["read aloud", "read this", "read"],          action: "read_aloud" },
  { patterns: ["stop reading", "stop", "quiet"],            action: "stop_reading" },
  { patterns: ["knowledge graph", "graph", "map"],          action: "go_graph" },
  { patterns: ["analytics", "progress", "stats"],           action: "go_analytics" },
  { patterns: ["settings"],                                  action: "go_settings" },
  { patterns: ["submit", "submit quiz", "done", "finish"],  action: "submit" },
];

function matchCommand(text) {
  const lower = text.toLowerCase().trim();
  for (const cmd of COMMANDS) {
    if (cmd.patterns.some((p) => lower.includes(p))) return cmd;
  }
  return null;
}

export default function VoiceNav({ onCommand }) {
  const navigate = useNavigate();
  const { setBreathingActive, setFocusMode, focusMode, setTourActive } = useAppStore();
  const { isJunior, isSenior } = useGradeTheme();
  const [listening, setListening] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    const isSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setSupported(isSupported);
  }, []);

  const announce = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0; utt.volume = 0.8;
    window.speechSynthesis.speak(utt);
  }, []);

  const executeCommand = useCallback((cmd, rawText) => {
    setLastCommand({ action: cmd.action, text: rawText });
    setTimeout(() => setLastCommand(null), 3000);

    switch (cmd.action) {
      case "next_question":
        document.querySelector("[data-testid='quiz-next-btn']")?.click();
        announce("Next question");
        break;
      case "prev_question":
        document.querySelector("[data-testid='quiz-prev-btn']")?.click();
        announce("Going back");
        break;
      case "hint":
        document.querySelector("[data-testid='hint-btn']")?.click();
        announce("Showing hint");
        break;
      case "open_tour":
        setTourActive(true);
        announce("Starting guided tour");
        break;
      case "focus_mode":
        setFocusMode(!focusMode);
        announce(focusMode ? "Focus mode off" : "Focus mode on");
        break;
      case "breathe":
        setBreathingActive(true);
        announce("Opening breathing exercise");
        break;
      case "open_tutor":
        document.querySelector("[data-testid='tutor-toggle-btn']")?.click();
        announce("Opening AI tutor");
        break;
      case "go_dashboard":
        navigate("/dashboard");
        announce("Going to dashboard");
        break;
      case "go_graph":
        navigate("/knowledge-graph");
        announce("Opening knowledge graph");
        break;
      case "go_analytics":
        navigate("/analytics");
        announce("Opening analytics");
        break;
      case "go_settings":
        navigate("/settings");
        announce("Opening settings");
        break;
      case "read_aloud": {
        const main = document.getElementById("main-content");
        const text = main?.innerText?.slice(0, 2000) || "";
        if (window.speechSynthesis && text) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text);
          utt.rate = getAdaptiveRate();
          window.speechSynthesis.speak(utt);
        }
        break;
      }
      case "stop_reading":
        window.speechSynthesis?.cancel();
        announce("Stopped reading");
        break;
      case "submit":
        document.querySelector("[data-testid='quiz-next-btn']")?.click();
        announce("Submitting");
        break;
      default:
        if (onCommand) onCommand(cmd.action, rawText);
    }
  }, [navigate, setBreathingActive, setFocusMode, focusMode, setTourActive, announce, onCommand]);

  const startListening = useCallback(() => {
    if (!supported) return;
    setError(null);
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new SR();
      r.lang = "en-US";
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        const result = e.results[e.results.length - 1];
        const text = result[0].transcript;
        setTranscript(text);
        if (result.isFinal) {
          const cmd = matchCommand(text);
          if (cmd) executeCommand(cmd, text);
          setTranscript("");
        }
      };
      r.onerror = (e) => {
        if (e.error === "not-allowed") { setError("Microphone permission denied"); setListening(false); }
        else if (e.error === "no-speech") { /* silently continue */ }
        else if (e.error !== "aborted") { setError("Voice error: " + e.error); setListening(false); }
      };
      r.onend = () => {
        if (shouldListenRef.current) {
          try { recognitionRef.current?.start(); } catch (_) {}
        } else {
          setListening(false);
        }
      };
      recognitionRef.current = r;
      shouldListenRef.current = true;
      r.start();
      setListening(true);
      announce("Voice navigation active. Say a command.");
    } catch (err) {
      setError("Voice not supported in this browser");
      setListening(false);
    }
  }, [supported, executeCommand, announce]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
    setTranscript("");
  }, []);

  if (!supported) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-center gap-2">
      {/* Error message */}
      {error && (
        <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 border border-red-300 text-red-600 max-w-[180px] text-center">
          {error}
        </div>
      )}

      {/* Transcript bubble */}
      {transcript && (
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold max-w-[180px] text-center ${
          isSenior ? "bg-white border border-indigo-500/40 text-[#6366F1]" : "bg-white border-2 border-[#1A1A2E] text-[#1A1A2E]"
        }`}>
          "{transcript}"
        </div>
      )}

      {/* Last command feedback */}
      {lastCommand && (
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
          isSenior ? "bg-emerald-50 border border-emerald-500/30 text-emerald-600" : "bg-[#06D6A0]/10 border-2 border-[#06D6A0] text-[#065f46]"
        }`}>
          ✓ {lastCommand.action.replace(/_/g, " ")}
        </div>
      )}

      {/* Mic button */}
      <button
        data-testid="voice-nav-btn"
        onClick={listening ? stopListening : startListening}
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
          listening
            ? isSenior
              ? "bg-red-600 border-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              : "bg-[#EF476F] border-[#1A1A2E] text-white animate-pulse shadow-[3px_3px_0px_#1A1A2E]"
            : isSenior
              ? "bg-[#F3F4F6] border-indigo-500/40 text-[#4F46E5] hover:bg-indigo-600/20"
              : "bg-white border-[#1A1A2E] text-[#374151] hover:bg-[#f1f5f9] shadow-[3px_3px_0px_#1A1A2E]"
        }`}
        aria-label={listening ? "Stop voice navigation" : "Start voice navigation"}
        title={listening ? "Stop voice commands" : "Start voice commands"}
      >
        {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    </div>
  );
}
