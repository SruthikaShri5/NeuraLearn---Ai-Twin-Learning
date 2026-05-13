import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { useAppStore } from "@/lib/store";
import api from "@/lib/api";
import { X, Send, Bot, Loader2, Sparkles, Volume2, Trash2 } from "lucide-react";

const MASCOT_URL =
  "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/0d5a58ad11917c107d19197bb800270b2ab4affe5ac9d9ef444167284e0b11be.png";

const QUICK_PROMPTS_JR = [
  "Explain this simply 🧠",
  "Give me a hint 💡",
  "Show an example ✏️",
  "Why is this important? 🌟",
];

const QUICK_PROMPTS_SR = [
  "Explain the concept",
  "Give a worked example",
  "What are common mistakes?",
  "Connect this to real life",
];

import { speak } from "@/lib/tts";

export default function AITutor({ onClose, lessonContext = "" }) {
  const { user } = useAuth();
  const { isJunior, isSenior } = useGradeTheme();
  const { emotionState } = useAppStore();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: isJunior
        ? `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm Neura, your AI tutor! Ask me anything about what you're learning!`
        : `Hello ${user?.name?.split(" ")[0] || ""}. I'm your AI tutor. Ask me anything about the current topic or any concept you'd like to explore.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setInput("");

    const userMsg = { role: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post("/ai/tutor", {
        message: trimmed,
        lesson_context: lessonContext,
        emotion_state: emotionState,
        grade_level: user?.grade_level || "class_5",
        disability_type: user?.disability_type || "prefer_not_to_say",
        history: messages.slice(-6).map((m) => ({ role: m.role, content: m.text })),
      });
      const reply = data.reply || data.message || "I'm here to help! Could you rephrase that?";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      // Fallback: smart offline response
      const fallback = generateFallback(trimmed, isJunior);
      setMessages((m) => [...m, { role: "assistant", text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: isJunior
          ? "Chat cleared! Ask me anything 😊"
          : "Conversation cleared. How can I help?",
      },
    ]);
  };

  const quickPrompts = isJunior ? QUICK_PROMPTS_JR : QUICK_PROMPTS_SR;

  return (
    <div
      className={`fixed bottom-4 right-4 w-80 sm:w-96 flex flex-col z-50 neura-card overflow-hidden ${
        isJunior ? "bg-white" : "bg-white"
      }`}
      style={{ height: "520px" }}
      role="dialog"
      aria-label="AI Tutor"
      data-testid="ai-tutor"
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 shrink-0 ${
          isJunior
            ? "bg-[#118AB2] text-white"
            : "bg-indigo-600 text-white"
        }`}
      >
        <div className="flex items-center gap-2">
          {isJunior ? (
            <img src={MASCOT_URL} alt="" className="w-8 h-8 object-contain" aria-hidden="true" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <p className="font-bold text-sm" style={isJunior ? { fontFamily: "Fredoka, sans-serif" } : {}}>
              {isJunior ? "Neura AI Tutor 🤖" : "AI Tutor"}
            </p>
            <p className="text-xs text-white/70">
              {isJunior ? "Ask me anything!" : "Powered by Gemini"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white"
            aria-label="Close tutor"
            data-testid="tutor-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto shrink-0 border-b border-[#e2e8f0]">
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className={`whitespace-nowrap text-xs font-bold px-2.5 py-1.5 rounded-full border-2 transition-all shrink-0 ${
              isJunior
                ? "border-[#118AB2]/30 text-[#118AB2] hover:bg-[#118AB2]/10"
                : "border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-[#118AB2]/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Sparkles className="w-3 h-3 text-[#118AB2]" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? isJunior
                    ? "bg-[#118AB2] text-white rounded-br-sm"
                    : "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-[#f1f5f9] text-[#0F172A] rounded-bl-sm border border-[#e2e8f0]"
              }`}
            >
              {msg.text}
              {msg.role === "assistant" && (
                <button
                  onClick={() => speak(msg.text)}
                  className="ml-2 opacity-40 hover:opacity-80 inline-flex"
                  aria-label="Read aloud"
                  title="Read aloud"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-[#118AB2]/10 flex items-center justify-center shrink-0 mr-2 mt-1">
              <Sparkles className="w-3 h-3 text-[#118AB2]" />
            </div>
            <div className="bg-[#f1f5f9] border border-[#e2e8f0] px-4 py-3 rounded-2xl rounded-bl-sm">
              <Loader2 className="w-4 h-4 animate-spin text-[#118AB2]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[#e2e8f0] shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isJunior ? "Ask Neura anything... 💬" : "Ask a question..."}
            className={`flex-1 px-3 py-2.5 rounded-xl text-sm border-2 focus:outline-none ${
              isJunior
                ? "border-[#e2e8f0] focus:border-[#118AB2] text-[#0F172A]"
                : "border-[#e2e8f0] focus:border-indigo-500 text-[#0F172A]"
            }`}
            disabled={loading}
            aria-label="Message to AI tutor"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-40 ${
              isJunior
                ? "bg-[#118AB2] text-white border-2 border-[#0F172A]"
                : "bg-indigo-600 text-white"
            }`}
            aria-label="Send message"
            data-testid="tutor-send-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Offline fallback responses
function generateFallback(question, isJunior) {
  const q = question.toLowerCase();
  if (q.includes("hint") || q.includes("help")) {
    return isJunior
      ? "Here's a hint: try breaking the problem into smaller steps! 💡"
      : "Try breaking the problem into smaller components and solve each part independently.";
  }
  if (q.includes("example")) {
    return isJunior
      ? "Let me think of an example... Try applying the concept to something you see every day! 🌍"
      : "Apply the concept to a concrete real-world scenario to build intuition.";
  }
  if (q.includes("why") || q.includes("important")) {
    return isJunior
      ? "Great question! This topic helps you understand the world around you! 🌟"
      : "This concept forms a foundational building block for more advanced topics in this domain.";
  }
  return isJunior
    ? "That's a great question! Let me think... Try re-reading the lesson and look for key words! 🧠"
    : "Review the core definitions in the lesson. The answer often lies in understanding the fundamentals.";
}
