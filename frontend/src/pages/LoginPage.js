import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth, formatApiError } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Users, BookOpen } from "lucide-react";

const MASCOT_URL = "/mascot.svg";

const ROLE_TABS = [
  { id: "student", label: "Student", icon: BookOpen, color: "bg-[#118AB2]", desc: "Continue your learning journey" },
  { id: "teacher", label: "Teacher", icon: GraduationCap, color: "bg-[#06D6A0]", desc: "Manage your classroom" },
  { id: "parent", label: "Parent", icon: Users, color: "bg-[#FFD166]", desc: "Track your child's progress" },
];

function getRoleRedirect(user) {
  const role = user?.role;
  if (role === "teacher") return "/teacher-dashboard";
  if (role === "parent") return "/parent-dashboard";
  if (user?.onboarding_complete === false) return "/onboarding";
  return "/dashboard";
}

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={getRoleRedirect(user)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(email, password);
      navigate(getRoleRedirect(u), { replace: true });
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeTab = ROLE_TABS.find((r) => r.id === activeRole);

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#FAFAFA", color: "#1A1A2E" }} data-testid="login-page">
      <main id="main-content" className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center gap-0.5 mb-3 justify-center" data-testid="login-logo-link">
            <div className="flex items-center gap-2">
              <Brain className="w-7 h-7 text-[#118AB2]" strokeWidth={2.5} />
              <span className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "Fredoka, sans-serif" }}>NeuraLearn</span>
            </div>
            <p className="text-[10px] font-black text-[#118AB2] uppercase tracking-[0.2em]">An app that learns how you learn</p>
          </Link>

          {/* Mascot */}
          <div className="flex justify-center mb-2" aria-hidden="true">
            <img src={MASCOT_URL} alt="" className="w-10 h-10 object-contain float-animation" />
          </div>

          {/* Role tabs */}
          <div className="flex gap-1.5 mb-3 p-1 bg-[#f1f5f9] rounded-2xl border-2 border-[#0F172A]" role="tablist">
            {ROLE_TABS.map((tab) => (
              <button key={tab.id} role="tab" aria-selected={activeRole === tab.id}
                onClick={() => { setActiveRole(tab.id); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeRole === tab.id ? `${tab.color} text-white shadow-[2px_2px_0px_#0F172A]` : "text-[#64748B] hover:text-[#0F172A]"
                }`} data-testid={`login-role-${tab.id}`}>
                <tab.icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="neura-card p-5" data-testid="login-card">
            <h1 className="text-lg font-bold text-[#0F172A] text-center mb-0.5" style={{ fontFamily: "Fredoka, sans-serif" }}>Welcome Back!</h1>
            <p className="text-[#64748B] text-center text-xs mb-4">{activeTab?.desc}</p>

            {error && (
              <div className="bg-[#EF476F]/10 border-2 border-[#EF476F] rounded-xl p-2.5 mb-3 text-[#EF476F] text-sm font-semibold" role="alert" data-testid="login-error">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="email" className="text-[#0F172A] font-bold mb-1 block text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" required autoComplete="email"
                    className="pl-9 h-10 border-2 border-[#0F172A] rounded-xl text-sm" data-testid="login-email-input" />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-[#0F172A] font-bold mb-1 block text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <Input id="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required
                    autoComplete="current-password"
                    className="pl-9 pr-9 h-10 border-2 border-[#0F172A] rounded-xl text-sm" data-testid="login-password-input" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    aria-label="Toggle password" data-testid="login-toggle-password">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-[#118AB2] font-bold hover:underline" data-testid="login-forgot-password">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading}
                className="neura-btn w-full bg-[#118AB2] text-white h-11 disabled:opacity-50" data-testid="login-submit-btn">
                {loading ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-3 text-center space-y-1">
              <p className="text-[#334155] text-sm">Don't have an account?{" "}
                <Link to="/signup" className="text-[#118AB2] font-bold hover:underline" data-testid="login-signup-link">Sign Up</Link>
              </p>
              {activeRole === "teacher" && <Link to="/signup?role=teacher" className="text-[#06D6A0] font-bold text-xs hover:underline block">Register as Teacher</Link>}
              {activeRole === "parent" && <Link to="/signup?role=parent" className="font-bold text-xs hover:underline block" style={{ color: "#b8860b" }}>Register as Parent</Link>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
