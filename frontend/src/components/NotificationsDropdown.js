import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, Loader2 } from "lucide-react";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { useNotificationStore } from "@/lib/notificationStore";

const TYPE_ICONS = {
  assignment: "📋",
  grade: "⭐",
  message: "💬",
  announcement: "",
  reminder: "⏰",
  alert: "🚨",
  ptm_request: "🤝",
  ptm_response: "✅",
  meeting_scheduled: "📅",
};

export default function NotificationsDropdown() {
  const { isJunior, textPrimary, textSecondary, textMuted } = useGradeTheme();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
    // Poll every 30s
    const interval = setInterval(() => fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = Math.floor((now - d) / 1000);
      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-xl transition-colors ${
          isJunior ? "hover:bg-gray-100 text-[#374151]" : "hover:bg-indigo-500/10 text-[#6B7280] hover:text-[#4F46E5]"
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold rounded-full px-1 ${
            isJunior ? "bg-[#EF476F] text-white border-2 border-white" : "bg-red-500 text-white"
          }`}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl overflow-hidden shadow-2xl ${
          isJunior
            ? "bg-white border-[3px] border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]"
            : "bg-[#0D1117] border border-indigo-500/20"
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isJunior ? "border-gray-200 bg-[#f8fafc]" : "border-[#E5E7EB] bg-[#0A0F1E]"
          }`}>
            <div className="flex items-center gap-2">
              <Bell className={`w-4 h-4 ${isJunior ? "text-[#374151]" : "text-[#6B7280]"}`} />
              <span className={`font-bold text-sm ${textPrimary}`}>
                {isJunior ? "Notifications 🔔" : "Notifications"}
              </span>
              {unreadCount > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  isJunior ? "bg-[#EF476F] text-white" : "bg-red-500/20 text-red-400"
                }`}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className={`p-1.5 rounded-lg text-xs ${isJunior ? "hover:bg-gray-100 text-[#6B7280]" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className={`p-1.5 rounded-lg ${isJunior ? "hover:bg-gray-100 text-[#6B7280]" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className={`w-6 h-6 animate-spin ${isJunior ? "text-[#118AB2]" : "text-[#4F46E5]"}`} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className={`w-8 h-8 mx-auto mb-2 ${isJunior ? "text-[#374151]" : "text-[#374151]"}`} />
                <p className={`text-sm ${textMuted}`}>
                  {isJunior ? "No notifications yet! 🎉" : "No notifications."}
                </p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b last:border-b-0 ${
                    !notif.read
                      ? isJunior
                        ? "bg-[#118AB2]/5 border-[#e5e7eb]"
                        : "bg-indigo-500/5 border-[#E5E7EB]"
                      : isJunior
                        ? "hover:bg-gray-50 border-[#e5e7eb]"
                        : "hover:bg-white/50 border-[#E5E7EB]"
                  }`}
                >
                  <span className="text-lg shrink-0 mt-0.5">
                    {TYPE_ICONS[notif.type] || "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${textPrimary}`}>{notif.title}</p>
                      {!notif.read && (
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${isJunior ? "bg-[#118AB2]" : "bg-indigo-400"}`} />
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 line-clamp-2 ${textSecondary}`}>{notif.message}</p>
                    <p className={`text-xs mt-1 ${textMuted}`}>{formatTime(notif.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
