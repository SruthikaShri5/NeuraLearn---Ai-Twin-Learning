import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { useMessageStore } from "@/lib/messageStore";
import { useAuth } from "@/lib/auth-context";

export default function MessageChat({ toUserId, toUserName, onClose }) {
  const { isJunior, textPrimary, textSecondary, textMuted, input } = useGradeTheme();
  const { user } = useAuth();
  const { currentMessages, fetchConversation, sendMessage } = useMessageStore();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!toUserId) return;
    setLoading(true);
    fetchConversation(toUserId).finally(() => setLoading(false));
  }, [toUserId, fetchConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await sendMessage(toUserId, trimmed);
      setText("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const overlayBg = isJunior ? "bg-black/40" : "bg-black/60 backdrop-blur-sm";
  const modalBg = isJunior
    ? "bg-white border-[3px] border-[#1A1A2E] rounded-2xl shadow-[8px_8px_0px_#1A1A2E]"
    : "bg-[#0D1117] border border-indigo-500/30 rounded-2xl shadow-2xl";

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 ${overlayBg}`} onClick={onClose}>
      <div
        className={`w-full sm:max-w-md h-[85vh] sm:h-[600px] flex flex-col ${modalBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          isJunior ? "border-gray-200 bg-[#118AB2] text-white rounded-t-2xl" : "border-indigo-500/20 bg-indigo-600/10 rounded-t-2xl"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
              isJunior ? "bg-white/20" : "bg-indigo-500/20 border border-indigo-500/30"
            }`}>
              {toUserName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className={`font-bold text-sm ${isJunior ? "text-white" : textPrimary}`}>{toUserName}</p>
              <p className={`text-xs ${isJunior ? "text-white/70" : textMuted}`}>
                {isJunior ? "Chat 💬" : "Direct Message"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isJunior ? "hover:bg-white/20" : "hover:bg-[#F3F4F6]"}`}>
            <X className={`w-5 h-5 ${isJunior ? "text-white" : textMuted}`} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className={`w-8 h-8 animate-spin ${isJunior ? "text-[#118AB2]" : "text-[#4F46E5]"}`} />
            </div>
          ) : currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <MessageCircle className={`w-12 h-12 ${isJunior ? "text-[#374151]" : "text-[#374151]"}`} />
              <p className={`text-sm ${textMuted}`}>
                {isJunior ? "No messages yet! Say hi! 👋" : "No messages yet. Start the conversation."}
              </p>
            </div>
          ) : (
            currentMessages.map((msg) => {
              const isOwn = msg.fromUserId === user?.id || msg.fromUserId === user?._id;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      isOwn
                        ? isJunior
                          ? "bg-[#118AB2] text-white rounded-br-sm"
                          : "bg-indigo-600 text-white rounded-br-sm"
                        : isJunior
                          ? "bg-gray-100 text-[#1A1A2E] rounded-bl-sm border-2 border-gray-200"
                          : "bg-[#F3F4F6] text-[#1A1A2E] rounded-bl-sm border border-[#E5E7EB]"
                    }`}>
                      {msg.message}
                    </div>
                    <span className={`text-xs ${textMuted}`}>{formatTime(msg.sentAt)}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={`p-3 border-t ${isJunior ? "border-gray-200" : "border-[#E5E7EB]"}`}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={isJunior ? "Type a message... 💬" : "Type a message..."}
              className={`flex-1 px-3 py-2.5 rounded-xl text-sm ${input} focus:outline-none focus:ring-2 ${
                isJunior ? "focus:ring-[#118AB2]" : "focus:ring-indigo-500"
              }`}
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-50 ${
                isJunior
                  ? "bg-[#118AB2] text-white border-2 border-[#1A1A2E]"
                  : "bg-indigo-600 text-white border border-indigo-500"
              }`}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
