import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { Trophy, X, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AVATARS = {
  owl:"🦉", fox:"🦊", bunny:"🐰", bear:"🐻", cat:"🐱", dog:"🐶",
  panda:"🐼", unicorn:"🦄", dragon:"🐉", dolphin:"🐬", star:"⭐", rocket:"🚀",
};

export default function Leaderboard({ onClose }) {
  const { user } = useAuth();
  const { isJunior, headingFont } = useGradeTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leaderboard")
      .then(r => setData(r.data))
      .catch(() => setData({ leaderboard: [], my_rank: null }))
      .finally(() => setLoading(false));
  }, []);

  const rankColors = ["text-[#FFD166]", "text-[#94a3b8]", "text-[#b8860b]"];
  const rankBg = ["bg-[#FFD166]/20 border-[#FFD166]", "bg-[#94a3b8]/10 border-[#94a3b8]", "bg-[#b8860b]/10 border-[#b8860b]"];

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
        <div className={`p-5 flex items-center justify-between ${isJunior ? "bg-[#FFD166]/20" : "bg-indigo-500/10"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD166] border-2 border-[#1A1A2E] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#1A1A2E]" />
            </div>
            <div>
              <h2 className="font-bold text-[#0F172A]" style={headingFont}>
                {isJunior ? "🏆 Class Leaderboard" : "Leaderboard"}
              </h2>
              <p className="text-xs text-[#64748B]">
                {data?.grade?.replace("_", " ")} · Top XP earners
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/10 text-[#64748B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* My rank banner */}
        {data?.my_rank && (
          <div className={`px-5 py-2.5 text-sm font-bold text-center ${isJunior ? "bg-[#118AB2] text-white" : "bg-indigo-600 text-white"}`}>
            🎯 Your Rank: #{data.my_rank} in {data?.grade?.replace("_", " ")}
          </div>
        )}

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data?.leaderboard?.length === 0 ? (
            <div className="text-center py-10 text-[#64748B]">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-semibold">No classmates yet! Be the first.</p>
            </div>
          ) : (
            data.leaderboard.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  entry.is_me
                    ? isJunior
                      ? "border-[#118AB2] bg-[#118AB2]/10 shadow-[3px_3px_0px_#118AB2]"
                      : "border-indigo-500 bg-indigo-500/10"
                    : i < 3
                    ? rankBg[i]
                    : "border-[#e2e8f0] bg-white"
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {i === 0 ? (
                    <Crown className="w-5 h-5 text-[#FFD166] mx-auto" />
                  ) : (
                    <span className={`text-sm font-black ${rankColors[i] || "text-[#64748B]"}`}>
                      #{entry.rank}
                    </span>
                  )}
                </div>
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#f1f5f9] border-2 border-[#e2e8f0] flex items-center justify-center text-lg shrink-0">
                  {AVATARS[entry.avatar] || "🦉"}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${entry.is_me ? "text-[#118AB2]" : "text-[#0F172A]"}`}>
                    {entry.name} {entry.is_me && <span className="text-xs">(You)</span>}
                  </p>
                  <p className="text-xs text-[#64748B]">Level {entry.level} · 🔥 {entry.streak}d</p>
                </div>
                {/* XP */}
                <div className="text-right shrink-0">
                  <p className={`font-black text-sm ${isJunior ? "text-[#118AB2]" : "text-indigo-600"}`}>
                    ⚡ {entry.xp}
                  </p>
                  <p className="text-[10px] text-[#94a3b8]">XP</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
