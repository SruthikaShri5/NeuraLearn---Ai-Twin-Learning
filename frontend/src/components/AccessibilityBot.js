import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import api from "@/lib/api";
import { Accessibility, X, Mic, MicOff, Check } from "lucide-react";

/**
 * Accessibility Bot - voice/text commands to control accessibility settings
 * Commands: "increase font", "high contrast", "read question", "reduce motion", etc.
 */

const COMMANDS = [
  { patterns: ["increase font", "bigger text", "larger font", "font large"], action: "font_large", label: "Font → Large" },
  { patterns: ["decrease font", "smaller text", "smaller font", "font small"], action: "font_small", label: "Font → Small" },
  { patterns: ["font medium", "normal font", "reset font"], action: "font_medium", label: "Font → Medium" },
  { patterns: ["high contrast", "dark mode", "contrast on"], action: "contrast_on", label: "High Contrast ON" },
  { patterns: ["normal contrast", "contrast off", "light mode"], action: "contrast_off", label: "High Contrast OFF" },
  { patterns: ["reduce motion", "stop animation", "no animation"], action: "motion_off", label: "Reduce Motion ON" },
  { patterns: ["enable motion", "animations on", "motion on"], action: "motion_on", label: "Reduce Motion OFF" },
  { patterns: ["read", "read aloud", "speak", "read this"], action: "read_page", label: "Reading page..." },
  { patterns: ["stop reading", "stop speaking", "quiet", "silence"], action: "stop_read", label: "Stopped reading" },
  { patterns: ["help", "what can you do", "commands"], action: "help", label: "Showing commands" },
];

function matchCommand(text) {
  const lower = text.toLowerCase();
  for (const cmd of COMMANDS) {
    if (cmd.patterns.some((p) => lower.includes(p))) return cmd;
  }
  return null;
}

export default function AccessibilityBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState([]);
  const recognitionRef = useRef(null);
  const { settings, updateSettings } = useAppStore();

  const executeCommand = (cmd) => {
    let msg = cmd.label;
    switch (cmd.action) {
      case "font_large":
        updateSettings({ fontSize: "large" });
        document.documentElement.style.fontSize = "18px";
        api.put("/user/settings", { font_size: "large" }).catch(() => {});
        break;
      case "font_small":
        updateSettings({ fontSize: "small" });
        document.documentElement.style.fontSize = "14px";
        api.put("/user/settings", { font_size: "small" }).catch(() => {});
        break;
      case "font_medium":
        updateSettings({ fontSize: "medium" });
        document.documentElement.style.fontSize = "16px";
        api.put("/user/settings", { font_size: "medium" }).catch(() => {});
        break;
      case "contrast_on":
        updateSettings({ highContrast: true });
        api.put("/user/settings", { high_contrast: true }).catch(() => {});
        break;
      case "contrast_off":
        updateSettings({ highContrast: false });
        api.put("/user/settings", { high_contrast: false }).catch(() => {});
        break;
      case "motion_off":
        updateSettings({ reduceMotion: true });
        api.put("/user/settings", { reduce_motion: true }).catch(() => {});
        break;
      case "motion_on":
        updateSettings({ reduceMotion: false });
        api.put("/user/settings", { reduce_motion: false }).catch(() => {});
        break;
      case "read_page": {
        const main = document.getElementById("main-content");
        const text = main?.innerText || document.body.innerText;
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text.slice(0, 2000));
          utt.rate = 0.85;
          window.speechSynthesis.speak(utt);
        }
        break;
      }
      case "stop_read":
        window.speechSynthesis?.cancel();
        break;
      case "help":
        msg = "Available: increase/decrease font, high contrast, reduce motion, read aloud, stop reading";
        break;
      default:
        break;
    }
    // Announce via TTS
    if (window.speechSynthesis && cmd.action !== "read_page") {
      const utt = new SpeechSynthesisUtterance(msg);
      utt.rate = 1;
      window.speechSynthesis.speak(utt);
    }
    setFeedback(msg);
    setHistory((h) => [{ text: msg, time: new Date().toLocaleTimeString() }, ...h.slice(0, 4)]);
    setTimeout(() => setFeedback(null), 3000);
  };

  const processInput = (text) => {
    const cmd = matchCommand(text);
    if (cmd) {
      executeCommand(cmd);
    } else {
      setFeedback(`Command not recognized: "${text}"`);
      setTimeout(() => setFeedback(null), 2000);
    }
    setInput("");
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "en-IN";
    r.continuous = false;
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput(t);
      processInput(t);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-4 right-20 w-12 h-12 rounded-full border-2 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] flex items-center justify-center z-50 transition-all ${
          open ? "bg-[#118AB2] text-white" : "bg-white text-[#118AB2]"
        }`}
        aria-label="Accessibility Bot"
        title="Accessibility Bot - voice commands"
      >
        <Accessibility className="w-5 h-5" />
      </button>

      {/* Feedback toast */}
      {feedback && (
        <div className="fixed bottom-20 right-4 z-50 bg-[#0F172A] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-[#06D6A0]" />
          {feedback}
        </div>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 w-72 neura-card p-4 z-50 bg-white" role="dialog" aria-label="Accessibility Bot">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-[#118AB2]" />
              <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "Fredoka, sans-serif" }}>
                Accessibility Bot
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-[#EF476F]/10 text-[#64748B]">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick command buttons */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[
              { label: "🔤 Bigger Text", cmd: "increase font" },
              { label: "🌑 High Contrast", cmd: "high contrast" },
              { label: "🔇 Reduce Motion", cmd: "reduce motion" },
              { label: "🔊 Read Page", cmd: "read aloud" },
              { label: "⏹ Stop Reading", cmd: "stop reading" },
              { label: "🔤 Normal Text", cmd: "font medium" },
            ].map((b) => (
              <button
                key={b.cmd}
                onClick={() => processInput(b.cmd)}
                className="text-xs px-2 py-2 rounded-xl border-2 border-[#e2e8f0] hover:border-[#118AB2] hover:bg-[#118AB2]/5 font-semibold text-[#334155] text-left"
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Text input */}
          <div className="flex gap-2 mb-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && processInput(input)}
              placeholder='Type a command...'
              className="flex-1 text-xs border-2 border-[#e2e8f0] rounded-xl px-3 py-2 focus:outline-none focus:border-[#118AB2]"
            />
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-xl border-2 ${listening ? "border-[#EF476F] bg-[#EF476F]/10 text-[#EF476F] animate-pulse" : "border-[#e2e8f0] text-[#64748B]"}`}
              aria-label="Voice command"
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#64748B]">Recent</p>
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#334155]">
                  <Check className="w-3 h-3 text-[#06D6A0] shrink-0" />
                  <span>{h.text}</span>
                  <span className="ml-auto text-[#94a3b8]">{h.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
