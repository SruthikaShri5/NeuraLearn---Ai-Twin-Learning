import { useEffect, useState, useCallback, useRef } from "react";
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
import AITutor from "@/components/AITutor";
import OfflineIndicator from "@/components/OfflineIndicator";
import AccessibilityBot from "@/components/AccessibilityBot";
import VirtualTour from "@/components/VirtualTour";
import MoodPicker from "@/components/MoodPicker";
import StudyRoadmap from "@/components/StudyRoadmap";
import VoiceNav from "@/components/VoiceNav";
import Leaderboard from "@/components/Leaderboard";
import AchievementsPanel from "@/components/AchievementsPanel";
import { FocusModeToggle, FocusModeOverlay } from "@/components/FocusMode";
import { setHapticIntensity, vibrate } from "@/lib/haptics";
import { toast } from "sonner";
import { speak } from "@/lib/tts";
import ClassInfoBanner from "@/components/ClassInfoBanner";
import AssignmentsList from "@/components/AssignmentsList";
import JoinClassModal from "@/components/JoinClassModal";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import MessageChat from "@/components/MessageChat";
import { useClassStore } from "@/lib/classStore";
import { useAssignmentStore } from "@/lib/assignmentStore";
import {
  Brain, BookOpen, BarChart3, Settings, LogOut, Trophy,
  Zap, ArrowRight, Wind, Bot, Camera, Music,
  Clock, RefreshCw, Sparkles, Map,
  Award, Target, Flame, ChevronDown, Lightbulb
} from "lucide-react";

const AVATARS = {
  owl: "🦉", fox: "🦊", bunny: "🐰", bear: "🐻", cat: "🐱", dog: "🐶",
  panda: "🐼", unicorn: "🦄", dragon: "🐉", dolphin: "🐬", star: "⭐", rocket: "🚀",
};

