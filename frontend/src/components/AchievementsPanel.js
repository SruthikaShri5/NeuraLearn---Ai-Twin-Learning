import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { Award, X, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function AchievementsPanel({ onClose }) {
  const { isJunior, headingFont } = useGradeTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/achievements")
      .then(r => setData(r.data))
      .catch(() => setData({ achievements: [], earned_count: 0, total_count: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white border-[3px] border-[#1A1A2E] rounded-2xl shadow-[8px_8px_0px_#1A1A2E] overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 flex items-center justify-between ${isJunior ? "bg-[#FFD166]/20" : "bg-amber-500/10"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD166] border-2 border-[#1A1A2E] flex items-center justify-center">
              <Award className="w-5 h-5 text-[#1A1A2E]" />
            </div>
            <div>
              <h2 className="font-bold text-[#0F172A]" style={headingFont}>
                {isJunior ? "🏅 My Achievements" : "Achievements"}
              </h2>
              <p className="text-xs text-[#64748B]">
                {data?.earned_count || 0} / {data?.total_count || 0} unlocked
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/10 text-[#64748B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        {data && (
          <div className="px-5 py-2 bg-[#f8fafc] border-b border-[#e2e8f0]">
            <div className="flex justify-between text-xs font-bold text-[#64748B] mb-1">
              <span>Progress</span>
              <span>{Math.round((data.earned_count / Math.max(1, data.total_count)) * 100)}%</span>
            </div>
            <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FFD166] rounded-full transition-all"
                style={{ width: `${(data.earned_count / Math.max(1, data.total_count)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Achievements grid */}
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#FFD166] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {data?.achievements?.map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    ach.earned
                      ? "border-[#FFD166] bg-[#FFD166]/10 shadow-[3px_3px_0px_#FFD166]"
                      : "border-[#e2e8f0] bg-[#f8fafc] opacity-50"
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {ach.earned ? ach.emoji : <Lock className="w-7 h-7 text-[#94a3b8] mx-auto" />}
                  </div>
                  <p className={`text-xs font-bold ${ach.earned ? "text-[#0F172A]" : "text-[#94a3b8]"}`}>
                    {ach.label}
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-1 leading-tight">{ach.desc}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
