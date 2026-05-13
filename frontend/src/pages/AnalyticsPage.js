import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { ArrowLeft, BarChart3, Clock, Brain, Target, Users } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS_CHART = ["#118AB2", "#FFD166", "#EF476F", "#06D6A0", "#C8B6FF", "#FFD6BA"];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/analytics");
        setAnalytics(data);
      } catch {} finally { setLoading(false); }
    };
    fetchAnalytics();
  }, []);

  const sessions = analytics?.sessions || [];
  const masteryData = analytics?.mastery || [];

  // Prepare chart data
  const sessionsByDay = {};
  sessions.forEach((s) => {
    const day = s.completed_at?.slice(0, 10) || "unknown";
    if (!sessionsByDay[day]) sessionsByDay[day] = { date: day, duration: 0, count: 0 };
    sessionsByDay[day].duration += (s.time_spent_seconds || 0) / 60;
    sessionsByDay[day].count += 1;
  });
  const dailyData = Object.values(sessionsByDay).slice(-7);

  const masteryChartData = masteryData.map((m) => ({
    concept: m.concept_id?.replace("math_", "").replace("sci_", "") || "unknown",
    score: m.score || 0,
  }));

  const scoreDistribution = [
    { name: "Excellent (80-100%)", value: masteryData.filter((m) => m.score >= 80).length || 0 },
    { name: "Good (60-79%)", value: masteryData.filter((m) => m.score >= 60 && m.score < 80).length || 0 },
    { name: "Needs Work (<60%)", value: masteryData.filter((m) => m.score < 60).length || 0 },
  ].filter((d) => d.value > 0);

  const totalMinutes = Math.round((analytics?.total_time_seconds || 0) / 60);

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="analytics-page">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-[#334155] hover:text-[#0F172A]" data-testid="analytics-back-link">
            <ArrowLeft className="w-5 h-5" /> Dashboard
          </Link>
          <h1 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <BarChart3 className="w-5 h-5 inline mr-1" /> Analytics
          </h1>
          <div className="w-24" />
        </div>
      </nav>

      <main id="main-content" className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="analytics-summary">
              <div className="neura-card p-5 bg-[#118AB2]/10">
                <Brain className="w-6 h-6 text-[#118AB2] mb-2" />
                <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="concepts-mastered">{analytics?.concepts_mastered || 0}</p>
                <p className="text-sm font-bold text-[#64748B]">Concepts Mastered</p>
              </div>
              <div className="neura-card p-5 bg-[#FFD166]/10">
                <Clock className="w-6 h-6 text-[#FFD166] mb-2" />
                <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="total-time">{totalMinutes} min</p>
                <p className="text-sm font-bold text-[#64748B]">Total Learning</p>
              </div>
              <div className="neura-card p-5 bg-[#06D6A0]/10">
                <Target className="w-6 h-6 text-[#06D6A0] mb-2" />
                <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="total-sessions">{analytics?.total_sessions || 0}</p>
                <p className="text-sm font-bold text-[#64748B]">Total Sessions</p>
              </div>
              <div className="neura-card p-5 bg-[#C8B6FF]/10">
                <Users className="w-6 h-6 text-[#C8B6FF] mb-2" />
                <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>0</p>
                <p className="text-sm font-bold text-[#64748B]">Peer Connections</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Daily Sessions */}
              <div className="neura-card p-6" data-testid="chart-daily-sessions">
                <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Daily Learning Time (min)</h3>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0F172A' }} />
                      <Line type="monotone" dataKey="duration" stroke="#118AB2" strokeWidth={3} dot={{ r: 5, fill: '#118AB2' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-[#64748B]">Complete lessons to see data</div>
                )}
              </div>

              {/* Mastery Scores */}
              <div className="neura-card p-6" data-testid="chart-mastery">
                <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Concept Mastery Scores</h3>
                {masteryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={masteryChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="concept" tick={{ fontSize: 10, fill: '#64748B' }} angle={-30} textAnchor="end" height={60} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0F172A' }} />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {masteryChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.score >= 70 ? '#06D6A0' : entry.score >= 40 ? '#FFD166' : '#EF476F'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-[#64748B]">Complete quizzes to see mastery</div>
                )}
              </div>

              {/* Score Distribution */}
              <div className="neura-card p-6" data-testid="chart-distribution">
                <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Score Distribution</h3>
                {scoreDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={scoreDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {scoreDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS_CHART[i]} stroke="#0F172A" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0F172A' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-[#64748B]">No score data yet</div>
                )}
              </div>

              {/* Sessions per Day */}
              <div className="neura-card p-6" data-testid="chart-session-count">
                <h3 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Sessions per Day</h3>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0F172A' }} />
                      <Bar dataKey="count" fill="#C8B6FF" radius={[8, 8, 0, 0]} stroke="#0F172A" strokeWidth={2} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-[#64748B]">No session data yet</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
