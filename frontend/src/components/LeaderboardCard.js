import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { Trophy, Medal, Award } from "lucide-react";
import api from "@/lib/api";

export default function LeaderboardCard() {
  const { user } = useAuth();
  const { isJunior, headingFont } = useGradeTheme();

  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leaderboard").then((res) => {
      setLeaderboard(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !leaderboard) {
    return (
      <div className="neura-card p-4" data-testid="leaderboard-loading">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-[#FFD166]" />
          <h3 className={`font-bold text-[#0F172A]`} style={headingFont}>Leaderboard</h3>
        </div>
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-[#118AB2] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#64748B] mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const myRank = leaderboard.my_rank;
  const top3 = leaderboard.leaderboard.slice(0, 3);

  return (
    <div className="neura-card p-4" data-testid="leaderboard-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#FFD166]" />
          <h3 className={`font-bold text-[#0F172A]`} style={headingFont}>Leaderboard</h3>
        </div>
        <span className="text-xs font-bold text-[#118AB2]">Your Rank: #{myRank}</span>
      </div>
      <div className="space-y-2">
        {top3.map((entry, i) => {
          return (
            <div key={entry.id} className={`flex items-center gap-3 p-2 rounded-lg ${entry.is_me ? 'bg-[#06D6A0]/20 border-2 border-[#06D6A0]' : ''}`}>
              <span className="text-lg font-bold w-6">{i + 1}</span>
              <span className="text-base">{entry.avatar || '🦉'}</span>
              <span className="flex-1 font-semibold text-sm truncate">{entry.name?.split(' ')[0] || 'Student'}</span>
              <span className="text-sm font-bold text-[#118AB2]">{entry.xp} XP</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}