import "@/App.css";
import "@/disability-transforms.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useAppStore, getGradeGroup } from "@/lib/store";
import { updateFavicon } from "@/lib/dynamicFavicon";
import { getAdaptiveRate } from "@/lib/tts";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardPage from "@/pages/DashboardPage";
import TeacherDashboardPage from "@/pages/TeacherDashboardPage";
import ParentDashboardPage from "@/pages/ParentDashboardPage";
import LessonPage from "@/pages/LessonPage";
import KnowledgeGraphPage from "@/pages/KnowledgeGraphPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import BreathingInterface from "@/components/BreathingInterface";
import OfflineIndicator from "@/components/OfflineIndicator";
import AccessibilityBot from "@/components/AccessibilityBot";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { Toaster } from "@/components/ui/sonner";

function LoadingScreen() {
  const [slow, setSlow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSlow(true), 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#118AB2] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl">🧠</span>
        </div>
        <p className="text-lg font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: "Fredoka, sans-serif" }}>NeuraLearn</p>
        <p className="text-sm text-[#6B7280] mb-1">An app that learns how you learn</p>
        {slow && (
          <p className="text-xs text-[#94a3b8] mb-4 max-w-xs mx-auto">
            Waking up the server — this takes ~15s on first visit ☕
          </p>
        )}
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#118AB2] animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-[#FFD166] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher-dashboard" replace />;
  if (user.role === "parent") return <Navigate to="/parent-dashboard" replace />;
  if (user.onboarding_complete === false) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "teacher") return <Navigate to="/teacher-dashboard" replace />;
    if (user.role === "parent") return <Navigate to="/parent-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppContent() {
  const { settings, breathingActive, gradeGroup, emotionState, setGradeGroup } = useAppStore();
  const { user } = useAuth();

  // Wake up backend on app start (Render free tier cold start)
  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://neuralearn-backend.onrender.com";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    fetch(`${backendUrl}/api/health`, { method: "GET", cache: "no-cache", signal: controller.signal })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
  }, []);

  // Apply grade group and disability from user
  useEffect(() => {
    if (user) {
      // Grade class
      setGradeGroup(user.grade_level || "class_1");
      document.body.classList.remove("grade-junior", "grade-senior");
      document.body.classList.add(`grade-${getGradeGroup(user.grade_level || "class_1")}`);

      // Disability & Empowerment Classes
      const disabilities = ["dyslexia", "visual", "hearing", "motor", "cognitive", "speech", "multiple"];
      disabilities.forEach(d => document.body.classList.remove(`disability-${d}`));
      if (user.disability_type && user.disability_type !== "prefer_not_to_say") {
        document.body.classList.add(`disability-${user.disability_type}`);
      }

      // Auto-Empowerment Classes
      const profile = user.learning_profile || {};
      const empowermentClasses = {
        'dyslexia-font': profile.dyslexia_font_active,
        'step-mode': profile.step_mode_active,
        'large-targets': profile.large_targets_active,
        'high-contrast': user.settings?.high_contrast,
        'captions-active': profile.captions_active,
        'visual-feedback': profile.visual_feedback_active
      };

      Object.entries(empowermentClasses).forEach(([cls, active]) => {
        if (active) document.body.classList.add(cls);
        else document.body.classList.remove(cls);
      });
    } else {
      document.body.classList.remove("grade-junior", "grade-senior");
      // Cleanup all classes on logout
      document.body.className = "";
    }
  }, [user, setGradeGroup]);

  // Apply font size
  useEffect(() => {
    document.documentElement.classList.remove(
      "font-size-small", "font-size-medium", "font-size-large", "font-size-extra-large"
    );
    document.documentElement.classList.add(`font-size-${settings.fontSize || "medium"}`);
  }, [settings.fontSize]);

  // Dynamic favicon
  useEffect(() => {
    updateFavicon(emotionState);
  }, [emotionState]);

  // Keyboard shortcuts for global actions
  useEffect(() => {
     const handler = (e) => {
       if (!e.key) return;
       const tag = String(document.activeElement?.tagName || "").toLowerCase();
       if (tag === "input" || tag === "textarea") return;
       if (e.ctrlKey || e.metaKey || e.altKey) return;

       const { setBreathingActive, setFocusMode, focusMode, setTourActive, tourCompleted } = useAppStore.getState();

       switch (String(e.key || "").toLowerCase()) {
        case "b": setBreathingActive(true); break;
        case "f": setFocusMode(!focusMode); break;
        case "t":
          // Replay tour
          setTourActive(true);
          break;
        case "r": {
          // Read aloud current main content with adaptive speed
          const main = document.getElementById("main-content");
          const text = main?.innerText?.slice(0, 2000) || "";
          if (window.speechSynthesis && text) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(text);
            utt.rate = getAdaptiveRate();
            window.speechSynthesis.speak(utt);
          }
          break;
        }
        case "n":
          // Next question — click the quiz next button if present
          document.querySelector("[data-testid='quiz-next-btn']")?.click();
          break;
        case "h":
          // Show hint — click hint button if present
          document.querySelector("[data-testid='hint-btn']")?.click();
          break;
        default: break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const containerClass = [
    "min-h-screen",
    settings.highContrast ? "high-contrast" : "",
    settings.reduceMotion ? "reduce-motion" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClass}>
      <a href="#main-content" className="skip-link" data-testid="skip-link">
        Skip to main content
      </a>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auto" element={<RoleRedirect />} />

          {/* Student routes */}
          <Route path="/onboarding" element={
            <ProtectedRoute allowedRoles={["student", "learner"]}>
              <OnboardingPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["student", "learner", "admin"]}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/lesson/:lessonId" element={
            <ProtectedRoute allowedRoles={["student", "learner", "admin"]}>
              <LessonPage />
            </ProtectedRoute>
          } />
          <Route path="/knowledge-graph" element={
            <ProtectedRoute allowedRoles={["student", "learner", "admin"]}>
              <KnowledgeGraphPage />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={["student", "learner", "admin"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Teacher routes */}
          <Route path="/teacher-dashboard" element={
            <ProtectedRoute allowedRoles={["teacher", "admin"]}>
              <TeacherDashboardPage />
            </ProtectedRoute>
          } />

          {/* Parent routes */}
          <Route path="/parent-dashboard" element={
            <ProtectedRoute allowedRoles={["parent", "admin"]}>
              <ParentDashboardPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>

      {breathingActive && <BreathingInterface />}
      <KeyboardShortcuts />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
