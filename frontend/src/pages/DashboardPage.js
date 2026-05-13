import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import api from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import AICompanion from "@/components/AICompanion";
import EmotionDetector from "@/components/EmotionDetector";
import SoundscapePanel from "@/components/SoundscapePanel";
import StreakFlame from "@/components/StreakFlame";
import AITutor from "@/components/AITutor";
import OfflineIndicator from "@/components/OfflineIndicator";
import AccessibilityBot from "@/components/AccessibilityBot";
import VirtualTour from "@/components/VirtualTour";
import MoodPicker from "@/components/MoodPicker";
import StudyRoadmap from "@/components/StudyRoadmap";
import VoiceNav from "@/components/VoiceNav";
import { FocusModeToggle, FocusModeOverlay } from "@/components/FocusMode";
import { setHapticIntensity, vibrate } from "@/lib/haptics";
import { toast } from "sonner";
import ClassInfoBanner from "@/components/ClassInfoBanner";
import AssignmentsList from "@/components/AssignmentsList";
import JoinClassModal from "@/components/JoinClassModal";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import MessageChat from "@/components/MessageChat";
import { useClassStore } from "@/lib/classStore";
import { useAssignmentStore } from "@/lib/assignmentStore";
import {
  Brain, BookOpen, BarChart3, Settings, LogOut, Star, Trophy,
  Zap, ArrowRight, ChevronRight, Wind, Bot, Camera, Music,
  Clock, RefreshCw, MessageCircle, Sparkles, Map, TrendingUp,
  PlayCircle, Award, Target, Flame
} from "lucide-react";

const MASCOT_URL = "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/0d5a58ad11917c107d19197bb800270b2ab4affe5ac9d9ef444167284e0b11be.png";

const AVATARS = {
  owl: "🦉", fox: "🦊", bunny: "🐰", bear: "🐻", cat: "🐱", dog: "🐶",
  panda: "🐼", unicorn: "🦄", dragon: "🐉", dolphin: "🐬", star: "⭐", rocket: "🚀",
};

