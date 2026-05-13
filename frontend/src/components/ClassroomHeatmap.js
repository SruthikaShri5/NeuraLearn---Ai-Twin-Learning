import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { RefreshCw, Users, Wifi } from "lucide-react";

const AVATARS = {
  owl:"🦉", fox:"🦊", bunny:"🐰", bear:"🐻", cat:"🐱", dog:"🐶",
  panda:"🐼", unicorn:"🦄", dragon:"🐉", dolphin:"🐬", star:"⭐", rocket:"🚀",
};

const STATUS_CONFIG = {
  green:  { label: "Engaged",    bg: "bg-[#06D6A0]",  ring: "ring-[#06D6A0]",  text: "text-[#065f46]",  dot: "#06D6A0" },
  yellow: { label: "Struggling", bg: "bg-[#FFD166]",  ring: "ring-[#FFD166]",  text: "text-[#b8860b]",  dot: "#FFD166" },
  red:    { label: "High Risk",  bg: "bg-[#EF476F]",  ring: "ring-[#EF476F]",  text: "text-[#EF476F]",  dot: "#EF476F" },
};

/**
 * ClassroomHeatmap
 * Live coloured circles for each student.
 * Polls /api/teacher/students/status every 30 seconds.
 */
export default function ClassroomHeatmap() {
  const { isJunior } = useGradeTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selected, setSelected] = useState(null);
  const intervalRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get("/teacher/students/status");
      setStudents(data.students || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      // silently fail — keep showing last data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const counts = {
    green:  students.filter((s) => s.status === "green").length,
    yellow: students.filter((s) => s.status === "yellow").length,
    red:    students.filter((s) => s.status === "red").length,
  };

  return (
    <div className="neura-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className={`w-5 h-5 ${isJunior ? "text-[#118AB2]" : "text-indigo-600"}`} />
          <h2 className="font-bold text-[#0F172A]" style={{ fontFamily: isJunior ? "Fredoka, sans-serif" : "Space Grotesk, sans-serif" }}>
            {isJunior ? "🏫 Live Classroom" : "Live Classroom Status"}
          </h2>
          {/* Live pulse */}
          <span className="flex items-center gap-1 text-xs text-[#06D6A0] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-pulse inline-block" />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-[#94a3b8]">Updated {lastUpdated}</span>
          )}
          <button
            onClick={fetchStatus}
            className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748B]"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full inline-block`} style={{ background: cfg.dot }} />
            <span className="text-xs font-semibold text-[#374151]">
              {cfg.label} ({counts[key]})
            </span>
          </div>
        ))}
      </div>

      {/* Student circles */}
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <div className="w-8 h-8 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8 text-[#94a3b8]">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No students enrolled yet.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {students.map((s) => {
            const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.green;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(selected?.id === s.id ? null : s)}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  selected?.id === s.id
                    ? `border-[#0F172A] shadow-[3px_3px_0px_#0F172A]`
                    : "border-transparent hover:border-[#e2e8f0]"
                }`}
                title={`${s.name} — ${cfg.label}`}
                aria-label={`${s.name}: ${cfg.label}`}
              >
                {/* Avatar circle with status ring */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ring-4 ${cfg.ring} ring-offset-2 transition-all`}
                  style={{ background: cfg.dot + "20" }}
                >
                  {AVATARS[s.avatar] || "🦉"}
                </div>
                {/* Status dot */}
                <span
                  className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white"
                  style={{ background: cfg.dot }}
                />
                {/* Name */}
                <span className="text-[10px] font-bold text-[#374151] max-w-[56px] truncate text-center">
                  {s.name?.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected student detail */}
      {selected && (
        <div className={`mt-4 p-3 rounded-xl border-2 flex items-center gap-3 ${
          STATUS_CONFIG[selected.status]?.bg + "/10"
        } border-[#e2e8f0]`}>
          <span className="text-2xl">{AVATARS[selected.avatar] || "🦉"}</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-[#0F172A]">{selected.name}</p>
            <p className="text-xs text-[#64748B]">
              {selected.grade_level?.replace("class_", "Class ")} ·{" "}
              Avg: {selected.avg_score}% · Streak: {selected.streak}d ·{" "}
              {selected.days_inactive === 999 ? "Never active" : selected.days_inactive === 0 ? "Active today" : `Inactive ${selected.days_inactive}d`}
            </p>
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_CONFIG[selected.status]?.bg} text-white`}
          >
            {STATUS_CONFIG[selected.status]?.label}
          </span>
        </div>
      )}
    </div>
  );
}