const SUBJECT_COLORS_JR = {
  mathematics: { bg: "bg-[#FFD166]/20", border: "border-[#FFD166]", text: "text-[#b8860b]", label: "Math" },
  science:     { bg: "bg-[#06D6A0]/20", border: "border-[#06D6A0]", text: "text-[#065f46]", label: "Science" },
  english:     { bg: "bg-[#C8B6FF]/20", border: "border-[#C8B6FF]", text: "text-[#5b21b6]", label: "English 📖" },
  social_studies: { bg: "bg-[#FFD6BA]/30", border: "border-[#FFD6BA]", text: "text-[#9a3412]", label: "Social 🌍" },
  evs:         { bg: "bg-[#06D6A0]/10", border: "border-[#06D6A0]", text: "text-[#065f46]", label: "EVS 🌱" },
  computer_science: { bg: "bg-[#118AB2]/10", border: "border-[#118AB2]", text: "text-[#118AB2]", label: "CS 💻" },
  information_tech: { bg: "bg-[#118AB2]/10", border: "border-[#118AB2]", text: "text-[#118AB2]", label: "IT 🖥️" },
};
const SUBJECT_COLORS_SR = {
  mathematics: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600", label: "Mathematics" },
  science:     { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600", label: "Science" },
  english:     { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-700", label: "English" },
  social_studies: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-600", label: "Social Studies" },
  physics:     { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-700", label: "Physics" },
  chemistry:   { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-600", label: "Chemistry" },
  biology:     { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-700", label: "Biology" },
  computer_science: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-700", label: "Computer Science" },
  information_tech: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-700", label: "Info Tech" },
};

// "-€ Junior NavBar "-----------------------------------------------------------€
function JuniorNav({ user, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-[3px] border-[#1A1A2E]" data-testid="dashboard-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2" data-testid="dashboard-logo">
          <div className="w-8 h-8 rounded-xl bg-[#118AB2] flex items-center justify-center border-2 border-[#1A1A2E]">
            <Brain className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: "Fredoka, sans-serif" }}>NeuraLearn</span>
          <span className="hidden sm:block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD166] text-[#1A1A2E] border-2 border-[#1A1A2E]">
            {user?.grade_level?.replace("class_", "Class ")}
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/knowledge-graph" className="p-1.5 rounded-xl hover:bg-[#f1f5f9] text-[#374151]" data-testid="nav-knowledge-graph" aria-label="Knowledge Graph" title="Knowledge Graph">
            <Map className="w-4 h-4" />
          </Link>
          <Link to="/analytics" className="p-1.5 rounded-xl hover:bg-[#f1f5f9] text-[#374151]" data-testid="nav-analytics" aria-label="Analytics" title="Analytics">
            <BarChart3 className="w-4 h-4" />
          </Link>
          <NotificationsDropdown />
          <Link to="/settings" className="p-1.5 rounded-xl hover:bg-[#f1f5f9] text-[#374151]" data-testid="nav-settings" aria-label="Settings" title="Settings">
            <Settings className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-[#1A1A2E] bg-white ml-1">
            <span className="text-base">{AVATARS[user?.avatar] || "🦉"}</span>
            <span className="font-bold text-xs text-[#1A1A2E] hidden sm:block">{user?.name?.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} className="p-1.5 rounded-xl hover:bg-[#EF476F]/10 text-[#6B7280] hover:text-[#EF476F]" data-testid="nav-logout" aria-label="Logout">
            <LogOut className="w-4 h-4" />
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

const ACHIEVEMENT_META = {
  first_lesson:     { emoji: "🎉", label: "First Lesson!" },
  perfect_score:    { emoji: "💯", label: "Perfect Score!" },
  streak_3:         { emoji: "🔥", label: "3-Day Streak" },
  streak_7:         { emoji: "🏆", label: "7-Day Streak" },
  streak_30:        { emoji: "👑", label: "30-Day Streak" },
  speed_learner:    { emoji: "⚡", label: "Speed Learner" },
  knowledge_seeker: { emoji: "📚", label: "Knowledge Seeker" },
  master_mind:      { emoji: "🧠", label: "Master Mind" },
  no_hints:         { emoji: "💡", label: "Independent Thinker" },
  comeback_kid:     { emoji: "💪", label: "Comeback Kid" },
};

function AchievementsCard({ achievements, isJunior, headingFont }) {
  const earned = achievements || [];
  if (earned.length === 0) return (
    <div className="neura-card p-4" data-testid="achievements-empty">
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-5 h-5 text-[#FFD166]" />
        <h3 className="font-bold text-[#0F172A]" style={headingFont}>Achievements</h3>
      </div>
      <p className="text-xs text-[#6B7280] text-center py-3">
        {isJunior ? "Complete quizzes to earn badges! 🏅" : "Complete lessons to unlock achievements."}
      </p>
    </div>
  );
  return (
    <div className="neura-card p-4" data-testid="achievements-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FFD166]" />
          <h3 className="font-bold text-[#0F172A]" style={headingFont}>Achievements</h3>
        </div>
        <span className="text-xs font-bold text-[#6B7280]">{earned.length} earned</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {earned.map((id) => {
          const meta = ACHIEVEMENT_META[id] || { emoji: "🏅", label: id.replace(/_/g, " ") };
          return (
            <div key={id} title={meta.label}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFD166]/20 border border-[#FFD166] text-xs font-bold text-[#b8860b]"
            >
              {meta.emoji} {meta.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubjectGroupCard({ subject, lessons, colors, headingFont, isExpanded, onToggle, isSenior }) {
  return (
    <div className={`overflow-hidden ${ isSenior ? "rounded-xl border border-[#E5E7EB] bg-white" : "neura-card bg-white"}`} data-testid={`subject-group-${subject}`}>
      <button
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${ isSenior ? "hover:bg-[#F8FAFC]" : "hover:bg-[#f8fafc]"}`}
        onClick={() => onToggle(subject)}
        aria-expanded={isExpanded}
        data-testid={`expand-${subject}`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`text-xs font-semibold px-3 py-1 rounded ${
            isSenior
              ? `${colors.bg} ${colors.text} border ${colors.border}`
              : `font-black rounded-full border-2 border-[#1A1A2E] ${colors.bg} ${colors.text}`
          }`}>
            {colors.label}
          </span>
          <span className={`text-xs text-[#6B7280] ${ isSenior ? "" : "font-bold text-[#1A1A2E]"}`}>
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#374151] shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
      </button>
      {isExpanded && (
        <div className="flex flex-col gap-2 px-4 pb-4 border-t border-[#e2e8f0] pt-3 max-h-72 overflow-y-auto">
          {lessons.map((lesson) => (
            <Link key={lesson.id} to={`/lesson/${lesson.id}`} data-testid={`lesson-card-${lesson.id}`}>
              <div className={`p-3 flex flex-col gap-1.5 transition-all cursor-pointer ${
                isSenior
                  ? "rounded-lg border border-[#E5E7EB] hover:border-[#118AB2] bg-[#FAFAFA] hover:bg-white"
                  : "rounded-xl border-2 border-[#e2e8f0] hover:border-[#118AB2] bg-[#FAFAFA] hover:bg-white"
              }`}>
                <h3 className={`text-[#0F172A] leading-snug ${ isSenior ? "text-sm font-medium" : "font-bold text-sm"}`} style={headingFont}>
                  {lesson.title}
                </h3>
                <p className="text-xs text-[#374151] line-clamp-2 leading-relaxed">{lesson.introduction}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Clock className="w-3 h-3" /> {lesson.quiz?.length || 0} questions
                  </span>
                  <span className={`text-xs font-medium ${ isSenior ? "text-indigo-600" : "font-bold text-[#118AB2]"}`}>
                    Start <ArrowRight className="w-3 h-3 inline" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const {
    lessons, setLessons, setBreathingActive, settings, focusMode,
    tourCompleted, setTourActive, quizCountSinceReport, teacherMessages,
  } = useAppStore();
  const { isJunior, isSenior, headingFont, bodyFont } = useGradeTheme();
  const { enrolledClass, teacher, fetchEnrolledClass } = useClassStore();
  const { assignments, fetchStudentAssignments } = useAssignmentStore();

  // Declare early so useEffects below can safely reference it
  const disability = user?.disability_type || "prefer_not_to_say";

  const [loading, setLoading] = useState(true);
  const [showCompanion, setShowCompanion] = useState(false);
  const [showEmotion, setShowEmotion] = useState(false);
  const [showSoundscape, setShowSoundscape] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [dueReviews, setDueReviews] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatUserId, setChatUserId] = useState(null);
  const [chatUserName, setChatUserName] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Listen for XP updates from Focus Mode
  useEffect(() => {
    const handler = (e) => { if (e.detail) updateUser(e.detail); };
    window.addEventListener("neura-xp-update", handler);
    return () => window.removeEventListener("neura-xp-update", handler);
  }, [updateUser]);

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
        fetchEnrolledClass().catch(() => {});
        fetchStudentAssignments().catch(() => {});
        api.get("/recommendations").then(r => setRecommendations(r.data.recommendations || [])).catch(() => {});
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [setLessons, fetchEnrolledClass, fetchStudentAssignments]);

  // Auto-launch tour after onboarding OR for first-time users
  useEffect(() => {
    if (loading) return;
    const launchNow = sessionStorage.getItem("neuralearn_launch_tour");
    if (launchNow) {
      sessionStorage.removeItem("neuralearn_launch_tour");
      setTimeout(() => setTourActive(true), 1200);
    } else if (!tourCompleted && !localStorage.getItem("neuralearn_tour_done")) {
      setTimeout(() => setTourActive(true), 1500);
    }
  }, [loading, tourCompleted, setTourActive]);

  // Student heartbeat for live classroom
  useEffect(() => {
    if (!user || user.role !== "student") return;
    const interval = setInterval(() => {
      api.post("/student/heartbeat").catch(() => {});
    }, 60000);
    // Ping immediately on mount
    api.post("/student/heartbeat").catch(() => {});
    return () => clearInterval(interval);
  }, [user]);

  // Audio-first greeting for visual disability
  useEffect(() => {
    if (loading || disability !== "visual") return;
    
    const hasGreeted = sessionStorage.getItem("neuralearn_greeted");
    if (!hasGreeted) {
      const greeting = `Welcome back, ${user?.name?.split(" ")[0]}. I've activated your audio-first experience. What would you like to do? You can say: Continue lesson, Explain topic, Start quiz, or Ask a question.`;
      speak(greeting);
      sessionStorage.setItem("neuralearn_greeted", "1");
    }
  }, [loading, disability, user?.name]);

  // Show mood picker every 3 quizzes
  useEffect(() => {
    if (quizCountSinceReport >= 3) setShowMoodPicker(true);
  }, [quizCountSinceReport]);

  // Teacher message toasts — show each message only once
  const shownMsgIds = useRef(new Set());
  useEffect(() => {
    if (!teacherMessages.length) return;
    teacherMessages.forEach((msg) => {
      const id = msg.id || msg.text;
      if (!shownMsgIds.current.has(id)) {
        shownMsgIds.current.add(id);
        toast(msg.text || "New message from your teacher", {
          description: msg.from ? `From: ${msg.from}` : undefined,
          duration: 6000,
        });
      }
    });
  }, [teacherMessages]);

  const handleLogout = async () => {
    // Clear all local state before navigating
    sessionStorage.clear();
    localStorage.removeItem("access_token");
    await logout();
    toast.success("You've been signed out. See you soon! 👋", { duration: 3000 });
    navigate("/", { replace: true });
  };
  const handleMoodClose = useCallback((mood, mismatch) => {
    setShowMoodPicker(false);
    useAppStore.getState().resetQuizCount();
    if (mismatch && mood) {
      toast(
        isJunior
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
  
  // Safety check for lessons being an array
  const safeLessons = Array.isArray(lessons) ? lessons : [];

  const dashboardContainerClass = [
    "min-h-screen",
    disability === "visual" ? "disability-visual" : "",
    disability === "dyslexia" ? "disability-dyslexia" : "",
    isSenior ? "bg-[#FAFAFA]" : "bg-[#FAFAFA]"
  ].filter(Boolean).join(" ");

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
    <div className={dashboardContainerClass} data-testid="dashboard-page">
      {isJunior ? <JuniorNav user={user} onLogout={handleLogout} /> : <SeniorNav user={user} onLogout={handleLogout} />}

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Disability Mode Banner ─────────────────────────────────── */}
        {disability && disability !== "prefer_not_to_say" && (
          <div className="mb-4 rounded-2xl px-4 py-3 border-2 flex items-center gap-3"
            style={{
              background: disability === "visual"    ? "#0c1a2e" :
                          disability === "hearing"   ? "#0d2b1f" :
                          disability === "motor"     ? "#1a1200" :
                          disability === "cognitive" ? "#1a0a2e" :
                          disability === "speech"    ? "#0d1f2b" : "#1a1a2e",
              borderColor: disability === "visual"    ? "#118AB2" :
                           disability === "hearing"   ? "#06D6A0" :
                           disability === "motor"     ? "#FFD166" :
                           disability === "cognitive" ? "#C8B6FF" :
                           disability === "speech"    ? "#EF476F" : "#ffffff",
            }}>
            <span className="text-xl">
              {disability === "visual" ? "👁️" : disability === "hearing" ? "👂" : disability === "motor" ? "🖐️" : disability === "cognitive" ? "🧠" : disability === "speech" ? "💬" : "♿"}
            </span>
            <div>
              <p className="font-bold text-sm capitalize" style={{ color: "#ffffff" }}>
                {disability.replace(/_/g, " ")} Mode Active
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                {disability === "visual"    ? "Auto read-aloud on. Use R to read, voice commands enabled." :
                 disability === "hearing"   ? "Visual-only mode. No audio required. Icons guide each step." :
                 disability === "motor"     ? "Large tap targets active. Press 1-4 to answer quiz questions." :
                 disability === "cognitive" ? "Bite-sized steps mode. One concept at a time with hints." :
                 disability === "speech"    ? "Text-only mode. No speaking required." : "Adaptive mode active."}
              </p>
            </div>
          </div>
        )}

        {/* Class Info Banner */}
        <ClassInfoBanner
          enrolledClass={enrolledClass} teacher={teacher}
          onJoinClick={() => setShowJoinModal(true)} onLeave={() => {}}
          onMessageTeacher={(id, name) => { setChatUserId(id); setChatUserName(name); setShowChat(true); }}
          onViewClassmates={() => {}}
        />

        {/* ── Welcome Card ──────────────────────────────────────────── */}
        <div data-testid="welcome-card" className={`mb-5 overflow-hidden ${
          isSenior ? "rounded-xl border border-[#E5E7EB]" : "rounded-2xl border border-[#1A1A2E]/30"
        }`} style={{
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          background: isSenior
            ? "linear-gradient(135deg, #f8faff 0%, #ffffff 60%, #f0fff8 100%)"
            : isJunior
            ? "linear-gradient(135deg, #e0f7ff 0%, #fff9e6 50%, #e6fff5 100%)"
            : "linear-gradient(135deg, #f0f4ff 0%, #fafafa 60%, #f0fff8 100%)"
        }}>
          <div className="p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative shrink-0">
              <div className={`flex items-center justify-center text-4xl border ${
                isSenior ? "w-14 h-14 rounded-xl border-[#E5E7EB]" : "w-20 h-20 rounded-2xl border-[#1A1A2E]/30"
              }`} style={{ background: "linear-gradient(135deg, #118AB2 0%, #06D6A0 100%)", boxShadow: "0 2px 8px rgba(17,138,178,0.2)" }}>
                {AVATARS[user?.avatar] || "🦩"}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#06D6A0] border-2 border-white flex items-center justify-center text-[10px]">✓</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className={`text-[#1A1A2E] mb-1 ${ isSenior ? "text-lg font-semibold" : "text-xl font-black"}`} style={headingFont}>
                {isSenior ? `Welcome back, ${user?.name?.split(" ")[0] || "there"}` : `Hey ${user?.name?.split(" ")[0] || "Superstar"}! 🌟`}
              </h1>
              <p className="text-sm text-[#6B7280] mb-3">
                {isJunior ? "Ready for today's learning adventure? 🚀" : "Your personalised learning session awaits."}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {isSenior ? (
                  <>
                    <span className="text-xs font-medium px-2.5 py-1 rounded border border-indigo-200 bg-indigo-50 text-indigo-700">{user?.learning_profile?.learning_style || "Visual"} learner</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-600">{user?.disability_type?.replace(/_/g, " ") || "Standard"} mode</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-700">{user?.learning_profile?.content_complexity || "Medium"} complexity</span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full border-2 border-[#118AB2] bg-[#118AB2] text-white uppercase tracking-wide">{user?.learning_profile?.learning_style || "Visual"} Learner</span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full border-2 border-[#EF476F] bg-[#EF476F] text-white uppercase tracking-wide">{user?.disability_type?.replace(/_/g, " ") || "Standard"} Mode</span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full border-2 border-[#06D6A0] bg-[#06D6A0] text-white uppercase tracking-wide">{user?.learning_profile?.content_complexity || "Medium"} Level</span>
                  </>
                )}
              </div>
            </div>
            <button onClick={() => setBreathingActive(true)}
              className={`shrink-0 inline-flex flex-col items-center gap-1 font-bold text-[#1A1A2E] transition-all ${
                isSenior ? "px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC] text-sm" : "px-5 py-3 rounded-2xl border border-[#1A1A2E]/30 bg-white hover:bg-[#f1f5f9]"
              }`} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }} data-testid="breathing-btn">
              <Wind className="w-5 h-5 text-[#118AB2]" />
              <span className="text-xs">Breathe</span>
            </button>
          </div>
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #118AB2, #06D6A0, #FFD166, #EF476F)" }} />
        </div>

        {/* ── Stats Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-5" data-testid="stats-grid">
          {[
            { icon: Zap,    label: "XP",      value: xp,                color: "text-[#118AB2]", srColor: "text-indigo-600" },
            { icon: Flame,  label: "Streak",  value: `${streak}d`,      color: "text-[#EF476F]", srColor: "text-rose-500" },
            { icon: Trophy, label: "Level",   value: level,             color: "text-[#b8860b]", srColor: "text-amber-600" },
            { icon: Target, label: "Reviews", value: dueReviews.length, color: "text-[#06D6A0]", srColor: "text-emerald-600" },
          ].map((stat) => (
            <div key={stat.label} className={`p-4 flex flex-col gap-1.5 ${
              isSenior ? "rounded-xl border border-[#E5E7EB] bg-white" : "neura-card bg-white"
            }`}>
              <stat.icon className={`w-5 h-5 ${ isSenior ? stat.srColor : stat.color}`} />
              <p className={`text-2xl font-bold ${ isSenior ? stat.srColor : stat.color}`} style={headingFont}>{stat.value}</p>
              <p className={`text-xs uppercase tracking-wider ${ isSenior ? "text-[#9CA3AF] font-medium" : "text-[#64748B] font-semibold"}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── XP Progress ───────────────────────────────────────────── */}
        <div className={`mb-5 p-5 ${
          isSenior ? "rounded-xl border border-[#E5E7EB] bg-white" : "rounded-2xl border border-[#1A1A2E]/20 bg-white"
        }`} style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center ${ isSenior ? "w-7 h-7 rounded-md bg-amber-100 border border-amber-200" : "w-8 h-8 rounded-lg bg-[#FFD166] border border-[#1A1A2E]/20"}`}>
                <Zap className={`w-4 h-4 ${ isSenior ? "text-amber-600" : "text-[#1A1A2E]"}`} />
              </div>
              <span className={`${ isSenior ? "text-sm font-medium text-[#374151]" : "text-base font-black text-[#1A1A2E]"}`}>Level {level} Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold ${ isSenior ? "text-sm text-indigo-600" : "text-base text-[#118AB2]"}`}>{xp % 100}</span>
              <span className="text-sm text-[#9CA3AF]">/ 100 XP</span>
              {xpProgress >= 80 && <span>🔥</span>}
            </div>
          </div>
          <div className={`w-full rounded-full overflow-hidden bg-[#f1f5f9] ${ isSenior ? "h-2" : "h-4 border border-[#e2e8f0]"}`}>
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${xpProgress}%`,
              background: xpProgress >= 80 ? "linear-gradient(90deg,#FFD166,#EF476F)" : xpProgress >= 50 ? "linear-gradient(90deg,#118AB2,#06D6A0)" : "linear-gradient(90deg,#118AB2,#C8B6FF)",
              minWidth: xpProgress > 0 ? "0.5rem" : "0",
            }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[#9CA3AF]">Lvl {level}</span>
            <span className="text-xs text-[#9CA3AF]">Lvl {level + 1}</span>
          </div>
        </div>

        {/* ── AI Tools Row ───────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { label: "Neura",      icon: Sparkles, active: showCompanion, onClick: () => setShowCompanion(v => !v), testid: "companion-toggle-btn" },
            { label: "AI Tutor",   icon: Bot,      active: showTutor,     onClick: () => setShowTutor(v => !v),     testid: "tutor-toggle-btn" },
            { label: "Mood Cam",   icon: Camera,   active: showEmotion,   onClick: () => setShowEmotion(v => !v),   testid: "emotion-toggle-btn" },
            { label: "Sounds",     icon: Music,    active: showSoundscape,onClick: () => setShowSoundscape(v => !v),testid: "soundscape-toggle-btn" },
            { label: "Roadmap",    icon: Map,      active: showRoadmap,   onClick: () => setShowRoadmap(v => !v),   testid: "roadmap-toggle-btn" },
            { label: isJunior ? "Ranks" : "Leaderboard",    icon: Trophy, active: false, onClick: () => setShowLeaderboard(true),  testid: "leaderboard-btn" },
            { label: isJunior ? "Badges" : "Achievements",  icon: Award,  active: false, onClick: () => setShowAchievements(true), testid: "achievements-btn" },
          ].map(({ label, icon: Icon, active, onClick, testid }) => (
            <button key={label} onClick={onClick} data-testid={testid}
              className={`inline-flex items-center gap-2 text-sm font-medium h-9 px-4 transition-all ${
                isSenior
                  ? active
                    ? "rounded-lg border border-indigo-600 bg-indigo-600 text-white"
                    : "rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:border-indigo-300 hover:text-indigo-600"
                  : active
                    ? "rounded-full border-2 border-[#1A1A2E] bg-[#1A1A2E] text-white font-semibold"
                    : "rounded-full border-2 border-[#1A1A2E] bg-white text-[#374151] hover:bg-[#f1f5f9] font-semibold"
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
          <FocusModeToggle />
        </div>

        {/* ── Two-column layout: main left, sidebar right ──────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: lessons + assignments ─────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Spaced Review Alert */}
            {dueReviews.length > 0 && (
              <div className={`p-4 mb-5 flex items-center gap-3 ${
                isSenior
                  ? "rounded-xl border border-amber-200 bg-amber-50"
                  : "neura-card bg-[#FFD166]/10 border-[#FFD166]"
              }`}>
                <RefreshCw className="w-5 h-5 text-[#b8860b] shrink-0" />
                <div className="flex-1">
                  <p className={`font-bold text-base text-[#b8860b] ${isSenior ? "" : ""}`}>
                    {isSenior ? `${dueReviews.length} lessons due for review` : `🔁 ${dueReviews.length} ready for review!`}
                  </p>
                  <p className="text-sm text-[#6B7280]">{dueReviews[0]?.lesson?.title}</p>
                </div>
                {dueReviews[0]?.lesson_id && (
                  <Link to={`/lesson/${dueReviews[0].lesson_id}`}>
                    <button className={`text-sm font-semibold h-9 px-4 ${
                      isSenior
                        ? "rounded-lg border border-amber-300 bg-white text-amber-700 hover:bg-amber-50 transition-colors"
                        : "rounded-full bg-[#FFD166] text-[#1A1A2E] border-2 border-[#1A1A2E] font-bold"
                    }`}>Review →</button>
                  </Link>
                )}
              </div>
            )}

            {/* Assignments */}
            <AssignmentsList />

            {/* Lessons Section */}
            <div data-testid="lessons-section">
              <h2 className={`mb-4 ${isSenior ? "text-base font-semibold text-[#1A1A2E] tracking-tight" : "font-bold text-lg text-[#1A1A2E]"}`} style={headingFont}>
                {isSenior ? "Your Subjects" : "📚 Your Subjects"}
              </h2>
              {safeLessons.length === 0 ? (
                <div className="neura-card p-10 text-center bg-white">
                  <BookOpen className="w-10 h-10 text-[#64748B] mx-auto mb-2" />
                  <p className="text-base text-[#6B7280]">No lessons yet! Check back soon 🌟</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 items-start">
                  {(() => {
                    const grouped = safeLessons.reduce((acc, lesson) => {
                      const subject = lesson.subject || "Other";
                      if (!acc[subject]) acc[subject] = [];
                      acc[subject].push(lesson);
                      return acc;
                    }, {});
                    return Object.entries(grouped).map(([subject, subjectLessons]) => {
                      const sc = subjectColors[subject] || { bg: "bg-[#f1f5f9]", border: "border-[#e2e8f0]", text: "text-[#374151]", label: subject };
                      return (
                        <SubjectGroupCard
                          key={subject}
                          subject={subject}
                          lessons={subjectLessons}
                          colors={sc}
                          headingFont={headingFont}
                          isExpanded={expandedSubject === subject}
                          onToggle={(s) => setExpandedSubject((prev) => (prev === s ? null : s))}
                          isSenior={isSenior}
                        />
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── sticky so it fills the height ──────────── */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-4 lg:sticky lg:top-20">

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className={`p-4 ${
                isSenior
                  ? "rounded-xl border border-indigo-200 bg-indigo-50/60"
                  : "neura-card bg-[#C8B6FF]/10 border-[#C8B6FF]"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className={`w-4 h-4 ${isSenior ? "text-indigo-500" : "text-[#7c3aed]"}`} />
                  <p className={`font-semibold text-sm ${isSenior ? "text-indigo-700" : "font-bold text-base text-[#7c3aed]"}`}>
                    {isJunior ? "✨ Neura suggests!" : "Recommended for you"}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {recommendations.slice(0, 3).map(r => (
                    <Link key={r.id} to={`/lesson/${r.id}`}
                      className={`text-sm px-3 py-2 block transition-all ${
                        isSenior
                          ? "rounded-lg border border-indigo-200 bg-white text-indigo-700 font-medium hover:border-indigo-400 hover:shadow-sm"
                          : "font-bold rounded-xl border-2 bg-white border-[#C8B6FF] text-[#7c3aed] hover:shadow-sm"
                      }`}>
                      {isSenior ? r.title : `📚 ${r.title}`}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* DNA Card */}
            {user?.learning_profile && (
              <div data-testid="dna-card" className={`p-4 ${
                isSenior
                  ? "rounded-xl border border-[#E5E7EB] bg-white"
                  : "neura-card border border-[#C8B6FF]/60"
              }`}
                style={isSenior ? {} : { background: "linear-gradient(135deg, #f5f0ff 0%, #eef9f6 100%)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🧬</span>
                  <p className={`font-semibold text-sm ${ isSenior ? "text-[#1A1A2E]" : "font-bold text-[#5b21b6]"}`} style={headingFont}>Learning Twin DNA</p>
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(6,214,160,0.15)", color: "#047857", border: "1px solid rgba(6,214,160,0.4)" }}>LIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Style",      value: user.learning_profile.learning_style || "visual",               bg: isSenior ? "bg-slate-50"   : "bg-violet-50",  border: isSenior ? "border-slate-200"   : "border-violet-200",  text: isSenior ? "text-slate-700"   : "text-violet-700" },
                    { label: "Accuracy",  value: `${Math.round(user.learning_profile.avg_quiz_accuracy || 0)}%`, bg: isSenior ? "bg-emerald-50" : "bg-emerald-50", border: isSenior ? "border-emerald-200" : "border-emerald-200", text: isSenior ? "text-emerald-700" : "text-emerald-700" },
                    { label: "Complexity",value: user.learning_profile.content_complexity || "medium",            bg: isSenior ? "bg-amber-50"   : "bg-amber-50",   border: isSenior ? "border-amber-200"   : "border-amber-200",   text: isSenior ? "text-amber-700"   : "text-amber-700" },
                    { label: "Confidence",value: user.learning_profile.confidence_level || "medium",              bg: isSenior ? "bg-blue-50"    : "bg-sky-50",     border: isSenior ? "border-blue-200"    : "border-sky-200",     text: isSenior ? "text-blue-700"    : "text-sky-700" },
                  ].map(stat => (
                    <div key={stat.label} className={`rounded-lg p-3 text-center border ${stat.bg} ${stat.border}`}>
                      <p className={`font-bold text-sm capitalize ${stat.text}`}>{stat.value}</p>
                      <p className="text-[10px] uppercase tracking-wider mt-0.5 text-[#6B7280]">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className={`mt-3 px-3 py-2 rounded-lg text-xs ${
                  isSenior
                    ? "bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151]"
                    : "border border-[#C8B6FF]/40 text-[#374151]"
                }`} style={isSenior ? {} : { background: "rgba(200,182,255,0.12)" }}>
                  🤖 <span className={`font-semibold ${ isSenior ? "text-indigo-600" : "text-[#5b21b6]"}`}>Adapting:</span>{" "}
                  {(() => {
                    const lp = user.learning_profile;
                    const complexity = lp.content_complexity || "medium";
                    const style = lp.learning_style || "visual";
                    const acc = Math.round(lp.avg_quiz_accuracy || 0);
                    if (acc === 0) return "Complete your first quiz to start personalising.";
                    if (complexity === "high") return `Excelling at ${acc}% — advanced content unlocked.`;
                    if (complexity === "low") return `Step-by-step mode active to build confidence.`;
                    if (style === "audio") return `Audio-first layout active.`;
                    if (style === "interactive") return `Interactive challenges enabled.`;
                    return `${style} layout at ${complexity} complexity — from ${acc}% accuracy.`;
                  })()}
                </div>
              </div>
            )}

            {/* Achievements mini */}
            <AchievementsCard achievements={user?.achievements} isJunior={isJunior} headingFont={headingFont} />
          </div>
        </div>
      </main>

      {/* ── Focus Mode Overlay ─────────────────────────────────────────────── */}
      <FocusModeOverlay />

      {/* ── Floating Panels ────────────────────────────────────────────────── */}
      {showCompanion && <AICompanion onClose={() => setShowCompanion(false)} />}
      {showEmotion   && <EmotionDetector onClose={() => setShowEmotion(false)} />}
      {showSoundscape && <SoundscapePanel onClose={() => setShowSoundscape(false)} />}
      {showTutor     && <AITutor onClose={() => setShowTutor(false)} />}
      {showRoadmap      && <StudyRoadmap onClose={() => setShowRoadmap(false)} userGrade={user?.grade_level} />}
      {showLeaderboard  && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showAchievements && <AchievementsPanel onClose={() => setShowAchievements(false)} />}

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
      <VirtualTour disability={disability} />
      <OfflineIndicator />
      <AccessibilityBot />
    </div>
  );
}