const SUBJECT_COLORS_JR = {
  mathematics: { bg: "bg-[#FFD166]/20", border: "border-[#FFD166]", text: "text-[#b8860b]", label: "Math" },
  science:     { bg: "bg-[#06D6A0]/20", border: "border-[#06D6A0]", text: "text-[#065f46]", label: "Science" },
  english:     { bg: "bg-[#C8B6FF]/20", border: "border-[#C8B6FF]", text: "text-[#5b21b6]", label: "English 📖" },
  social_studies: { bg: "bg-[#FFD6BA]/30", border: "border-[#FFD6BA]", text: "text-[#9a3412]", label: "Social 🌍" },
};
const SUBJECT_COLORS_SR = {
  mathematics: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", label: "Mathematics" },
  science:     { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", label: "Science" },
  english:     { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400", label: "English" },
  social_studies: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", label: "Social Studies" },
};

// "-€ Junior NavBar "-----------------------------------------------------------€
function JuniorNav({ user, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-[3px] border-[#1A1A2E]" data-testid="dashboard-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2" data-testid="dashboard-logo">
          <div className="w-9 h-9 rounded-xl bg-[#118AB2] flex items-center justify-center border-2 border-[#1A1A2E]">
            <Brain className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "Fredoka, sans-serif" }}>NeuraLearn</span>
          <span className="hidden sm:block text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFD166] text-[#1A1A2E] border-2 border-[#1A1A2E]">
            {user?.grade_level?.replace("class_", "Class ")}
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/knowledge-graph" className="p-2 rounded-xl hover:bg-[#f1f5f9] text-[#374151]" data-testid="nav-knowledge-graph" aria-label="Knowledge Graph" title="Knowledge Graph">
            <Map className="w-5 h-5" />
          </Link>
          <Link to="/analytics" className="p-2 rounded-xl hover:bg-[#f1f5f9] text-[#374151]" data-testid="nav-analytics" aria-label="Analytics" title="Analytics">
            <BarChart3 className="w-5 h-5" />
          </Link>
          <NotificationsDropdown />
          <Link to="/settings" className="p-2 rounded-xl hover:bg-[#f1f5f9] text-[#374151]" data-testid="nav-settings" aria-label="Settings" title="Settings">
            <Settings className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#1A1A2E] bg-white ml-1">
            <span className="text-lg">{AVATARS[user?.avatar] || "🦉"}</span>
            <span className="font-bold text-sm text-[#1A1A2E] hidden sm:block">{user?.name?.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} className="p-2 rounded-xl hover:bg-[#EF476F]/10 text-[#6B7280] hover:text-[#EF476F]" data-testid="nav-logout" aria-label="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

// "-€ Senior NavBar "-----------------------------------------------------------€
function SeniorNav({ user, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-indigo-500/20 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.92)" }} data-testid="dashboard-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3" data-testid="dashboard-logo">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[#1A1A2E]" style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.02em" }}>NeuraLearn</span>
          <span className="hidden sm:block text-xs font-medium px-2 py-0.5 rounded border border-indigo-500/40 text-[#4F46E5] bg-indigo-500/10">
            {user?.grade_level?.replace("class_", "Class ")}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {[
            { to: "/knowledge-graph", icon: Map, label: "Knowledge Graph", testid: "nav-knowledge-graph" },
            { to: "/analytics", icon: BarChart3, label: "Analytics", testid: "nav-analytics" },
            { to: "/settings", icon: Settings, label: "Settings", testid: "nav-settings" },
          ].map(({ to, icon: Icon, label, testid }) => (
            <Link key={to} to={to} className="p-2 rounded-lg hover:bg-indigo-500/10 text-[#6B7280] hover:text-[#4F46E5] transition-colors" data-testid={testid} aria-label={label} title={label}>
              <Icon className="w-4 h-4" />
            </Link>
          ))}
          <NotificationsDropdown />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/5 ml-2">
            <span className="text-base">{AVATARS[user?.avatar] || "🦉"}</span>
            <span className="text-sm font-medium text-[#1A1A2E] hidden sm:block">{user?.name?.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} className="p-2 rounded-lg hover:bg-red-500/10 text-[#6B7280] hover:text-red-400 transition-colors ml-1" data-testid="nav-logout" aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    lessons, setLessons, setBreathingActive, settings, focusMode,
    tourCompleted, setTourActive, quizCountSinceReport, teacherMessages,
  } = useAppStore();
  const { isJunior, isSenior, headingFont, bodyFont } = useGradeTheme();
  const { enrolledClass, teacher, fetchEnrolledClass } = useClassStore();
  const { assignments, fetchStudentAssignments } = useAssignmentStore();
  const [loading, setLoading] = useState(true);
  const [showCompanion, setShowCompanion] = useState(false);
  const [showEmotion, setShowEmotion] = useState(false);
  const [showSoundscape, setShowSoundscape] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [dueReviews, setDueReviews] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatUserId, setChatUserId] = useState(null);
  const [chatUserName, setChatUserName] = useState("");

  useEffect(() => {
    setHapticIntensity(settings.hapticIntensity || "medium");
  }, [settings.hapticIntensity]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, reviewsRes] = await Promise.all([
          api.get("/lessons"),
          api.get("/spaced-repetition/due").catch(() => ({ data: { due_reviews: [] } })),
        ]);
        setLessons(lessonsRes.data.lessons || []);
        setDueReviews(reviewsRes.data.due_reviews || []);
        // Fetch class and assignments in parallel (non-blocking)
        fetchEnrolledClass().catch(() => {});
        fetchStudentAssignments().catch(() => {});
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [setLessons, fetchEnrolledClass, fetchStudentAssignments]);

  // Auto-launch tour for first-time users
  useEffect(() => {
    if (!loading && !tourCompleted && !localStorage.getItem("neuralearn_tour_done")) {
      setTimeout(() => setTourActive(true), 1500);
    }
  }, [loading, tourCompleted, setTourActive]);

  // Show mood picker every 3 quizzes
  useEffect(() => {
    if (quizCountSinceReport >= 3) setShowMoodPicker(true);
  }, [quizCountSinceReport]);

  // Teacher message toasts
  useEffect(() => {
    if (teacherMessages.length > 0) {
      const msg = teacherMessages[0];
      toast(msg.text || "New message from your teacher", {
        description: msg.from ? `From: ${msg.from}` : undefined,
        duration: 6000,
      });
    }
  }, [teacherMessages]);

  const handleLogout = async () => {
    await logout();
    toast.success("You've been signed out. See you soon! 👋", { duration: 3000 });
    navigate("/");
  };
  const handleMoodClose = useCallback((mood, mismatch) => {
    setShowMoodPicker(false);
    if (mismatch && mood) {
      toast(isJunior
        ? `Neura noticed a mood mismatch! Taking a break might help 💙`
        : `Mood mismatch detected. Self-report: ${mood?.label}. Adjusting pacing.`,
        { duration: 5000 }
      );
    }
  }, [isJunior]);

  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const streak = user?.streak || 0;
  const xpProgress = Math.min(xp % 100, 100);
  const subjectColors = isJunior ? SUBJECT_COLORS_JR : SUBJECT_COLORS_SR;
  const filteredLessons = subjectFilter === "all" ? lessons : lessons.filter((l) => l.subject === subjectFilter);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${isSenior ? "bg-[#FAFAFA]" : "bg-[#FAFAFA]"}`}>
        {isJunior ? <JuniorNav user={user} onLogout={handleLogout} /> : <SeniorNav user={user} onLogout={handleLogout} />}
        <div className="flex-1 flex items-center justify-center">
          <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${"border-[#118AB2]"}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isSenior ? "bg-[#FAFAFA]" : "bg-[#FAFAFA]"}`} data-testid="dashboard-page">
      {isJunior ? <JuniorNav user={user} onLogout={handleLogout} /> : <SeniorNav user={user} onLogout={handleLogout} />}

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* "-€ Class Info Banner "-€ */}
        <ClassInfoBanner
          enrolledClass={enrolledClass}
          teacher={teacher}
          onJoinClick={() => setShowJoinModal(true)}
          onLeave={() => {}}
          onMessageTeacher={(id, name) => { setChatUserId(id); setChatUserName(name); setShowChat(true); }}
          onViewClassmates={() => {}}
        />

        {/* "-€ Welcome Banner "-€ */}
        {isJunior ? (
          <div className="neura-card p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-r from-[#FFD166]/20 via-white to-[#C8B6FF]/20" data-testid="welcome-card">
            <img src={MASCOT_URL} alt="Neura mascot" className="w-20 h-20 object-contain float-animation shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]" style={headingFont}>
                Hey {user?.name?.split(" ")[0] || "Superstar"}! 🌟
              </h1>
              <p className="text-[#374151] mt-1 font-semibold">Ready for today's learning adventure?</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                {user?.grade_level && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#118AB2]/10 text-[#118AB2] border-2 border-[#118AB2]/30">
                    🎒 {user.grade_level.replace("class_", "Class ")}
                  </span>
                )}
                {user?.disability_type && user.disability_type !== "prefer_not_to_say" && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C8B6FF]/30 text-[#5b21b6] border-2 border-[#C8B6FF]/50">
                    ♿ {user.disability_type}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setBreathingActive(true)} className="neura-btn bg-[#C8B6FF] text-[#1A1A2E] whitespace-nowrap shrink-0" data-testid="breathing-btn">
              <Wind className="w-5 h-5" /> Breathe
            </button>
          </div>
        ) : (
          <div className="neura-card p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-center gap-5" data-testid="welcome-card"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(17,24,39,0.8) 100%)" }}>
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Brain className="w-7 h-7 text-[#4F46E5]" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A2E]" style={headingFont}>
                Welcome back, {user?.name?.split(" ")[0] || "Learner"}
              </h1>
              <p className="text-[#6B7280] mt-0.5 text-sm">Your adaptive learning session is ready.</p>

              <div className="flex flex-wrap gap-2 mt-2">
                {user?.grade_level && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded border border-indigo-500/40 text-[#4F46E5] bg-indigo-500/10">
                    {user.grade_level.replace("class_", "Class ")}
                  </span>
                )}
                {user?.disability_type && user.disability_type !== "prefer_not_to_say" && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded border border-violet-500/40 text-violet-600 bg-violet-500/10">
                    ♿ {user.disability_type}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setBreathingActive(true)} className="neura-btn bg-indigo-600/10 text-[#4F46E5] border-indigo-500/30 whitespace-nowrap shrink-0" data-testid="breathing-btn">
              <Wind className="w-4 h-4" /> Breathe
            </button>
          </div>
        )}

        {/* ── Stats Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" data-testid="stats-grid">
          {[
            { icon: Zap,      label: "XP",      value: xp,     color: isJunior ? "text-[#118AB2]" : "text-indigo-600",  bg: isJunior ? "bg-[#118AB2]/10" : "bg-indigo-500/10" },
            { icon: Flame,    label: "Streak",  value: `${streak}d`, color: isJunior ? "text-[#EF476F]" : "text-red-500", bg: isJunior ? "bg-[#EF476F]/10" : "bg-red-500/10" },
            { icon: Trophy,   label: "Level",   value: level,  color: isJunior ? "text-[#b8860b]" : "text-amber-500",   bg: isJunior ? "bg-[#FFD166]/20" : "bg-amber-500/10" },
            { icon: Target,   label: "Reviews", value: dueReviews.length, color: isJunior ? "text-[#065f46]" : "text-emerald-600", bg: isJunior ? "bg-[#06D6A0]/10" : "bg-emerald-500/10" },
          ].map((stat) => (
            <div key={stat.label} className={`neura-card p-4 flex flex-col gap-1 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <p className={`text-2xl font-bold ${stat.color}`} style={headingFont}>{stat.value}</p>
              <p className="text-xs font-semibold text-[#6B7280]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── XP Progress ────────────────────────────────────────────────── */}
        <div className="neura-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[#0F172A]">Level {level} Progress</span>
            <span className={`text-sm font-bold ${isJunior ? "text-[#118AB2]" : "text-indigo-600"}`}>{xp % 100}/100 XP</span>
          </div>
          <Progress value={xpProgress} className="h-3" />
        </div>

        {/* ── Assignments ────────────────────────────────────────────────── */}
        <AssignmentsList />

        {/* ── Spaced Review Alert ────────────────────────────────────────── */}
        {dueReviews.length > 0 && (
          <div className={`neura-card p-4 mb-6 flex items-center gap-3 ${isJunior ? "bg-[#FFD166]/10 border-[#FFD166]" : "bg-amber-500/10 border-amber-500/30"}`}>
            <RefreshCw className={`w-5 h-5 shrink-0 ${isJunior ? "text-[#b8860b]" : "text-amber-500"}`} />
            <div className="flex-1">
              <p className={`font-bold text-sm ${isJunior ? "text-[#b8860b]" : "text-amber-600"}`}>
                {isJunior ? `🔁 ${dueReviews.length} lesson${dueReviews.length > 1 ? "s" : ""} ready for review!` : `${dueReviews.length} spaced review${dueReviews.length > 1 ? "s" : ""} due`}
              </p>
              <p className="text-xs text-[#6B7280]">{dueReviews[0]?.lesson?.title}</p>
            </div>
            {dueReviews[0]?.lesson_id && (
              <Link to={`/lesson/${dueReviews[0].lesson_id}`}>
                <button className={`neura-btn text-xs h-9 px-3 ${isJunior ? "bg-[#FFD166] text-[#1A1A2E]" : "bg-amber-500 text-white border-amber-400"}`}>
                  Review <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            )}
          </div>
        )}

        {/* ── AI Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setShowCompanion((v) => !v)}
            className={`neura-btn text-sm h-10 px-4 ${showCompanion ? (isJunior ? "bg-[#118AB2] text-white" : "bg-indigo-600 text-white") : "bg-white text-[#374151]"}`}
            data-testid="companion-toggle-btn"
          >
            <Sparkles className="w-4 h-4" /> {isJunior ? "Neura" : "Companion"}
          </button>
          <button
            onClick={() => setShowTutor((v) => !v)}
            className={`neura-btn text-sm h-10 px-4 ${showTutor ? (isJunior ? "bg-[#C8B6FF] text-[#1A1A2E]" : "bg-violet-600 text-white") : "bg-white text-[#374151]"}`}
            data-testid="tutor-toggle-btn"
          >
            <Bot className="w-4 h-4" /> {isJunior ? "AI Tutor" : "Tutor"}
          </button>
          <button
            onClick={() => setShowEmotion((v) => !v)}
            className={`neura-btn text-sm h-10 px-4 ${showEmotion ? (isJunior ? "bg-[#EF476F] text-white" : "bg-red-500 text-white") : "bg-white text-[#374151]"}`}
            data-testid="emotion-toggle-btn"
          >
            <Camera className="w-4 h-4" /> {isJunior ? "Mood Cam" : "Emotion"}
          </button>
          <button
            onClick={() => setShowSoundscape((v) => !v)}
            className={`neura-btn text-sm h-10 px-4 ${showSoundscape ? (isJunior ? "bg-[#FFD166] text-[#1A1A2E]" : "bg-amber-500 text-white") : "bg-white text-[#374151]"}`}
            data-testid="soundscape-toggle-btn"
          >
            <Music className="w-4 h-4" /> {isJunior ? "Sounds" : "Soundscape"}
          </button>
          <button
            onClick={() => setShowRoadmap((v) => !v)}
            className={`neura-btn text-sm h-10 px-4 ${showRoadmap ? (isJunior ? "bg-[#06D6A0] text-[#1A1A2E]" : "bg-emerald-600 text-white") : "bg-white text-[#374151]"}`}
            data-testid="roadmap-toggle-btn"
          >
            <Map className="w-4 h-4" /> {isJunior ? "Roadmap" : "Study Map"}
          </button>
          <FocusModeToggle />
        </div>

        {/* ── Lessons Section ────────────────────────────────────────────── */}
        <div data-testid="lessons-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold ${isJunior ? "text-xl text-[#1A1A2E]" : "text-lg text-[#1A1A2E]"}`} style={headingFont}>
              {isJunior ? "📚 Your Lessons" : "Lessons"}
            </h2>
            {/* Subject filter */}
            <div className="flex gap-1.5">
              {["all", "mathematics", "science", "english"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-2 transition-all capitalize ${
                    subjectFilter === s
                      ? isJunior ? "bg-[#118AB2] text-white border-[#0F172A]" : "bg-indigo-600 text-white border-indigo-500"
                      : "bg-white text-[#374151] border-[#e2e8f0] hover:border-[#0F172A]"
                  }`}
                >
                  {s === "all" ? "All" : s === "mathematics" ? "Math" : s === "social_studies" ? "Social" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredLessons.length === 0 ? (
            <div className="neura-card p-12 text-center">
              <BookOpen className="w-12 h-12 text-[#94a3b8] mx-auto mb-3" />
              <p className="text-[#6B7280] font-semibold">
                {isJunior ? "No lessons yet! Check back soon 🌟" : "No lessons available for this filter."}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLessons.map((lesson) => {
                const sc = subjectColors[lesson.subject] || (isJunior
                  ? { bg: "bg-[#f1f5f9]", border: "border-[#e2e8f0]", text: "text-[#374151]", label: lesson.subject }
                  : { bg: "bg-[#f1f5f9]", border: "border-[#E5E7EB]", text: "text-[#6B7280]", label: lesson.subject });
                return (
                  <Link key={lesson.id} to={`/lesson/${lesson.id}`} data-testid={`lesson-card-${lesson.id}`}>
                    <div className={`neura-card p-5 h-full flex flex-col gap-3 hover:shadow-lg transition-all cursor-pointer ${sc.bg} border-2 ${sc.border}`}>
                      <div className="flex items-start justify-between">
                        <Badge className={`border-2 border-[#0F172A] text-xs font-bold ${sc.bg} ${sc.text}`}>
                          {sc.label}
                        </Badge>
                        <span className="text-xs font-bold text-[#6B7280]">{lesson.grade?.replace("_", " ")}</span>
                      </div>
                      <h3 className={`font-bold text-[#0F172A] leading-snug ${isJunior ? "text-base" : "text-sm"}`} style={headingFont}>
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] line-clamp-2 flex-1">{lesson.introduction}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.quiz?.length || 0} questions</span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-bold ${isJunior ? "text-[#118AB2]" : "text-indigo-600"}`}>
                          Start <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Focus Mode Overlay ─────────────────────────────────────────────── */}
      <FocusModeOverlay />

      {/* ── Floating Panels ────────────────────────────────────────────────── */}
      {showCompanion && <AICompanion onClose={() => setShowCompanion(false)} />}
      {showEmotion   && <EmotionDetector onClose={() => setShowEmotion(false)} />}
      {showSoundscape && <SoundscapePanel onClose={() => setShowSoundscape(false)} />}
      {showTutor     && <AITutor onClose={() => setShowTutor(false)} />}
      {showRoadmap   && <StudyRoadmap onClose={() => setShowRoadmap(false)} />}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showMoodPicker && <MoodPicker onClose={handleMoodClose} />}
      {showJoinModal  && <JoinClassModal onClose={() => setShowJoinModal(false)} onJoined={() => { setShowJoinModal(false); fetchEnrolledClass(); }} />}
      {showChat && chatUserId && (
        <MessageChat
          toUserId={chatUserId}
          toUserName={chatUserName}
          onClose={() => { setShowChat(false); setChatUserId(null); setChatUserName(""); }}
        />
      )}

      {/* ── Always-on utilities ────────────────────────────────────────────── */}
      <VoiceNav />
      <VirtualTour />
      <OfflineIndicator />
      <AccessibilityBot />
    </div>
  );
}
