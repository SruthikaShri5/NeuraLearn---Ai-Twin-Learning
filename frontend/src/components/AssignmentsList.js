import { useState } from "react";
import { Link } from "react-router-dom";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { useAssignmentStore } from "@/lib/assignmentStore";
import { ClipboardList, Clock, CheckCircle, Star, ChevronRight, AlertCircle, BookOpen } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Due",
    labelJr: "To Do 📋",
    bgJr: "bg-[#FFD166]/20 border-[#FFD166]",
    bgSr: "bg-amber-500/10 border-amber-500/30",
    textJr: "text-[#b8860b]",
    textSr: "text-amber-500",
    icon: Clock,
  },
  submitted: {
    label: "Submitted",
    labelJr: "Done! ✅",
    bgJr: "bg-[#118AB2]/10 border-[#118AB2]/30",
    bgSr: "bg-indigo-500/10 border-indigo-500/30",
    textJr: "text-[#118AB2]",
    textSr: "text-indigo-500",
    icon: CheckCircle,
  },
  graded: {
    label: "Graded",
    labelJr: "Graded ⭐",
    bgJr: "bg-[#06D6A0]/10 border-[#06D6A0]/30",
    bgSr: "bg-emerald-500/10 border-emerald-500/30",
    textJr: "text-[#065f46]",
    textSr: "text-emerald-500",
    icon: Star,
  },
};

function formatDue(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((d - now) / 86400000);
    if (diff < 0) return { label: "Overdue", urgent: true };
    if (diff === 0) return { label: "Due today", urgent: true };
    if (diff === 1) return { label: "Due tomorrow", urgent: false };
    return { label: `Due in ${diff} days`, urgent: false };
  } catch {
    return null;
  }
}

