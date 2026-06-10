import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { X, RefreshCw, AlertTriangle, TrendingDown } from "lucide-react";

/**
 * Real-Time Misconception Heatmap — Teacher view
 * Per-student, per-lesson error intensity grid with REAL data.
 * Uses /teacher/students/concept-mastery + /teacher/misconceptions
 * Auto-refreshes every 30 seconds.
 */

const INTENSITY_COLORS = {
  0: { bg: "bg-emerald-500/20", text: "text-emerald-600", label: "Mastered" },
  1: { bg: "bg-yellow-500/20",  text: "text-yellow-600",  label: "Partial" },
  2: { bg: "bg-orange-500/20",  text: "text-orange-600",  label: "Struggling" },
  3: { bg: "bg-red-500/20",     text: "text-red-600",     label: "Critical" },
};

function getIntensity(score) {
  if (score === undefined || score === null) return null;
  if (score >= 70) return 0;
  if (score >= 50) return 1;
  if (score >= 30) return 2;
  return 3;
}

const AVATARS = {
  owl:"🦉", fox:"🦊", bunny:"🐰", bear:"🐻", cat:"🐱", dog:"🐶",
  panda:"🐼", unicorn:"🦄", dragon:"🐉", dolphin:"🐬", star:"⭐", rocket:"🚀",
};

export default function MisconceptionHeatmap({ onClose }) {
  const { isSenior, headingFont } = useGradeTheme();
  const [students, setStudents] = useState([]);
  const [misconceptions, setMisconceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const [masteryRes, miscRes] = await Promise.all([
        api.get("/teacher/students/concept-mastery"),
        api.get("/teacher/misconceptions"),
      ]);
      setStudents(masteryRes.data.students || []);
      setMisconceptions(miscRes.data.misconceptions || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Heatmap fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 30000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh]);

  const topLessons = misconceptions.slice(0, 8);

  // Get real score for a student on a lesson
  const getScore = (student, lessonId) => {
    return student.lesson_scores?.[lessonId];
  };

  return (
    <div
      className="fixed inset-4 z-[100] neura-card flex flex-col bg-white"
      role="dialog"
      aria-label="Misconception Heatmap"
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isSenior ? "border-indigo-500/20" : "border-[#e5e7eb]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSenior ? "bg-red-500/20 border border-red-500/30" : "bg-[#EF476F]/10 border-2 border-[#EF476F]/30"}`}>
            <AlertTriangle className={`w-5 h-5 ${isSenior ? "text-red-500" : "text-[#EF476F]"}`} />
          </div>
          <div>
            <h2 className="font-bold text-base text-[#1A1A2E]" style={headingFont}>
              Misconception Heatmap
            </h2>
            {lastUpdated && (
              <p className="text-xs text-[#6B7280]">
                Updated {lastUpdated} · {autoRefresh ? "Auto-refresh ON" : "Manual"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              autoRefresh
                ? "bg-[#06D6A0]/10 text-[#065f46] border-[#06D6A0]/30"
                : "bg-white text-[#6B7280] border-gray-200"
            }`}
          >
            {autoRefresh ? "⏱ Auto" : "Manual"}
          </button>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#6B7280]"
            title="Refresh now"
            aria-label="Refresh heatmap"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-red-500/10 text-[#6B7280] hover:text-red-500"
            aria-label="Close heatmap"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 flex-wrap border-b border-[#f1f5f9]">
        {Object.values(INTENSITY_COLORS).map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded ${c.bg}`} />
            <span className="text-xs font-medium text-[#6B7280]">{c.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-100" />
          <span className="text-xs font-medium text-[#6B7280]">No data</span>
        </div>
        <span className="ml-auto text-xs text-[#94a3b8]">Real session data</span>
      </div>

      {/* Heatmap grid */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${isSenior ? "border-indigo-500" : "border-[#118AB2]"}`} />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="w-12 h-12 mx-auto mb-3 text-[#374151]" />
            <p className="font-semibold text-[#6B7280]">No student data yet. Students need to complete quizzes first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th
                    className="text-left p-2 text-xs font-bold sticky left-0 z-10 bg-white text-[#6B7280]"
                    style={{ minWidth: 130 }}
                  >
                    Student
                  </th>
                  {topLessons.map((lesson) => (
                    <th
                      key={lesson.lesson_id}
                      className="p-2 text-xs font-bold text-center text-[#6B7280]"
                      style={{ minWidth: 80 }}
                    >
                      <div
                        className="max-w-[78px] truncate mx-auto"
                        title={lesson.title || lesson.lesson_id}
                      >
                        {(lesson.title || lesson.lesson_id).slice(0, 12)}
                      </div>
                      <div className="text-[10px] font-normal text-[#EF476F]">
                        {lesson.error_count} errors
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 25).map((student) => (
                  <tr key={student.id} className="border-t border-gray-100 hover:bg-[#f8fafc]">
                    <td className="p-2 sticky left-0 z-10 bg-white">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{AVATARS[student.avatar] || "🦉"}</span>
                        <div>
                          <p className="text-xs font-bold truncate max-w-[90px] text-[#1A1A2E]">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-[#6B7280]">
                            {student.grade_level?.replace("class_", "Cl.")} · avg {student.avg_score}%
                          </p>
                        </div>
                      </div>
                    </td>
                    {topLessons.map((lesson) => {
                      const score = getScore(student, lesson.lesson_id);
                      const intensity = getIntensity(score);
                      const ic = intensity !== null ? INTENSITY_COLORS[intensity] : null;
                      return (
                        <td key={lesson.lesson_id} className="p-1 text-center">
                          <div
                            className={`w-10 h-8 rounded-lg mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                              ic ? `${ic.bg} hover:opacity-80` : "bg-gray-100"
                            }`}
                            title={score !== undefined ? `${student.name}: ${score}%` : "No data"}
                          >
                            {score !== undefined ? (
                              <span className={ic ? ic.text : "text-[#6B7280]"}>{score}</span>
                            ) : (
                              <span className="text-[#D1D5DB]">—</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary bar */}
      <div className="p-3 border-t border-[#e5e7eb] bg-[#f8fafc] flex items-center gap-4 flex-wrap">
        <span className="text-xs font-bold text-[#6B7280]">
          {students.length} students · {topLessons.length} problem areas
        </span>
        {topLessons[0] && (
          <span className="text-xs font-bold text-[#EF476F]">
            Most errors: {topLessons[0].title || topLessons[0].lesson_id} ({topLessons[0].error_count})
          </span>
        )}
        <span className="ml-auto text-xs text-[#94a3b8]">
          Scores from actual quiz submissions
        </span>
      </div>
    </div>
  );
}
