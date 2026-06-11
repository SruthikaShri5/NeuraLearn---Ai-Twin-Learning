import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { useAppStore } from "@/lib/store";
import { X, Send, Bot, Sparkles, Volume2, Trash2 } from "lucide-react";
import { speak } from "@/lib/tts";

const QUICK_PROMPTS = {
  visual:    ["Explain this to me", "Give me an example", "What's the key idea?", "Read the summary"],
  dyslexia:  ["Short explanation please", "Give me bullet points", "Key words only", "One step at a time"],
  hearing:   ["Show me visually", "Text explanation", "Key concepts list", "Step by step"],
  cognitive: ["Explain simply", "One idea at a time", "Give me a hint", "Check my understanding"],
  motor:     ["1) Explain  2) Example  3) Hint", "Summarise", "Next step", "Am I right?"],
  speech:    ["Explain this", "Show example", "Give hint", "Is this correct?"],
  junior:    ["Explain this simply 🧠", "Give me a hint 💡", "Show an example ✏️", "Why is this important? 🌟"],
  senior:    ["Explain the concept", "Give a worked example", "What are common mistakes?", "Connect this to real life"],
};

async function callBackend({ message, history, lessonContext, disability, grade, emotionState }) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api/ai/tutor`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({
        message,
        lesson_context: lessonContext || "",
        disability_type: disability,
        grade_level: grade,
        emotion_state: emotionState,
        history: history.slice(-6).map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          content: m.text,
        })),
      }),
    }
  );
  if (!res.ok) throw new Error("Backend error");
  const data = await res.json();
  if (data.reply) return data.reply;
  throw new Error("No reply");
}

function getRuleBasedReply(message, isJunior, disability) {
  const msg = message.toLowerCase();
  const p = isJunior ? "😊 " : "";

  if (msg.includes("hint") || msg.includes("help") || msg.includes("stuck")) {
    if (disability === "cognitive")
      return "Let's go step by step. What is the first thing the question is asking? Tell me in one sentence.";
    return isJunior
      ? `${p}Let's break it down! What do you already know about this topic? 💡`
      : `${p}Identify what information you have, then determine which concept applies.`;
  }
  if (msg.includes("example") || msg.includes("show")) {
    return isJunior
      ? `${p}Think of it like this: if you had 5 apples and got 3 more, you'd have 8. Try the same idea with your numbers! 🍎`
      : `${p}Apply the concept to the simplest case first. Start with concrete numbers before generalising.`;
  }
  if (msg.includes("why") || msg.includes("important")) {
    return isJunior
      ? `${p}This topic helps you understand the world! Scientists and engineers use it every day! 🌍`
      : `${p}This concept underpins more advanced topics and has direct real-world applications.`;
  }
  if (disability === "hearing") {
    const msg = message.toLowerCase();
    if (msg.includes("show") || msg.includes("visual") || msg.includes("visually"))
      return `📊 Visual Breakdown\n\n• Core idea: Every concept has a main rule or definition\n• How it works: Apply the rule step by step\n• Remember: Draw a diagram or table to organise your thinking\n\n✅ Tip: Look for keywords in the question — they tell you which concept to use.`;
    if (msg.includes("step"))
      return `🔢 Step-by-Step Guide\n\nStep 1 → Read the question carefully\nStep 2 → Identify the key concept\nStep 3 → Write down what you know\nStep 4 → Apply the formula or rule\nStep 5 → Check your answer\n\n✅ Take it one step at a time!`;
    if (msg.includes("key") || msg.includes("concept"))
      return `🗝️ Key Concepts\n\n• Definition — What the topic means\n• Formula/Rule — The main method to use\n• Example — A worked solution\n• Common mistakes — What to avoid\n\n📌 Always start by memorising the definition.`;
    if (msg.includes("hint") || msg.includes("help") || msg.includes("stuck"))
      return `💡 Hint\n\n• Re-read the question slowly\n• Underline the key words\n• Match those words to a concept you've studied\n• Write out what you know\n\n🔎 Still stuck? Ask me to explain a specific part.`;
    if (msg.includes("example"))
      return `📝 Example Walkthrough\n\n• Read the problem → Identify given values\n• Choose the right formula\n• Substitute values step by step\n• Write the final answer with units\n\n✅ Practice the same type 3 times to remember it.`;
    return `📖 Text Explanation\n\n• Start by identifying: What is the question asking?\n• Then: Which concept from the lesson applies?\n• Finally: Apply it step by step\n\n💬 Type your specific question and I'll give a detailed visual explanation.`;
  }
  if (disability === "visual")
    return `${p}Good question. Re-read the key concept from the lesson, then try to explain it in your own words. Would you like me to give you a verbal walkthrough?`;
  return isJunior
    ? `${p}That's a great question! Re-read the lesson and try the examples. You're closer than you think! 💪`
    : `${p}Review the core definitions in the lesson. Break the problem into smaller parts and tackle each one.`;
}

