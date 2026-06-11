import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Brain, BookOpen, Heart, Shield, Sparkles, ArrowRight,
  Users, Zap, GraduationCap, CheckCircle, Star, Target,
  RefreshCw, Mic, Wind, BarChart3, LogOut
} from "lucide-react";

const MASCOT_URL = "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/0d5a58ad11917c107d19197bb800270b2ab4affe5ac9d9ef444167284e0b11be.png";
const KIDS_URL = "https://images.pexels.com/photos/8617938/pexels-photo-8617938.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const TEACHER_URL = "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const FEATURES = [
  {
    icon: Brain,
    title: "Adaptive AI Learning",
    desc: "Content and difficulty auto-adjust based on your cognitive state and progress history in real time.",
    color: "#118AB2",
    bg: "#EFF8FF",
    border: "#BFDBFE",
  },
  {
    icon: Shield,
    title: "Accessible by Design",
    desc: "WCAG AAA compliant. Screen reader, voice control, keyboard navigation, and dyslexia font support built in.",
    color: "#06D6A0",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  {
    icon: BookOpen,
    title: "CBSE / ICSE Curriculum",
    desc: "38 real, curriculum-aligned lessons for Class 1-12 across Mathematics, Science, EVS, Physics, Chemistry, and Biology.",
    color: "#FF6B35",
    bg: "#FFF7ED",
    border: "#FED7AA",
  },
  {
    icon: RefreshCw,
    title: "Spaced Repetition",
    desc: "SM-2 algorithm schedules reviews at optimal intervals so you never forget what you've learned.",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
  {
    icon: Heart,
    title: "Emotional Wellbeing",
    desc: "Breathing exercises, emotion detection, and an AI companion keep you calm and focused throughout.",
    color: "#EF476F",
    bg: "#FFF1F2",
    border: "#FECDD3",
  },
  {
    icon: Users,
    title: "Multi-Role Platform",
    desc: "Dedicated dashboards for students, teachers, and parents - everyone stays informed and connected.",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
];

const STATS = [
  { value: "38+", label: "Curriculum Lessons", icon: BookOpen, color: "#118AB2" },
  { value: "12", label: "Classes Covered", icon: GraduationCap, color: "#06D6A0" },
  { value: "6", label: "Disability Modes", icon: Shield, color: "#8B5CF6" },
  { value: "100%", label: "Free to Use", icon: Star, color: "#FF6B35" },
];

const GRADE_BANDS = [
  {
    range: "Class 1 - 5",
    style: "Junior Mode",
    desc: "Cartoon mascots, playful animations, bright colours, Fredoka font - designed to delight young learners.",
    color: "#FF6B35",
    bg: "#FFF7ED",
    border: "#FED7AA",
    emoji: "🎓",
  },
  {
    range: "Class 6 - 12",
    style: "Senior Mode",
    desc: "Clean glassmorphism, abstract icons, professional typography - designed for focused, serious study.",
    color: "#6366F1",
    bg: "#EEF2FF",
    border: "#C7D2FE",
    emoji: "🎓",
  },
];

const ROLES = [
  {
    icon: BookOpen,
    title: "Students",
    desc: "Learn at your own pace with AI-powered lessons, quizzes, and a personal study roadmap.",
    color: "#118AB2",
    bg: "#EFF8FF",
    link: "/signup",
    cta: "Start Learning",
  },
  {
    icon: GraduationCap,
    title: "Teachers",
    desc: "Monitor class performance, identify at-risk students, and view misconception heatmaps.",
    color: "#06D6A0",
    bg: "#F0FDF4",
    link: "/signup?role=teacher",
    cta: "Teacher Signup",
  },
  {
    icon: Heart,
    title: "Parents",
    desc: "Track your child's progress, achievements, and learning time from a dedicated dashboard.",
    color: "#F59E0B",
    bg: "#FFFBEB",
    link: "/signup?role=parent",
    cta: "Parent Signup",
  },
];

export default function LandingPage() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  // Auto-redirect logged-in users to their dashboard
  useEffect(() => {
    if (loading || !user || user === false) return;
    if (user.role === "teacher") { navigate("/teacher-dashboard", { replace: true }); return; }
    if (user.role === "parent") { navigate("/parent-dashboard", { replace: true }); return; }
    if (user.onboarding_complete === false) { navigate("/onboarding", { replace: true }); return; }
    navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);



  const handleLogout = async () => {
    await logout();
    toast.success("You've been signed out. See you soon! 👋", { duration: 3000 });
    navigate("/", { replace: true });
  };

  // Show spinner while auth is initialising (null = still checking)
  if (loading || user === null) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #fafafa 60%, #fff0f9 100%)" }}>
      <div className="w-8 h-8 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  // user is an object = logged in, redirect is firing
  if (user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #fafafa 60%, #fff0f9 100%)" }}>
      <div className="w-8 h-8 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  // user === false = logged out, show landing page

  return (
    <div
      className="min-h-screen overflow-x-hidden transition-colors duration-700"
      style={{ 
        background: "linear-gradient(135deg, #f0f7ff 0%, #fafafa 60%, #fff0f9 100%)", 
        color: "#1A1A2E", 
        fontFamily: "Nunito, Inter, sans-serif" 
      }}
      data-testid="landing-page"
    >
      <main id="main-content">

        {/* "-€ Navbar "-€ */}
        <nav
          className="sticky top-0 z-50 border-b"
          style={{ background: "rgba(255,255,255,0.95)", borderColor: "#E5E7EB", backdropFilter: "blur(12px)" }}
          data-testid="landing-nav"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#118AB2" }}>
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}>
                  NeuraLearn
                </span>
              </Link>

              <div className="hidden sm:flex items-center gap-6 text-sm font-medium" style={{ color: "#374151" }}>
                <a href="#features" className="hover:text-[#118AB2] transition-colors">Features</a>
                <a href="#grades" className="hover:text-[#118AB2] transition-colors">Grades</a>
                <a href="#roles" className="hover:text-[#118AB2] transition-colors">For You</a>
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <Link to="/dashboard">
                      <button className="px-5 h-10 text-sm text-white rounded-full font-semibold" style={{ background: "#118AB2" }}>
                        Dashboard
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <button className="px-5 h-10 text-sm rounded-full font-semibold border-2" style={{ background: "white", color: "#1A1A2E", borderColor: "#1A1A2E" }}>
                        Sign In
                      </button>
                    </Link>
                    <Link to="/signup">
                      <button className="px-5 h-10 text-sm text-white rounded-full font-semibold" style={{ background: "#118AB2" }}>
                        Get Started Free
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
        </nav>

        {/* "-€ Hero "-€ */}
        <section
          className="relative px-4 sm:px-6 overflow-hidden"
          style={{ background: "transparent", minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center" }}
          data-testid="hero-section"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #C8B6FF 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #FFD166 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">

              <div className="space-y-5">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border-2"
                  style={{ background: "#FFD166", borderColor: "#1A1A2E", color: "#1A1A2E" }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Adaptive Learning for Every Student
                </div>

                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight"
                  style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}
                >
                  Learning That{" "}
                  <br />
                  <span style={{ color: "#118AB2" }}>Adapts</span>{" to "}
                  <span style={{ color: "#EF476F" }}>You</span>
                </h1>
                
                <p className="text-base sm:text-lg text-[#334155] leading-relaxed max-w-2xl font-medium" style={{ fontFamily: "Nunito, sans-serif" }}>
                  NeuraLearn uses AI to create a personalised, accessible learning experience for every student - <span className="font-black text-[#1A1A2E]">Class 1 through Class 12</span>. CBSE / ICSE aligned.
                </p>

                <div className="flex flex-wrap gap-3">
                  {user ? (
                    <Link to="/dashboard">
                      <button className="inline-flex items-center gap-2 px-6 h-12 text-sm text-white rounded-full font-bold" style={{ background: "#118AB2" }}>
                        <Zap className="w-4 h-4" /> Start Learning Free
                      </button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/signup">
                        <button className="inline-flex items-center gap-2 px-6 h-12 text-sm text-white rounded-full font-bold" style={{ background: "#118AB2" }}>
                          <Zap className="w-4 h-4" /> Start Learning Free
                        </button>
                      </Link>
                      <Link to="/login">
                        <button className="inline-flex items-center gap-2 px-6 h-12 text-sm rounded-full font-bold border-2" style={{ background: "white", color: "#1A1A2E", borderColor: "#1A1A2E" }}>
                          <BookOpen className="w-4 h-4" /> Sign In
                        </button>
                      </Link>
                    </>
                  )}
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {["CBSE Aligned", "WCAG AAA", "Offline PWA", "Free to Use", "Class 1-12"].map((b) => (
                    <div
                      key={b}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
                      style={{ background: "white", borderColor: "#E5E7EB", color: "#374151" }}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#06D6A0]" /> {b}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - mascot */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative p-8">
                  {/* Floating badge - top right */}
                  <div 
                    className="absolute -top-1 -right-4 z-20 px-4 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-2"
                    style={{ background: "#FFD6BA", borderColor: "#1A1A2E", boxShadow: "4px 4px 0px #1A1A2E" }}
                  >
                    <span className="text-base">🧠</span> AI-Powered
                  </div>
                  
                  <div
                    className="w-56 h-56 lg:w-72 lg:h-72 rounded-[2rem] overflow-hidden relative z-10"
                    style={{
                      background: "#000000",
                      padding: "5px",
                      background: "linear-gradient(135deg, #FFD6BA, #C8B6FF, #118AB2)",
                      boxShadow: "8px 8px 0px #1A1A2E",
                    }}
                  >
                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-black flex items-center justify-center">
                      <img
                        src={MASCOT_URL}
                        alt="Neura mascot"
                        className="w-[85%] h-[85%] object-contain float-animation"
                      />
                    </div>
                  </div>

                  {/* Floating badge - bottom left */}
                  <div 
                    className="absolute -bottom-2 -left-4 z-20 px-4 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-2"
                    style={{ background: "#06D6A0", borderColor: "#1A1A2E", color: "white", boxShadow: "4px 4px 0px #1A1A2E" }}
                  >
                    <CheckCircle className="w-4 h-4" /> Class 1-12
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* "-€ Stats Bar "-€ */}
        <section style={{ background: "#1A1A2E" }} className="py-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center group">
                <p className="text-4xl sm:text-5xl font-black mb-1 transition-transform group-hover:scale-110 duration-300" style={{ fontFamily: "Fredoka, sans-serif", color: s.color }}>
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest leading-tight" style={{ color: "#9CA3AF" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* "-€ Grade Bands "-€ */}
        <section id="grades" className="py-12 px-4 sm:px-6" style={{ background: "transparent" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}>
                Grade-Adaptive Design
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                The interface automatically changes based on the student's class - no setup needed.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {GRADE_BANDS.map((band) => (
                <div
                  key={band.range}
                  className="p-6 rounded-2xl border-2 flex items-start gap-4 hover:scale-[1.02] transition-transform"
                  style={{ background: band.bg, borderColor: band.border }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2"
                    style={{ background: band.color, borderColor: "#1A1A2E" }}
                  >
                    {band.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}>
                      {band.range}
                    </p>
                    <p className="text-xs font-bold mb-1" style={{ color: band.color }}>{band.style}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{band.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* "-€ Features "-€ */}
        <section id="features" className="py-12 px-4 sm:px-6" style={{ background: "transparent" }} data-testid="features-section">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}>
                Everything You Need to Learn Better
              </h2>
              <p className="text-sm max-w-2xl mx-auto" style={{ color: "#6B7280" }}>
                Accessibility-first design with real curriculum content, AI tutoring, and emotional wellbeing tools.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="p-5 rounded-2xl border-2 hover:shadow-lg transition-all hover:-translate-y-1"
                  style={{ background: f.bg, borderColor: f.border }}
                  data-testid={`feature-card-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 border-2"
                    style={{ background: f.color, borderColor: "#1A1A2E" }}
                  >
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold mb-1.5" style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}>
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* "-€ AI Features Highlight "-€ */}
        <section className="py-12 px-4 sm:px-6" style={{ background: "transparent" }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}>
                Powered by AI - Built for Accessibility
              </h2>
              <p className="text-sm max-w-xl mx-auto" style={{ color: "#6B7280" }}>
                Every feature is designed to support students with visual, hearing, motor, cognitive, and speech disabilities.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Brain, label: "AI Tutor", desc: "Groq llama-3.1 — instant AI responses, disability-aware prompts", color: "#118AB2", bg: "#EFF8FF" },
                { icon: Wind, label: "Breathing Mode", desc: "4-7-8 protocol with haptic feedback", color: "#06D6A0", bg: "#F0FDF4" },
                { icon: Mic, label: "Voice Navigation", desc: "Hands-free control with 15+ commands", color: "#8B5CF6", bg: "#F5F3FF" },
                { icon: BarChart3, label: "Analytics", desc: "Track mastery, streaks, and learning time", color: "#F59E0B", bg: "#FFFBEB" },
                { icon: Target, label: "Focus Mode", desc: "Grow a tree while you stay focused", color: "#EF476F", bg: "#FFF1F2" },
                { icon: RefreshCw, label: "Spaced Reviews", desc: "SM-2 algorithm schedules your reviews", color: "#FF6B35", bg: "#FFF7ED" },
                { icon: Shield, label: "Offline PWA", desc: "Learn without internet - syncs when back", color: "#374151", bg: "#F9FAFB" },
                { icon: Sparkles, label: "Emotion Mirror", desc: "3D orb reacts to your detected mood", color: "#C8B6FF", bg: "#FAF5FF" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl border-2 flex items-start gap-3 hover:shadow-md transition-all"
                  style={{ background: item.bg, borderColor: "#E5E7EB" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border-2"
                    style={{ background: item.color, borderColor: "#1A1A2E" }}
                  >
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#1A1A2E" }}>{item.label}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6B7280" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* "-€ Roles "-€ */}
        <section id="roles" className="py-12 px-4 sm:px-6" style={{ background: "transparent" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}>
                Built for Everyone
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Three dedicated experiences - students, teachers, and parents.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {ROLES.map((r) => (
                <div
                  key={r.title}
                  className="p-5 rounded-2xl border-2 flex flex-col gap-3 hover:shadow-lg transition-all"
                  style={{ background: r.bg, borderColor: "#E5E7EB" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border-2"
                    style={{ background: r.color, borderColor: "#1A1A2E" }}
                  >
                    <r.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1" style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}>
                      {r.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>{r.desc}</p>
                  </div>
                  <Link to={r.link} className="mt-auto">
                    <button
                      className="inline-flex items-center justify-center gap-2 w-full h-9 text-xs font-bold text-white rounded-full border-2"
                      style={{ background: r.color, borderColor: "#1A1A2E" }}
                    >
                      {r.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* "-€ CTA Banner "-€ */}
        <section className="py-12 px-4 sm:px-6" style={{ background: "#FFFFFF" }} data-testid="community-section">
          <div className="max-w-7xl mx-auto">
            <div
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: "#1A1A2E", boxShadow: "6px 6px 0px #1A1A2E" }}
            >
              <div className="grid lg:grid-cols-2">
                <div
                  className="p-7 lg:p-10 flex flex-col justify-center"
                  style={{ background: "linear-gradient(135deg, #FFD166 0%, #FFD6BA 100%)" }}
                >
                  <h2
                    className="text-xl sm:text-2xl font-bold mb-3"
                    style={{ fontFamily: "Fredoka, sans-serif", color: "#1A1A2E" }}
                  >
                    Every Student Deserves to Shine ✨
                  </h2>
                  <p className="leading-relaxed mb-5 text-sm" style={{ color: "#374151" }}>
                    NeuraLearn was built to ensure no student is left behind. Whether you learn through seeing,
                    hearing, touching, or speaking - the platform adapts to you.
                  </p>
                  <Link to="/signup">
                    <button
                      className="inline-flex items-center gap-2 text-sm px-6 h-10 w-fit rounded-full font-bold border-2"
                      style={{ background: "#1A1A2E", color: "white", borderColor: "#1A1A2E" }}
                      data-testid="community-signup-btn"
                    >
                      Join NeuraLearn Today <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
                <div className="h-56 lg:h-auto">
                  <img
                    src={KIDS_URL}
                    alt="Diverse students learning together in a classroom"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* "-€ Footer "-€ */}
        <footer
          className="py-6 px-4 sm:px-6 border-t-2"
          style={{ background: "#1A1A2E", borderColor: "#374151" }}
          data-testid="landing-footer"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#118AB2" }}>
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: "Fredoka, sans-serif" }}>
                NeuraLearn
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <Link to="/login" className="transition-colors" style={{ color: "#6B7280" }}
                onMouseEnter={e => e.target.style.color = "#FFD166"}
                onMouseLeave={e => e.target.style.color = "#9CA3AF"}>
                Student Login
              </Link>
              <Link to="/login?role=teacher" className="transition-colors" style={{ color: "#6B7280" }}
                onMouseEnter={e => e.target.style.color = "#06D6A0"}
                onMouseLeave={e => e.target.style.color = "#9CA3AF"}>
                Teacher Login
              </Link>
              <Link to="/login?role=parent" className="transition-colors" style={{ color: "#6B7280" }}
                onMouseEnter={e => e.target.style.color = "#FFD166"}
                onMouseLeave={e => e.target.style.color = "#9CA3AF"}>
                Parent Login
              </Link>
              <Link to="/signup?role=teacher" className="transition-colors" style={{ color: "#6B7280" }}
                onMouseEnter={e => e.target.style.color = "#06D6A0"}
                onMouseLeave={e => e.target.style.color = "#9CA3AF"}>
                Teacher Signup
              </Link>
            </div>

            <p className="text-sm" style={{ color: "#6B7280" }}>
              Adaptive learning for every student. Class 1-12.
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}
