import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/lib/store";
import api from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import AICompanion from "@/components/AICompanion";
import EmotionDetector from "@/components/EmotionDetector";
import SoundscapePanel from "@/components/SoundscapePanel";
import StreakFlame from "@/components/StreakFlame";
import { setHapticIntensity, vibrate } from "@/lib/haptics";
import {
  Brain, BookOpen, BarChart3, Settings, LogOut, Star, Trophy,
  Zap, ArrowRight, ChevronRight, Wind, Bot, Camera, Music,
  Clock, RefreshCw
} from "lucide-react";

const MASCOT_URL = "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/0d5a58ad11917c107d19197bb800270b2ab4affe5ac9d9ef444167284e0b11be.png";

const AVATARS = {
  owl: "🦉", fox: "🦊", bunny: "🐰", bear: "🐻", cat: "🐱", dog: "🐶",
  panda: "🐼", unicorn: "🦄", dragon: "🐉", dolphin: "🐬", star: "⭐", rocket: "🚀",
};

function NavBar({ user, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]" data-testid="dashboard-nav">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2" data-testid="dashboard-logo">
          <Brain className="w-7 h-7 text-[#118AB2]" strokeWidth={2.5} />
          <span className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>NeuraLearn</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/knowledge-graph" className="p-2 rounded-xl hover:bg-[#f1f5f9] text-[#334155]" data-testid="nav-knowledge-graph" aria-label="Knowledge Graph">
            <Brain className="w-5 h-5" />
          </Link>
          <Link to="/analytics" className="p-2 rounded-xl hover:bg-[#f1f5f9] text-[#334155]" data-testid="nav-analytics" aria-label="Analytics">
            <BarChart3 className="w-5 h-5" />
          </Link>
          <Link to="/settings" className="p-2 rounded-xl hover:bg-[#f1f5f9] text-[#334155]" data-testid="nav-settings" aria-label="Settings">
            <Settings className="w-5 h-5" />
          </Link>
          <div className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#0F172A] bg-white">
            <span className="text-lg">{AVATARS[user?.avatar] || "🦉"}</span>
            <span className="font-bold text-sm text-[#0F172A] hidden sm:block">{user?.name?.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} className="p-2 rounded-xl hover:bg-[#EF476F]/10 text-[#64748B] hover:text-[#EF476F]" data-testid="nav-logout" aria-label="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lessons, setLessons, setBreathingActive, settings } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [showCompanion, setShowCompanion] = useState(false);
  const [showEmotion, setShowEmotion] = useState(false);
  const [showSoundscape, setShowSoundscape] = useState(false);
  const [dueReviews, setDueReviews] = useState([]);

  useEffect(() => {
    // Apply haptic intensity from settings
    setHapticIntensity(settings.hapticIntensity || 'medium');
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
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [setLessons]);

  const handleLogout = async () => { await logout(); navigate("/"); };
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const streak = user?.streak || 0;
  const xpForNext = level * 100;
  const xpProgress = Math.min((xp % 100) / (xpForNext > 0 ? 1 : 1) * 100, 100);
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <NavBar user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="dashboard-page">
      <NavBar user={user} onLogout={handleLogout} />
      <main id="main-content" className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="neura-card p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-[#118AB2]/5 to-[#C8B6FF]/10" data-testid="welcome-card">
          <img src={MASCOT_URL} alt="" className="w-20 h-20 object-contain float-animation" aria-hidden="true" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Welcome back, {user?.name?.split(" ")[0] || "Learner"}!
            </h1>
            <p className="text-[#334155] mt-1">Ready to continue your learning adventure?</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user?.grade_level && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]">
                  📚 {user.grade_level.replace("_", " ")}
                </span>
              )}
              {user?.disability_type && user.disability_type !== "prefer_not_to_say" && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#C8B6FF]/30 text-[#7c3aed] border border-[#C8B6FF]">
                  ♿ {user.disability_type} support
                </span>
              )}
              {user?.learning_style && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#FFD166]/30 text-[#b8860b] border border-[#FFD166]">
                  🎯 {user.learning_style} learner
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setBreathingActive(true)} className="neura-btn bg-[#C8B6FF] text-[#0F172A] whitespace-nowrap" data-testid="breathing-btn">
            <Wind className="w-5 h-5" /> Breathe
          </button>
        </div>

        {/* Feature Toolbar */}
        <div className="flex flex-wrap gap-2 mb-8" data-testid="feature-toolbar">
          <button
            onClick={() => { setShowCompanion((v) => !v); vibrate('click'); }}
            className={`neura-btn text-sm h-10 px-4 ${showCompanion ? 'bg-[#118AB2] text-white' : 'bg-white text-[#0F172A]'}`}
            data-testid="companion-toggle-btn"
            aria-pressed={showCompanion}
          >
            <Bot className="w-4 h-4" /> AI Companion
          </button>
          <button
            onClick={() => { setShowEmotion((v) => !v); vibrate('click'); }}
            className={`neura-btn text-sm h-10 px-4 ${showEmotion ? 'bg-[#EF476F] text-white' : 'bg-white text-[#0F172A]'}`}
            data-testid="emotion-toggle-btn"
            aria-pressed={showEmotion}
          >
            <Camera className="w-4 h-4" /> Emotion Detect
          </button>
          <button
            onClick={() => { setShowSoundscape((v) => !v); vibrate('click'); }}
            className={`neura-btn text-sm h-10 px-4 ${showSoundscape ? 'bg-[#FFD166] text-[#0F172A]' : 'bg-white text-[#0F172A]'}`}
            data-testid="soundscape-toggle-btn"
            aria-pressed={showSoundscape}
          >
            <Music className="w-4 h-4" /> Soundscape
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="stats-grid">
          <div className="neura-card p-5 bg-[#FFD166]/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-[#0F172A]" strokeWidth={2.5} />
              <span className="text-sm font-bold text-[#64748B] uppercase tracking-wider">XP</span>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="xp-counter">{xp}</p>
            <Progress value={xpProgress} className="mt-2 h-2 bg-[#FFD166]/30" />
          </div>
          <div className="neura-card p-5 bg-[#EF476F]/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Streak</span>
            </div>
            <div className="flex items-center gap-2">
              <StreakFlame streak={streak} size={48} />
              <p className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="streak-counter">{streak} days</p>
            </div>
          </div>
          <div className="neura-card p-5 bg-[#118AB2]/10">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-6 h-6 text-[#118AB2]" strokeWidth={2.5} />
              <span className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Level</span>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="level-counter">{level}</p>
          </div>
          <div className="neura-card p-5 bg-[#06D6A0]/10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-[#06D6A0]" strokeWidth={2.5} />
              <span className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Badges</span>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="badge-counter">{user?.achievements?.length || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link to="/knowledge-graph" className="neura-card p-5 flex items-center gap-4 hover:shadow-[6px_6px_0px_#0F172A]" data-testid="quick-knowledge-graph">
            <div className="w-12 h-12 rounded-xl bg-[#C8B6FF] flex items-center justify-center border-2 border-[#0F172A]">
              <Brain className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#0F172A]">Knowledge Graph</p>
              <p className="text-sm text-[#64748B]">Track concepts</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#64748B]" />
          </Link>
          <Link to="/analytics" className="neura-card p-5 flex items-center gap-4 hover:shadow-[6px_6px_0px_#0F172A]" data-testid="quick-analytics">
            <div className="w-12 h-12 rounded-xl bg-[#FFD166] flex items-center justify-center border-2 border-[#0F172A]">
              <BarChart3 className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#0F172A]">Analytics</p>
              <p className="text-sm text-[#64748B]">View progress</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#64748B]" />
          </Link>
          <Link to="/settings" className="neura-card p-5 flex items-center gap-4 hover:shadow-[6px_6px_0px_#0F172A]" data-testid="quick-settings">
            <div className="w-12 h-12 rounded-xl bg-[#06D6A0]/30 flex items-center justify-center border-2 border-[#0F172A]">
              <Settings className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#0F172A]">Settings</p>
              <p className="text-sm text-[#64748B]">Customize</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#64748B]" />
          </Link>
        </div>

        {/* Due Reviews (Spaced Repetition) */}
        {dueReviews.length > 0 && (
          <div className="mb-8" data-testid="due-reviews-section">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-[#EF476F]" />
              <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Due for Review ({dueReviews.length})
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueReviews.slice(0, 3).map((review) => (
                <Link key={review.lesson_id} to={`/lesson/${review.lesson_id}`} className="block" data-testid={`review-card-${review.lesson_id}`}>
                  <div className="neura-card p-4 h-full hover:shadow-[6px_6px_0px_#0F172A] border-[#EF476F] bg-[#EF476F]/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[#EF476F]" />
                      <span className="text-xs font-bold text-[#EF476F] uppercase">Review Due</span>
                    </div>
                    <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      {review.lesson?.title || review.lesson_id}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">Last score: {review.last_score}%</p>
                    <div className="mt-2 flex items-center text-[#EF476F] font-bold text-sm">
                      Review Now <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Lessons */}
        <div data-testid="lessons-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <BookOpen className="w-5 h-5 inline mr-2" /> Available Lessons
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="block" data-testid={`lesson-card-${lesson.id}`}>
                <div className="neura-card p-5 h-full hover:shadow-[6px_6px_0px_#0F172A] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${
                      lesson.subject === 'mathematics' ? 'bg-[#FFD166] text-[#0F172A]' : 'bg-[#06D6A0]/30 text-[#0F172A]'
                    } border-2 border-[#0F172A]`}>
                      {lesson.subject === 'mathematics' ? 'Math' : 'Science'}
                    </Badge>
                    <span className="text-xs font-bold text-[#64748B] uppercase">{lesson.grade?.replace("_", " ")}</span>
                  </div>
                  <h3 className="font-bold text-[#0F172A] text-lg mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-[#334155] line-clamp-2">{lesson.introduction}</p>
                  <div className="mt-3 flex items-center text-[#118AB2] font-bold text-sm">
                    Start Lesson <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Floating panels */}
      {showCompanion && <AICompanion onClose={() => setShowCompanion(false)} />}
      {showEmotion && <EmotionDetector onClose={() => setShowEmotion(false)} />}
      {showSoundscape && <SoundscapePanel onClose={() => setShowSoundscape(false)} />}
    </div>
  );
}