function getWelcomeMessage(user, disability, isJunior) {
  const name = user?.name?.split(" ")[0] || "there";
  if (disability === "hearing")
    return `👋 Hello ${name}! I'm Neura, your visual AI tutor.\n\n📌 I'll always respond with:\n• Clear headings\n• Bullet points\n• Step-by-step breakdowns\n• No audio required\n\nWhat topic would you like to explore today?`;
  if (disability === "visual")
    return `Hello ${name}. I'm Neura, your AI tutor. I will guide you through everything. What would you like to do?\n\n1) Continue lesson\n2) Explain a concept\n3) Start quiz\n4) Ask a question`;
  if (disability === "cognitive")
    return `Hi ${name}! 😊 I'm Neura. I'll explain things one small step at a time. What are we learning today?`;
  if (disability === "motor")
    return `Hello ${name}. I'm Neura. Type a number to respond:\n1) Explain lesson\n2) Give example\n3) Start quiz\n4) Ask question`;
  if (disability === "speech")
    return `Hello ${name}. I'm Neura — text only, no speaking needed. What would you like help with?`;
  if (isJunior)
    return `Hi ${name}! 👋 I'm Neura, your AI tutor! Ask me anything about what you're learning!`;
  return `Hello ${name}. I'm your AI tutor powered by Groq. What would you like to explore today?`;
}

export default function AITutor({ onClose, lessonContext = "" }) {
  const { user } = useAuth();
  const { isJunior } = useGradeTheme();
  const { emotionState } = useAppStore();
  const isTTSActive = user?.learning_profile?.tts_active || user?.disability_type === "visual";
  const grade = user?.grade_level || "class_5";
  const disability = user?.disability_type || "prefer_not_to_say";

  const welcomeMsg = getWelcomeMessage(user, disability, isJunior);

  const [messages, setMessages] = useState([{ role: "assistant", text: welcomeMsg }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    inputRef.current?.focus();
    // Auto-speak welcome for visual users
    if (isTTSActive) speak(welcomeMsg);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    setInput("");
    const userMsg = { role: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const reply = await callBackend({
        message: trimmed,
        history: messages,
        lessonContext,
        disability,
        grade,
        emotionState,
      });
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
      if (isTTSActive) speak(reply);
    } catch {
      const fallback = getRuleBasedReply(trimmed, isJunior, disability);
      setMessages((m) => [...m, { role: "assistant", text: fallback }]);
      if (isTTSActive) speak(fallback);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () =>
    setMessages([{ role: "assistant", text: isJunior ? "Chat cleared! Ask me anything 😊" : "Conversation cleared. How can I help?" }]);

  // Pick quick prompts based on disability
  const quickPrompts =
    QUICK_PROMPTS[disability] ||
    (isJunior ? QUICK_PROMPTS.junior : QUICK_PROMPTS.senior);

  return (
    <div
      className="fixed bottom-4 right-4 w-80 sm:w-96 flex flex-col z-50 neura-card overflow-hidden bg-white"
      style={{ height: "520px" }}
      role="dialog"
      aria-label="AI Tutor"
      data-testid="ai-tutor"
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 shrink-0 ${isJunior ? "bg-[#118AB2]" : "bg-indigo-600"} text-white`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={isJunior ? { fontFamily: "Fredoka, sans-serif" } : {}}>
              {isJunior ? "Neura AI Tutor 🤖" : "AI Tutor"}
            </p>
            <p className="text-xs text-white/80">
              {disability !== "prefer_not_to_say" ? `${disability} mode` : isJunior ? "Ask me anything!" : "Groq llama-3.1"}
            </p>
          </div>
          {/* Emotion indicator */}
          {emotionState && emotionState !== "neutral" && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              {{ happy: "😊", focused: "🎯", tired: "😴", confused: "🤔", frustrated: "😤", excited: "🚀", bored: "😑" }[emotionState] || ""} {emotionState}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-white/20" aria-label="Clear chat">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20" aria-label="Close tutor" data-testid="tutor-close-btn">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto shrink-0 border-b border-[#e2e8f0]">
        {quickPrompts.map((p) => (
          <button key={p} onClick={() => sendMessage(p)}
            className={`whitespace-nowrap text-xs font-bold px-2.5 py-1.5 rounded-full border-2 shrink-0 transition-all ${
              isJunior
                ? "border-[#118AB2]/40 text-[#118AB2] hover:bg-[#118AB2]/10"
                : "border-indigo-500/40 text-indigo-700 hover:bg-indigo-500/10"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-[#118AB2]/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Sparkles className="w-3 h-3 text-[#118AB2]" />
              </div>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? isJunior ? "bg-[#118AB2] text-white rounded-br-sm" : "bg-indigo-600 text-white rounded-br-sm"
                : "bg-[#f1f5f9] text-[#0F172A] rounded-bl-sm border border-[#e2e8f0]"
            }`}>
              <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
              {msg.role === "assistant" && (
                <button onClick={() => speak(msg.text)} className="ml-2 opacity-40 hover:opacity-80 inline-flex align-middle" aria-label="Read aloud">
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
            <div className="bg-[#f1f5f9] border border-[#e2e8f0] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#118AB2] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#118AB2] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#118AB2] animate-bounce" style={{ animationDelay: "300ms" }} />
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
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={disability === "visual" ? "Type or say a number (1-4)..." : isJunior ? "Ask Neura anything... 💬" : "Ask a question..."}
            className={`flex-1 px-3 py-2.5 rounded-xl text-sm border-2 focus:outline-none text-[#0F172A] ${
              isJunior ? "border-[#e2e8f0] focus:border-[#118AB2]" : "border-[#e2e8f0] focus:border-indigo-500"
            }`}
            disabled={loading}
            aria-label="Message to AI tutor"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-40 ${
              isJunior ? "bg-[#118AB2] text-white border-2 border-[#0F172A]" : "bg-indigo-600 text-white"
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
