import { useState } from "react";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { useNotificationStore } from "@/lib/notificationStore";
import { Megaphone, Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const MESSAGE_TYPES = [
  { value: "announcement", label: "📢 Announcement" },
  { value: "reminder",     label: "⏰ Reminder" },
  { value: "alert",        label: "🚨 Alert" },
  { value: "assignment",   label: "📋 Assignment" },
];

/**
 * BroadcastMessage
 * Lets teachers send a broadcast notification to all students in a class.
 *
 * Props:
 *   classId  - string (required)
 *   onSent   - () => void (optional callback)
 */
export default function BroadcastMessage({ classId, onSent }) {
  const { isJunior, headingFont, textPrimary, textSecondary, textMuted } = useGradeTheme();
  const { broadcastMessage } = useNotificationStore();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message.");
      return;
    }
    if (!classId) {
      toast.error("No class selected.");
      return;
    }

    setSending(true);
    try {
      await broadcastMessage(classId, title.trim(), message.trim(), type);
      setSent(true);
      setTitle("");
      setMessage("");
      setType("announcement");
      toast.success(
        isJunior
          ? "Message sent to all students! 📢"
          : "Broadcast sent successfully."
      );
      onSent && onSent();
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send broadcast.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden ${
        isJunior
          ? "border-[3px] border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]"
          : "border border-[#E5E7EB]"
      }`}
      data-testid="broadcast-message"
    >
      {/* Header */}
      <div
        className={`px-5 py-3 flex items-center gap-3 ${
          isJunior
            ? "bg-[#EF476F] border-b-2 border-[#1A1A2E]"
            : "bg-red-500/10 border-b border-red-500/20"
        }`}
      >
        <Megaphone
          className={`w-4 h-4 ${isJunior ? "text-white" : "text-red-500"}`}
        />
        <span
          className={`font-bold text-sm ${isJunior ? "text-white" : "text-red-500"}`}
          style={isJunior ? { fontFamily: "Fredoka, sans-serif" } : {}}
        >
          {isJunior ? "Broadcast to Class 📢" : "Broadcast Message"}
        </span>
      </div>

      {/* Body */}
      <div className={`p-5 space-y-4 ${isJunior ? "bg-white" : "bg-[#FAFAFA]"}`}>
        {sent ? (
          <div
            className={`flex flex-col items-center py-6 gap-3 ${
              isJunior ? "text-[#06D6A0]" : "text-emerald-500"
            }`}
          >
            <CheckCircle className="w-10 h-10" />
            <p className="font-bold text-base" style={headingFont}>
              {isJunior ? "Message sent! 🎉" : "Broadcast delivered"}
            </p>
          </div>
        ) : (
          <>
            {/* Type selector */}
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${textMuted}`}
              >
                {isJunior ? "Message Type" : "Type"}
              </label>
              <div className="flex flex-wrap gap-2">
                {MESSAGE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${
                      type === t.value
                        ? isJunior
                          ? "border-[#EF476F] bg-[#EF476F]/10 text-[#EF476F]"
                          : "border-red-500 bg-red-500/10 text-red-500"
                        : isJunior
                        ? "border-[#e2e8f0] text-[#374151] hover:border-[#0F172A]"
                        : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${textMuted}`}
              >
                {isJunior ? "Title 📝" : "Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isJunior
                    ? "e.g. Homework reminder!"
                    : "e.g. Assignment due tomorrow"
                }
                maxLength={100}
                className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 ${
                  isJunior
                    ? "border-2 border-[#e2e8f0] focus:border-[#EF476F] focus:ring-[#EF476F]/20 text-[#0F172A]"
                    : "border border-[#D1D5DB] focus:border-red-500 focus:ring-red-500/20 text-[#1A1A2E]"
                }`}
              />
            </div>

            {/* Message */}
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${textMuted}`}
              >
                {isJunior ? "Message 💬" : "Message"}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isJunior
                    ? "Type your message to all students..."
                    : "Message content..."
                }
                rows={3}
                maxLength={500}
                className={`w-full px-3 py-2.5 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 ${
                  isJunior
                    ? "border-2 border-[#e2e8f0] focus:border-[#EF476F] focus:ring-[#EF476F]/20 text-[#0F172A]"
                    : "border border-[#D1D5DB] focus:border-red-500 focus:ring-red-500/20 text-[#1A1A2E]"
                }`}
              />
              <p className={`text-xs mt-1 text-right ${textMuted}`}>
                {message.length}/500
              </p>
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              className={`w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl transition-all disabled:opacity-50 ${
                isJunior
                  ? "bg-[#EF476F] text-white border-2 border-[#1A1A2E] hover:shadow-[3px_3px_0px_#1A1A2E]"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              data-testid="broadcast-send-btn"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isJunior ? "Send to All Students 🚀" : "Send Broadcast"}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
