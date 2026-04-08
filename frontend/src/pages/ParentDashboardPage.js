import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Brain, LogOut, Users, BookOpen, TrendingUp, Clock,
  Award, Star, Flame, ChevronRight, Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const AVATARS = {
  owl: "🦉", fox: "🦊", bunny: "🐰", bear: "🐻", cat: "🐱", dog: "🐶",
  panda: "🐼", unicorn: "🦄", dragon: "🐉", dolphin: "🐬", star: "⭐", rocket: "🚀",
};

export default function ParentDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    if (user && user.role !== "parent" && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [childrenRes, lessonsRes] = await Promise.all([
          api.get("/parent/children-progress"),
          api.get("/parent/grade-lessons"),
        ]);
        const kids = childrenRes.data.children || [];
        setChildren(kids);
        setLessons(lessonsRes.data.lessons || []);
        if (kids.length > 0) setSelectedChild(kids[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => { await logout(); navigate("/"); };

  const childrenGrades = user?.children_grades || [];

  // Build session chart data for selected child
  const sessionChartData = (() => {
    if (!selectedChild?.recent_sessions) return [];
    const byDay = {};
    selectedChild.recent_sessions.forEach((s) => {
      const day = s.completed_at?.slice(0, 10) || "unknown";
      if (!byDay[day]) byDay[day] = { date: day, score: 0, count: 0 };
      byDay[day].score += s.score || 0;
      byDay[day].count += 1;
    });
    return Object.values(byDay).map((d) => ({ ...d, avg_score: Math.round(d.score / d.count) }));
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFD166] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="parent-dashboard">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD166] flex items-center justify-center border-2 border-[#0F172A]">
              <Heart className="w-5 h-5 text-[#0F172A]" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>NeuraLearn</span>
              <span className="ml-2 text-xs font-bold text-[#b8860b] bg-[#FFD166]/30 px-2 py-0.5 rounded-full border border-[#FFD166]">Parent</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#0F172A] bg-white">
              <span className="text-lg">{AVATARS[user?.avatar] || "🦉"}</span>
              <span className="font-bold text-sm text-[#0F172A]">{user?.name?.split(" ")[0]}</span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-[#EF476F]/10 text-[#64748B] hover:text-[#EF476F]" aria-label="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="neura-card p-6 mb-8 bg-gradient-to-r from-[#FFD166]/20 to-[#FFD6BA]/20">
          <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Hello, {user?.name?.split(" ")[0]}! 💛
          </h1>
          <p className="text-[#64748B] mt-1">
            Monitoring progress for grades: {childrenGrades.map((g) => g.replace("_", " ")).join(", ") || "All"}
          </p>
        </div>

        {children.length === 0 ? (
          <div className="neura-card p-16 text-center">
            <Users className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              No students found yet
            </h2>
            <p className="text-[#64748B] max-w-md mx-auto">
              Students in grades {childrenGrades.map((g) => g.replace("_", " ")).join(", ")} will appear here once they sign up and start learning.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Children list */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="font-bold text-[#0F172A] text-lg mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <Users className="w-5 h-5 inline mr-2" />Students ({children.length})
              </h2>
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`w-full neura-card p-4 flex items-center gap-3 text-left transition-all ${
                    selectedChild?.id === child.id ? 'border-[#FFD166] shadow-[4px_4px_0px_#FFD166]' : ''
                  }`}
                  data-testid={`child-card-${child.id}`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#FFD166]/20 border-2 border-[#0F172A] flex items-center justify-center text-2xl shrink-0">
                    {AVATARS[child.avatar] || "🦉"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F172A] truncate">{child.name}</p>
                    <p className="text-xs text-[#64748B]">{child.grade_level?.replace("_", " ")}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-[#118AB2]">⚡ {child.xp || 0} XP</span>
                      <span className="text-xs font-bold text-[#EF476F]">🔥 {child.streak || 0}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />
                </button>
              ))}
            </div>

            {/* Selected child detail */}
            {selectedChild && (
              <div className="lg:col-span-2 space-y-6">
                {/* Child header */}
                <div className="neura-card p-6 bg-[#FFD166]/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-[#0F172A] flex items-center justify-center text-3xl">
                      {AVATARS[selectedChild.avatar] || "🦉"}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                        {selectedChild.name}
                      </h2>
                      <p className="text-[#64748B] text-sm">{selectedChild.grade_level?.replace("_", " ")} · {selectedChild.email}</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Star, label: "XP", value: selectedChild.xp || 0, color: "text-[#118AB2]" },
                      { icon: Flame, label: "Streak", value: `${selectedChild.streak || 0}d`, color: "text-[#EF476F]" },
                      { icon: Award, label: "Concepts", value: selectedChild.concepts_mastered || 0, color: "text-[#06D6A0]" },
                      { icon: Clock, label: "Time", value: `${selectedChild.total_time_minutes || 0}m`, color: "text-[#C8B6FF]" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-3 border-2 border-[#e2e8f0] text-center">
                        <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                        <p className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>{stat.value}</p>
                        <p className="text-xs text-[#64748B]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level progress */}
                <div className="neura-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      Level {selectedChild.level || 1} Progress
                    </h3>
                    <span className="text-sm font-bold text-[#118AB2]">{selectedChild.xp || 0} / {(selectedChild.level || 1) * 100} XP</span>
                  </div>
                  <Progress value={Math.min(((selectedChild.xp || 0) % 100), 100)} className="h-3" />
                  <p className="text-xs text-[#64748B] mt-2">
                    {Math.max(0, (selectedChild.level || 1) * 100 - (selectedChild.xp || 0))} XP to next level
                  </p>
                </div>

                {/* Recent activity chart */}
                {sessionChartData.length > 0 && (
                  <div className="neura-card p-5">
                    <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      Recent Quiz Scores
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={sessionChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0F172A' }} />
                        <Line type="monotone" dataKey="avg_score" stroke="#FFD166" strokeWidth={3}
                          dot={{ r: 5, fill: '#FFD166', stroke: '#0F172A', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Achievements */}
                {selectedChild.achievements?.length > 0 && (
                  <div className="neura-card p-5">
                    <h3 className="font-bold text-[#0F172A] mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      Achievements 🏆
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedChild.achievements.map((a) => (
                        <span key={a} className="px-3 py-1.5 rounded-full bg-[#FFD166]/20 border-2 border-[#FFD166] text-sm font-bold text-[#b8860b]">
                          🏅 {a.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lessons for child's grade */}
                <div className="neura-card p-5">
                  <h3 className="font-bold text-[#0F172A] mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Lessons for {selectedChild.grade_level?.replace("_", " ")}
                  </h3>
                  <div className="space-y-2">
                    {lessons
                      .filter((l) => l.grade === selectedChild.grade_level)
                      .slice(0, 5)
                      .map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border-2 border-[#0F172A] ${
                            lesson.subject === 'mathematics' ? 'bg-[#FFD166]' : 'bg-[#06D6A0]/30'
                          }`}>
                            {lesson.subject === 'mathematics' ? '📐' : '🔬'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-[#0F172A]">{lesson.title}</p>
                            <p className="text-xs text-[#64748B]">{lesson.quiz?.length || 0} questions</p>
                          </div>
                          <span className="text-xs font-bold text-[#64748B]">Lvl {lesson.difficulty}</span>
                        </div>
                      ))}
                    {lessons.filter((l) => l.grade === selectedChild.grade_level).length === 0 && (
                      <p className="text-sm text-[#64748B] text-center py-4">No lessons available for this grade yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
