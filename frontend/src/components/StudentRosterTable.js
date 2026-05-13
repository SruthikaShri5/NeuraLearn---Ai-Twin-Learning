import { useState } from "react";
import { Search, MessageCircle, UserMinus, Zap, Flame, BarChart2, Clock } from "lucide-react";
import { useGradeTheme } from "@/lib/useGradeTheme";

const AVATARS = {
  owl: "🦉", fox: "🦊", bunny: "🐰", bear: "🐻", cat: "🐱", dog: "🐶",
  panda: "🐼", unicorn: "🦄", dragon: "🐉", dolphin: "🐬", star: "⭐", rocket: "🚀",
};

export default function StudentRosterTable({ students = [], classId, onRemove, onMessage }) {
  const { isJunior, textPrimary, textSecondary, textMuted, input } = useGradeTheme();
  const [search, setSearch] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatLastActive = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const diff = Math.floor((Date.now() - d) / 86400000);
      if (diff === 0) return "Today";
      if (diff === 1) return "Yesterday";
      return `${diff}d ago`;
    } catch {
      return "-";
    }
  };

  const handleRemove = (student) => {
    if (confirmRemove === student.id) {
      onRemove && onRemove(student.id, classId);
      setConfirmRemove(null);
    } else {
      setConfirmRemove(student.id);
      setTimeout(() => setConfirmRemove(null), 3000);
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isJunior ? "Search students... " : "Search students..."}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm ${input} focus:outline-none focus:ring-2 ${
            isJunior ? "focus:ring-[#06D6A0]" : "focus:ring-indigo-500"
          }`}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={`p-8 rounded-xl text-center ${isJunior ? "bg-gray-50 border-2 border-dashed border-gray-200" : "bg-white/30 border border-dashed border-[#E5E7EB]"}`}>
          <p className={`text-sm ${textMuted}`}>
            {search ? "No students match your search." : "No students enrolled yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className={`hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider ${textMuted}`}>
            <span>Student</span>
            <span className="text-center">XP</span>
            <span className="text-center">Streak</span>
            <span className="text-center">Avg Score</span>
            <span className="text-center">Last Active</span>
            <span>Actions</span>
          </div>

          {filtered.map((student) => (
            <div
              key={student.id}
              className={`rounded-xl p-3 sm:p-4 flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 items-start sm:items-center ${
                isJunior
                  ? "bg-white border-2 border-[#e5e7eb] hover:border-[#1A1A2E] transition-colors"
                  : "bg-[#0D1117] border border-[#E5E7EB] hover:border-[#E5E7EB] transition-colors"
              }`}
              data-testid={`roster-row-${student.id}`}
            >
              {/* Name + avatar */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${
                  isJunior ? "bg-[#f1f5f9] border-2 border-[#e5e7eb]" : "bg-[#F3F4F6] border border-[#E5E7EB]"
                }`}>
                  {AVATARS[student.avatar] || "🦉"}
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-sm truncate ${textPrimary}`}>{student.name}</p>
                  <p className={`text-xs truncate ${textMuted}`}>{student.email}</p>
                </div>
              </div>

              {/* XP */}
              <div className="flex sm:flex-col items-center gap-1 sm:gap-0">
                <Zap className={`w-3.5 h-3.5 sm:hidden ${isJunior ? "text-[#b8860b]" : "text-amber-400"}`} />
                <span className={`text-sm font-bold text-center ${isJunior ? "text-[#118AB2]" : "text-[#4F46E5]"}`}>
                  {student.xp || 0}
                </span>
                <span className={`text-xs sm:block hidden ${textMuted}`}>XP</span>
              </div>

              {/* Streak */}
              <div className="flex sm:flex-col items-center gap-1 sm:gap-0">
                <Flame className={`w-3.5 h-3.5 sm:hidden ${isJunior ? "text-[#EF476F]" : "text-red-400"}`} />
                <span className={`text-sm font-bold text-center ${isJunior ? "text-[#EF476F]" : "text-red-400"}`}>
                  {student.streak || 0}d
                </span>
              </div>

              {/* Avg Score */}
              <div className="flex sm:flex-col items-center gap-1 sm:gap-0">
                <BarChart2 className={`w-3.5 h-3.5 sm:hidden ${isJunior ? "text-[#06D6A0]" : "text-emerald-400"}`} />
                <span className={`text-sm font-bold text-center ${
                  (student.avg_score || 0) >= 70
                    ? isJunior ? "text-[#06D6A0]" : "text-emerald-400"
                    : (student.avg_score || 0) >= 50
                      ? isJunior ? "text-[#b8860b]" : "text-amber-400"
                      : isJunior ? "text-[#EF476F]" : "text-red-400"
                }`}>
                  {student.avg_score || 0}%
                </span>
              </div>

              {/* Last Active */}
              <div className="flex sm:flex-col items-center gap-1 sm:gap-0">
                <Clock className={`w-3.5 h-3.5 sm:hidden ${textMuted}`} />
                <span className={`text-xs text-center ${textMuted}`}>
                  {formatLastActive(student.last_active)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onMessage && onMessage(student.id, student.name)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isJunior
                      ? "hover:bg-[#06D6A0]/10 text-[#065f46]"
                      : "hover:bg-emerald-500/10 text-emerald-400"
                  }`}
                  title="Message student"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemove(student)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    confirmRemove === student.id
                      ? isJunior ? "bg-[#EF476F] text-white" : "bg-red-500 text-white"
                      : isJunior ? "hover:bg-[#EF476F]/10 text-[#EF476F]" : "hover:bg-red-500/10 text-red-400"
                  }`}
                  title={confirmRemove === student.id ? "Click again to confirm" : "Remove student"}
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className={`text-xs mt-3 ${textMuted}`}>
        {filtered.length} of {students.length} student{students.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