function AssignmentCard({ assignment, isJunior }) {
  const status = assignment.submission
    ? assignment.submission.grade !== undefined
      ? "graded"
      : "submitted"
    : "pending";

  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;
  const due = formatDue(assignment.dueDate);

  return (
    <div
      className={`rounded-xl p-4 border-2 flex items-start gap-3 transition-all ${
        isJunior
          ? `${cfg.bgJr} hover:shadow-[2px_2px_0px_#1A1A2E]`
          : `${cfg.bgSr} hover:shadow-sm`
      }`}
      data-testid={`assignment-card-${assignment.id}`}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isJunior ? "bg-white border-2 border-[#e2e8f0]" : "bg-white border border-[#E5E7EB]"
        }`}
      >
        <StatusIcon
          className={`w-4 h-4 ${isJunior ? cfg.textJr : cfg.textSr}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`font-bold text-sm truncate ${
              isJunior ? "text-[#0F172A]" : "text-[#1A1A2E]"
            }`}
            style={isJunior ? { fontFamily: "Fredoka, sans-serif" } : {}}
          >
            {assignment.title}
          </p>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
              isJunior ? cfg.textJr : cfg.textSr
            }`}
          >
            {isJunior ? cfg.labelJr : cfg.label}
          </span>
        </div>

        {assignment.description && (
          <p
            className={`text-xs mt-0.5 line-clamp-1 ${
              isJunior ? "text-[#374151]" : "text-[#6B7280]"
            }`}
          >
            {assignment.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {due && (
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${
                due.urgent
                  ? "text-[#EF476F]"
                  : isJunior
                  ? "text-[#6B7280]"
                  : "text-[#6B7280]"
              }`}
            >
              {due.urgent && <AlertCircle className="w-3 h-3" />}
              <Clock className="w-3 h-3" />
              {due.label}
            </span>
          )}

          {(assignment.totalPoints || assignment.maxScore) && (
            <span
              className={`text-xs font-semibold ${
                isJunior ? "text-[#6B7280]" : "text-[#6B7280]"
              }`}
            >
              {assignment.submission?.score !== undefined
                ? `${assignment.submission.score}/${assignment.totalPoints || assignment.maxScore} pts`
                : `${assignment.totalPoints || assignment.maxScore} pts`}
            </span>
          )}

          {assignment.lessonId && (
            <Link
              to={`/lesson/${assignment.lessonId}`}
              className={`flex items-center gap-1 text-xs font-bold ${
                isJunior
                  ? "text-[#118AB2] hover:underline"
                  : "text-indigo-600 hover:underline"
              }`}
            >
              <BookOpen className="w-3 h-3" />
              {isJunior ? "Open Lesson" : "View Lesson"}
            </Link>
          )}
        </div>
      </div>

      <ChevronRight
        className={`w-4 h-4 shrink-0 mt-1 ${
          isJunior ? "text-[#94a3b8]" : "text-[#94a3b8]"
        }`}
      />
    </div>
  );
}

/**
 * AssignmentsList
 * Displays student assignments grouped by status.
 * Reads from useAssignmentStore.
 */
export default function AssignmentsList() {
  const { assignments } = useAssignmentStore();
  const { isJunior, headingFont, textPrimary, textMuted } = useGradeTheme();
  const [tab, setTab] = useState("pending");

  const tabs = [
    { id: "pending",   label: isJunior ? "To Do 📋" : "Pending",   count: assignments.pending?.length || 0 },
    { id: "submitted", label: isJunior ? "Done ✅"  : "Submitted",  count: assignments.submitted?.length || 0 },
    { id: "graded",    label: isJunior ? "Graded ⭐" : "Graded",    count: assignments.graded?.length || 0 },
  ];

  const current = assignments[tab] || [];

  // Nothing at all
  if (!assignments.all?.length && !assignments.pending?.length) {
    return null; // Don't render section if no assignments
  }

  return (
    <div className="mb-6" data-testid="assignments-list">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList
          className={`w-5 h-5 ${isJunior ? "text-[#118AB2]" : "text-indigo-600"}`}
        />
        <h2
          className={`font-bold ${isJunior ? "text-lg text-[#1A1A2E]" : "text-base text-[#1A1A2E]"}`}
          style={headingFont}
        >
          {isJunior ? "My Assignments 📚" : "Assignments"}
        </h2>
      </div>

      {/* Tabs */}
      <div
        className={`flex gap-1 mb-3 p-1 rounded-xl ${
          isJunior ? "bg-[#f1f5f9] border-2 border-[#e2e8f0]" : "bg-[#f1f5f9]"
        }`}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
              tab === t.id
                ? isJunior
                  ? "bg-[#118AB2] text-white shadow-[2px_2px_0px_#0F172A]"
                  : "bg-indigo-600 text-white shadow-sm"
                : isJunior
                ? "text-[#64748B] hover:text-[#0F172A]"
                : "text-[#6B7280] hover:text-[#1A1A2E]"
            }`}
            data-testid={`assignment-tab-${t.id}`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  tab === t.id
                    ? "bg-white/30 text-white"
                    : isJunior
                    ? "bg-[#e2e8f0] text-[#374151]"
                    : "bg-[#E5E7EB] text-[#374151]"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {current.length === 0 ? (
        <div
          className={`p-6 rounded-xl text-center ${
            isJunior
              ? "bg-[#f8fafc] border-2 border-dashed border-[#e2e8f0]"
              : "bg-[#f8fafc] border border-dashed border-[#E5E7EB]"
          }`}
        >
          <ClipboardList
            className={`w-8 h-8 mx-auto mb-2 ${isJunior ? "text-[#94a3b8]" : "text-[#94a3b8]"}`}
          />
          <p className={`text-sm font-semibold ${textMuted}`}>
            {tab === "pending"
              ? isJunior
                ? "No assignments due! 🎉"
                : "No pending assignments."
              : tab === "submitted"
              ? isJunior
                ? "Nothing submitted yet."
                : "No submitted assignments."
              : isJunior
              ? "No graded work yet."
              : "No graded assignments."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {current.map((a) => (
            <AssignmentCard key={a.id} assignment={a} isJunior={isJunior} />
          ))}
        </div>
      )}
    </div>
  );
}
