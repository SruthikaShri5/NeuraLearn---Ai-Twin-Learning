import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
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
import BreathingInterface from "@/components/BreathingInterface";
import OfflineIndicator from "@/components/OfflineIndicator";
import AccessibilityBot from "@/components/AccessibilityBot";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import ChatbaseWidget from "@/components/ChatbaseWidget";
import { Toaster } from "@/components/ui/sonner";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-[#1A1A2E]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Loading NeuraLearn€
        </p>
      </div>
    </div>
  );
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher-dashboard" replace />;
  if (user.role === "parent") return <Navigate to="/parent-dashboard" replace />;
  if (user.onboarding_complete === false) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
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

  // Apply grade group from user - only when logged in
  useEffect(() => {
    if (user && user.grade_level) {
      setGradeGroup(user.grade_level);
      document.body.classList.remove("grade-junior", "grade-senior");
      document.body.classList.add(`grade-${getGradeGroup(user.grade_level)}`);
    } else if (user && (user.role === "teacher" || user.role === "parent" || user.role === "admin")) {
      setGradeGroup("class_9");
      document.body.classList.remove("grade-junior", "grade-senior");
      document.body.classList.add("grade-senior");
    } else {
      // Not logged in - use junior (light) as default
      document.body.classList.remove("grade-junior", "grade-senior");
      document.body.classList.add("grade-junior");
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
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const { setBreathingActive, setFocusMode, focusMode, setTourActive, tourCompleted } = useAppStore.getState();

      switch (e.key.toLowerCase()) {
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
      <ChatbaseWidget />
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
