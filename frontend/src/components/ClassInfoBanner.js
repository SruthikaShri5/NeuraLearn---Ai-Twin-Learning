import { useGradeTheme } from "@/lib/useGradeTheme";
import { GraduationCap, Users, MessageCircle, LogOut, Plus, BookOpen } from "lucide-react";

/**
 * ClassInfoBanner
 * Shows enrolled class info for students on the dashboard.
 * If not enrolled, shows a "Join a Class" prompt.
 *
 * Props:
 *   enrolledClass  - class object or null
 *   teacher        - teacher object or null
 *   onJoinClick    - () => void
 *   onLeave        - () => void
 *   onMessageTeacher - (id, name) => void
 *   onViewClassmates - () => void
 */
export default function ClassInfoBanner({
  enrolledClass,
  teacher,
  onJoinClick,
  onLeave,
  onMessageTeacher,
  onViewClassmates,
}) {
  const { isJunior, isSenior, headingFont, textPrimary, textSecondary, textMuted } = useGradeTheme();

  // Not enrolled — show join prompt
  if (!enrolledClass) {
    return (
      <div
        className={`mb-6 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isJunior
            ? "bg-[#FFD166]/10 border-[3px] border-dashed border-[#FFD166]"
            : "bg-indigo-500/5 border border-dashed border-indigo-500/30"
        }`}
        data-testid="class-info-banner-empty"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isJunior
                ? "bg-[#FFD166] border-2 border-[#1A1A2E]"
                : "bg-indigo-500/10 border border-indigo-500/30"
            }`}
          >
            <GraduationCap
              className={`w-5 h-5 ${isJunior ? "text-[#1A1A2E]" : "text-indigo-500"}`}
            />
          </div>
          <div>
            <p
              className={`font-bold text-sm ${textPrimary}`}
              style={headingFont}
            >
              {isJunior ? "Join your class! 🏫" : "No class enrolled"}
            </p>
            <p className={`text-xs ${textMuted}`}>
              {isJunior
                ? "Ask your teacher for the class code"
                : "Enter a class code from your teacher to connect"}
            </p>
          </div>
        </div>
        <button
          onClick={onJoinClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shrink-0 ${
            isJunior
              ? "bg-[#FFD166] text-[#1A1A2E] border-2 border-[#1A1A2E] hover:shadow-[2px_2px_0px_#1A1A2E]"
              : "bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-700"
          }`}
          data-testid="join-class-btn"
        >
          <Plus className="w-4 h-4" />
          {isJunior ? "Join Class 🚀" : "Join Class"}
        </button>
      </div>
    );
  }

  // Enrolled — show class info
  return (
    <div
      className={`mb-6 rounded-2xl overflow-hidden ${
        isJunior
          ? "border-[3px] border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]"
          : "border border-indigo-500/20"
      }`}
      data-testid="class-info-banner"
    >
      {/* Top bar */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between ${
          isJunior
            ? "bg-[#06D6A0] border-b-2 border-[#1A1A2E]"
            : "bg-indigo-600/10 border-b border-indigo-500/20"
        }`}
      >
        <div className="flex items-center gap-2">
          <BookOpen
            className={`w-4 h-4 ${isJunior ? "text-[#0F172A]" : "text-indigo-400"}`}
          />
          <span
            className={`font-bold text-sm ${isJunior ? "text-[#0F172A]" : "text-indigo-400"}`}
          >
            {isJunior ? "Your Class 🏫" : "Enrolled Class"}
          </span>
        </div>
        <button
          onClick={onLeave}
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity ${
            isJunior ? "text-[#0F172A] hover:bg-black/10" : "text-indigo-300 hover:bg-indigo-500/10"
          }`}
          title="Leave class"
          data-testid="leave-class-btn"
        >
          <LogOut className="w-3 h-3" /> Leave
        </button>
      </div>

      {/* Body */}
      <div
        className={`px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isJunior ? "bg-white" : "bg-[#FAFAFA]"
        }`}
      >
        {/* Class details */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
              isJunior
                ? "bg-[#06D6A0]/20 border-2 border-[#06D6A0] text-[#065f46]"
                : "bg-indigo-500/10 border border-indigo-500/30 text-indigo-600"
            }`}
          >
            {enrolledClass.grade || "?"}
          </div>
          <div className="min-w-0">
            <p
              className={`font-bold truncate ${textPrimary}`}
              style={headingFont}
            >
              {enrolledClass.className || "My Class"}
            </p>
            <p className={`text-xs ${textMuted}`}>
              {[
                enrolledClass.subject,
                enrolledClass.section && `Section ${enrolledClass.section}`,
                enrolledClass.academicYear,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        {/* Teacher + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {teacher && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm ${
                isJunior
                  ? "bg-[#f1f5f9] border-2 border-[#e2e8f0]"
                  : "bg-white border border-[#E5E7EB]"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isJunior
                    ? "bg-[#06D6A0] text-white"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {teacher.name?.[0]?.toUpperCase() || "T"}
              </div>
              <span className={`font-semibold text-xs ${textSecondary}`}>
                {teacher.name || "Teacher"}
              </span>
            </div>
          )}

          {/* Message teacher */}
          {teacher && onMessageTeacher && (
            <button
              onClick={() => onMessageTeacher(teacher.id, teacher.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isJunior
                  ? "bg-[#118AB2]/10 text-[#118AB2] border-2 border-[#118AB2]/30 hover:bg-[#118AB2]/20"
                  : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 hover:bg-indigo-500/20"
              }`}
              data-testid="message-teacher-btn"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {isJunior ? "Message 💬" : "Message"}
            </button>
          )}

          {/* View classmates */}
          {onViewClassmates && (
            <button
              onClick={onViewClassmates}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isJunior
                  ? "bg-[#C8B6FF]/20 text-[#5b21b6] border-2 border-[#C8B6FF]/40 hover:bg-[#C8B6FF]/30"
                  : "bg-violet-500/10 text-violet-600 border border-violet-500/30 hover:bg-violet-500/20"
              }`}
              data-testid="view-classmates-btn"
            >
              <Users className="w-3.5 h-3.5" />
              {isJunior ? "Classmates 👥" : "Classmates"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
