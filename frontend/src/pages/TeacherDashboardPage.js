import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  Brain, LogOut, GraduationCap, Users, BookOpen, BarChart3,
  TrendingUp, Award, Clock, ChevronRight, Search, Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const AVATARS = {
  owl: "🦉", fox: "🦊", bunny: "🐰", bear: "🐻", cat: "🐱", dog: "🐶",
  panda: "🐼", unicorn: "🦄", dragon: "🐉", dolphin: "🐬", star: "⭐", rocket: "🚀",
};

const GRADE_COLORS = {
  class_1: "#FFD166", class_2: "#FFD6BA", class_3: "#06D6A0", class_4: "#C8B6FF",
  class_5: "#118AB2", class_6: "#EF476F", class_7: "#FFD166", class_8: "#06D6A0",
  class_9: "#C8B6FF", class_10: "#118AB2", class_11: "#EF476F", class_12: "#FFD6BA",
};

export default function TeacherDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classStats, setClassStats] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");

  useEffect(() => {
    if (user && user.role !== "teacher" && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, analyticsRes, lessonsRes] = await Promise.all([
          api.get("/teacher/students"),
          api.get("/teacher/class-analytics"),
          api.get("/teacher/lessons"),
        ]);
        setStudents(studentsRes.data.students || []);
        setClassStats(analyticsRes.data.class_stats || []);
        setLessons(lessonsRes.data.lessons || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => { await logout(); navigate("/"); };

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchGrade = filterGrade === "all" || s.grade_level === filterGrade;
    return matchSearch && matchGrade;
  });

  const assignedClasses = user?.assigned_classes || [];
  const totalStudents = students.length;
  const avgScore = students.length
    ? Math.round(students.reduce((a, s) => a + (s.avg_score || 0), 0) / students.length)
    : 0;
  const activeStudents = students.filter((s) => (s.streak || 0) > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#06D6A0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="teacher-dashboard">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06D6A0] flex items-center justify-center border-2 border-[#0F172A]">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>NeuraLearn</span>
              <span className="ml-2 text-xs font-bold text-[#06D6A0] bg-[#06D6A0]/10 px-2 py-0.5 rounded-full border border-[#06D6A0]">Teacher</span>
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
        <div className="neura-card p-6 mb-8 bg-gradient-to-r from-[#06D6A0]/10 to-[#118AB2]/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Welcome, {user?.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-[#64748B] mt-1">
                {user?.school_name && <span className="font-semibold">{user.school_name} · </span>}
                Teaching: {assignedClasses.map((c) => c.replace("_", " ")).join(", ") || "All classes"}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {assignedClasses.slice(0, 4).map((cls) => (
                <span key={cls} className="px-3 py-1 rounded-full text-xs font-bold border-2 border-[#0F172A]"
                  style={{ backgroundColor: GRADE_COLORS[cls] || '#e2e8f0' }}>
                  {cls.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Students", value: totalStudents, color: "bg-[#118AB2]/10", iconColor: "text-[#118AB2]" },
            { icon: TrendingUp, label: "Avg Score", value: `${avgScore}%`, color: "bg-[#06D6A0]/10", iconColor: "text-[#06D6A0]" },
            { icon: Award, label: "Active Learners", value: activeStudents, color: "bg-[#FFD166]/10", iconColor: "text-[#b8860b]" },
            { icon: BookOpen, label: "Lessons Available", value: lessons.length, color: "bg-[#C8B6FF]/10", iconColor: "text-[#7c3aed]" },
          ].map((stat) => (
            <div key={stat.label} className={`neura-card p-5 ${stat.color}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor} mb-2`} />
              <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>{stat.value}</p>
              <p className="text-sm font-bold text-[#64748B]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b-2 border-[#e2e8f0]">
          {[
            { id: "overview", label: "Class Overview", icon: BarChart3 },
            { id: "students", label: "Students", icon: Users },
            { id: "lessons", label: "Lessons", icon: BookOpen },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all -mb-0.5 ${
                activeTab === tab.id
                  ? 'border-[#06D6A0] text-[#06D6A0]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
              data-testid={`teacher-tab-${tab.id}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {classStats.length > 0 ? (
              <div className="neura-card p-6">
                <h2 className="font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  Class Performance Overview
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={classStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="grade" tickFormatter={(v) => v.replace("class_", "Cl.")} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0F172A' }}
                      formatter={(val, name) => [val, name === 'student_count' ? 'Students' : name === 'avg_xp' ? 'Avg XP' : 'Avg Streak']} />
                    <Bar dataKey="student_count" name="Students" radius={[8, 8, 0, 0]}>
                      {classStats.map((entry, i) => (
                        <Cell key={i} fill={GRADE_COLORS[entry.grade] || '#118AB2'} stroke="#0F172A" strokeWidth={2} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="neura-card p-12 text-center">
                <Users className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
                <p className="text-[#64748B] font-semibold">No students enrolled in your classes yet.</p>
                <p className="text-sm text-[#94a3b8] mt-1">Students will appear here once they sign up with matching class levels.</p>
              </div>
            )}

            {/* Class breakdown cards */}
            {classStats.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classStats.map((cls) => (
                  <div key={cls.grade} className="neura-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl border-2 border-[#0F172A] flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: GRADE_COLORS[cls.grade] || '#e2e8f0' }}>
                        {cls.grade.replace("class_", "")}
                      </div>
                      <div>
                        <p className="font-bold text-[#0F172A]">{cls.grade.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                        <p className="text-xs text-[#64748B]">{cls.student_count} students</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-[#f8fafc] rounded-lg p-2">
                        <p className="text-lg font-bold text-[#118AB2]">{cls.avg_xp || 0}</p>
                        <p className="text-xs text-[#64748B]">Avg XP</p>
                      </div>
                      <div className="bg-[#f8fafc] rounded-lg p-2">
                        <p className="text-lg font-bold text-[#EF476F]">{cls.avg_streak || 0}</p>
                        <p className="text-xs text-[#64748B]">Avg Streak</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..." className="pl-9 h-11 border-2 border-[#0F172A] rounded-xl" />
              </div>
              <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}
                className="h-11 px-4 border-2 border-[#0F172A] rounded-xl font-semibold text-sm bg-white">
                <option value="all">All Classes</option>
                {assignedClasses.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, (ch) => ch.toUpperCase())}</option>
                ))}
              </select>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="neura-card p-12 text-center">
                <Users className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
                <p className="text-[#64748B] font-semibold">No students found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="neura-card p-4 flex items-center gap-4" data-testid={`student-row-${student.id}`}>
                    <div className="w-12 h-12 rounded-full bg-[#f1f5f9] border-2 border-[#0F172A] flex items-center justify-center text-2xl shrink-0">
                      {AVATARS[student.avatar] || "🦉"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0F172A] truncate">{student.name}</p>
                      <p className="text-xs text-[#64748B] truncate">{student.email}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-center">
                      <div>
                        <p className="font-bold text-[#118AB2]">{student.xp || 0}</p>
                        <p className="text-xs text-[#64748B]">XP</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#EF476F]">{student.streak || 0}</p>
                        <p className="text-xs text-[#64748B]">Streak</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#06D6A0]">{student.avg_score || 0}%</p>
                        <p className="text-xs text-[#64748B]">Avg Score</p>
                      </div>
                    </div>
                    <Badge className="shrink-0 border-2 border-[#0F172A] text-xs"
                      style={{ backgroundColor: GRADE_COLORS[student.grade_level] || '#e2e8f0' }}>
                      {student.grade_level?.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === "lessons" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.length === 0 ? (
              <div className="col-span-3 neura-card p-12 text-center">
                <BookOpen className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
                <p className="text-[#64748B] font-semibold">No lessons for your assigned classes yet.</p>
              </div>
            ) : lessons.map((lesson) => (
              <div key={lesson.id} className="neura-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`border-2 border-[#0F172A] text-xs ${
                    lesson.subject === 'mathematics' ? 'bg-[#FFD166] text-[#0F172A]' : 'bg-[#06D6A0]/30 text-[#0F172A]'
                  }`}>
                    {lesson.subject === 'mathematics' ? 'Math' : 'Science'}
                  </Badge>
                  <span className="text-xs font-bold text-[#64748B]">{lesson.grade?.replace("_", " ")}</span>
                </div>
                <h3 className="font-bold text-[#0F172A] mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>{lesson.title}</h3>
                <p className="text-xs text-[#64748B] line-clamp-2">{lesson.introduction}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#64748B]">
                  <Clock className="w-3 h-3" />
                  <span>{lesson.quiz?.length || 0} quiz questions</span>
                  <span className="ml-auto font-bold text-[#118AB2]">Difficulty: {lesson.difficulty}/10</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
