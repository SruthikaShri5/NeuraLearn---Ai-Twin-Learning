import { useState } from "react";
import { Heart, MessageCircle, Calendar, CheckCircle, Clock, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useGradeTheme } from "@/lib/useGradeTheme";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    emoji: "⏳",
    colorJr: "bg-[#FFD166]/20 text-[#b8860b] border-[#FFD166]",
    colorSr: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  approved: {
    label: "Connected",
    emoji: "✅",
    colorJr: "bg-[#06D6A0]/20 text-[#065f46] border-[#06D6A0]",
    colorSr: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  rejected: {
    label: "Declined",
    emoji: "❌",
    colorJr: "bg-[#EF476F]/10 text-[#EF476F] border-[#EF476F]/30",
    colorSr: "bg-red-500/10 text-red-400 border-red-500/30",
  },
};

export default function ParentConnectionPanel({ connection, studentId, onConnect, onMessage }) {
  const { isJunior, textPrimary, textSecondary, textMuted, input } = useGradeTheme();
  const [loading, setLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [schedulingMeeting, setSchedulingMeeting] = useState(false);

  const handleConnect = async () => {
    if (!studentId) {
      toast.error("No student selected.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/ptm/connect", { studentId });
      toast.success(
        isJunior
          ? "Connection request sent! 💛"
          : "Connection request sent to teacher."
      );
      onConnect && onConnect(data.connection);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!meetingDate) {
      toast.error("Please select a date and time.");
      return;
    }
    if (!connection?.id) {
      toast.error("No active connection.");
      return;
    }
    setSchedulingMeeting(true);
    try {
      await api.post("/ptm/schedule-meeting", {
        connectionId: connection.id,
        scheduledAt: meetingDate,
        notes: meetingNotes,
      });
      toast.success(isJunior ? "Meeting scheduled! 📅" : "Meeting scheduled successfully.");
      setShowSchedule(false);
      setMeetingDate("");
      setMeetingNotes("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to schedule meeting.");
    } finally {
      setSchedulingMeeting(false);
    }
  };

  const statusCfg = connection ? STATUS_CONFIG[connection.status] || STATUS_CONFIG.pending : null;

  return (
    <div className={`rounded-2xl overflow-hidden mb-6 ${
      isJunior
        ? "border-[3px] border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]"
        : "border border-indigo-500/20"
    }`}>
      {/* Header */}
      <div className={`px-5 py-3 flex items-center gap-3 ${
        isJunior ? "bg-[#FFD166] border-b-2 border-[#1A1A2E]" : "bg-amber-500/10 border-b border-amber-500/20"
      }`}>
        <Heart className={`w-4 h-4 ${isJunior ? "text-[#0F172A]" : "text-amber-400"}`} />
        <span className={`font-bold text-sm ${isJunior ? "text-[#0F172A]" : "text-amber-400"}`}>
          {isJunior ? "Teacher Connection 💛" : "Parent-Teacher Connection"}
        </span>
        {statusCfg && (
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${
            isJunior ? statusCfg.colorJr : statusCfg.colorSr
          }`}>
            {statusCfg.emoji} {statusCfg.label}
          </span>
        )}
      </div>

      <div className={`p-5 bg-white`}>
        {!connection ? (
          /* No connection yet */
          <div className="text-center py-4">
            <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center ${
              isJunior ? "bg-[#FFD166]/20 border-2 border-[#FFD166]" : "bg-amber-500/10 border border-amber-500/30"
            }`}>
              <UserPlus className={`w-6 h-6 ${isJunior ? "text-[#b8860b]" : "text-amber-400"}`} />
            </div>
            <p className={`font-bold mb-1 ${textPrimary}`} style={isJunior ? { fontFamily: "Fredoka, sans-serif" } : {}}>
              {isJunior ? "Connect with your child's teacher! 👀" : "Connect with Teacher"}
            </p>
            <p className={`text-sm mb-4 ${textSecondary}`}>
              {isJunior
                ? "Request a connection to message the teacher and schedule meetings."
                : "Send a connection request to communicate with your child's teacher."}
            </p>
            <button
              onClick={handleConnect}
              disabled={loading || !studentId}
              className={`flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 ${
                isJunior
                  ? "bg-[#FFD166] text-[#0F172A] border-2 border-[#1A1A2E]"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
              {isJunior ? "Request Connection 💛" : "Request Connection"}
            </button>
          </div>
        ) : (
          /* Has connection */
          <div className="space-y-4">
            {/* Teacher info */}
            {connection.teacherName && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${
                isJunior ? "bg-[#f8fafc] border-2 border-[#e5e7eb]" : "bg-white/50 border border-[#E5E7EB]"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  isJunior ? "bg-[#FFD166]/30 border-2 border-[#FFD166]" : "bg-amber-500/10 border border-amber-500/30"
                }`}>
                  {connection.teacherName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className={`font-bold text-sm ${textPrimary}`}>{connection.teacherName}</p>
                  {connection.teacherEmail && (
                    <p className={`text-xs ${textMuted}`}>{connection.teacherEmail}</p>
                  )}
                </div>
                {connection.status === "approved" && (
                  <CheckCircle className={`w-5 h-5 ml-auto ${isJunior ? "text-[#06D6A0]" : "text-emerald-400"}`} />
                )}
              </div>
            )}

            {/* Student info */}
            {connection.studentName && (
              <p className={`text-sm ${textSecondary}`}>
                {isJunior ? "👨‍🎓 Student:" : "Student:"} <span className="font-semibold">{connection.studentName}</span>
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {connection.status === "approved" && (
                <>
                  <button
                    onClick={() => onMessage && onMessage(connection.teacherId, connection.teacherName)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                      isJunior
                        ? "bg-[#06D6A0]/10 text-[#065f46] border-2 border-[#06D6A0]/40 hover:bg-[#06D6A0]/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {isJunior ? "Message Teacher 💬" : "Message Teacher"}
                  </button>
                  <button
                    onClick={() => setShowSchedule((v) => !v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                      isJunior
                        ? "bg-[#C8B6FF]/20 text-[#5b21b6] border-2 border-[#C8B6FF]/40 hover:bg-[#C8B6FF]/30"
                        : "bg-violet-500/10 text-violet-400 border border-violet-500/30 hover:bg-violet-500/20"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    {isJunior ? "Schedule Meeting 📅" : "Schedule PTM"}
                  </button>
                </>
              )}
              {connection.status === "pending" && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
                  isJunior ? "bg-[#FFD166]/10 text-[#b8860b]" : "bg-amber-500/10 text-amber-400"
                }`}>
                  <Clock className="w-4 h-4" />
                  {isJunior ? "Waiting for teacher approval..." : "Awaiting teacher approval"}
                </div>
              )}
            </div>

            {/* Schedule meeting form */}
            {showSchedule && connection.status === "approved" && (
              <div className={`p-4 rounded-xl space-y-3 ${
                isJunior ? "bg-[#f8fafc] border-2 border-[#e5e7eb]" : "bg-white/50 border border-[#E5E7EB]"
              }`}>
                <p className={`text-sm font-bold ${textPrimary}`}>
                  {isJunior ? "📅 Schedule a Meeting" : "Schedule PTM Meeting"}
                </p>
                <input
                  type="datetime-local"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm ${input} focus:outline-none`}
                />
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder={isJunior ? "Any notes for the teacher? (optional)" : "Notes (optional)"}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-xl text-sm resize-none ${input} focus:outline-none`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleScheduleMeeting}
                    disabled={schedulingMeeting || !meetingDate}
                    className={`flex-1 h-10 flex items-center justify-center gap-2 font-bold rounded-xl text-sm disabled:opacity-50 ${
                      isJunior
                        ? "bg-[#C8B6FF] text-[#0F172A] border-2 border-[#1A1A2E]"
                        : "bg-violet-600 text-white border border-violet-500"
                    }`}
                  >
                    {schedulingMeeting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                    {isJunior ? "Schedule!" : "Schedule"}
                  </button>
                  <button
                    onClick={() => setShowSchedule(false)}
                    className={`px-4 h-10 rounded-xl text-sm font-bold ${
                      isJunior ? "bg-gray-100 text-[#374151]" : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Meetings list */}
            {connection.meetings?.length > 0 && (
              <div>
                <p className={`text-xs font-bold mb-2 ${textMuted}`}>
                  {isJunior ? "📅 Scheduled Meetings:" : "Upcoming Meetings:"}
                </p>
                {connection.meetings.slice(-3).map((m, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${
                    isJunior ? "bg-[#C8B6FF]/10" : "bg-violet-500/5"
                  }`}>
                    <Calendar className={`w-3.5 h-3.5 ${isJunior ? "text-[#5b21b6]" : "text-violet-400"}`} />
                    <span className={`text-xs ${textSecondary}`}>
                      {new Date(m.scheduledAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    {m.notes && <span className={`text-xs ${textMuted} truncate`}>. {m.notes}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
