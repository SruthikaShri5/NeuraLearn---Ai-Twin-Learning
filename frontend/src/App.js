import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/lib/store";
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
import { Toaster } from "@/components/ui/sonner";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]" data-testid="loading-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Loading NeuraLearn...</p>
      </div>
    </div>
  );
}

/** Redirect logged-in users to their role-specific dashboard */
function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher-dashboard" replace />;
  if (user.role === "parent") return <Navigate to="/parent-dashboard" replace />;
  if (user.onboarding_complete === false) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
}

/** Protect any route — redirect to login if not authenticated */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Wrong role — send to their correct dashboard
    if (user.role === "teacher") return <Navigate to="/teacher-dashboard" replace />;
    if (user.role === "parent") return <Navigate to="/parent-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppContent() {
  const { settings } = useAppStore();
  const breathingActive = useAppStore((s) => s.breathingActive);

  return (
    <div className={`min-h-screen ${settings.highContrast ? 'high-contrast' : ''} ${settings.reduceMotion ? 'reduce-motion' : ''}`}>
      <a href="#main-content" className="skip-link" data-testid="skip-link">
        Skip to main content
      </a>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Auto-redirect based on role */}
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
