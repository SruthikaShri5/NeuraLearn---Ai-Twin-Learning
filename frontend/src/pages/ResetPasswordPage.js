import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { Brain, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    if (!token) { setError("Invalid or missing reset token."); return; }

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#118AB2] flex items-center justify-center border-2 border-[#1A1A2E]">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "Fredoka, sans-serif" }}>
            NeuraLearn
          </span>
        </div>

        <div className="neura-card p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-[#06D6A0] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: "Fredoka, sans-serif" }}>
                Password Reset! 🎉
              </h1>
              <p className="text-[#6B7280] mb-4">
                Your password has been updated. Redirecting you to login…
              </p>
              <Link to="/login" className="text-[#118AB2] font-bold hover:underline">
                Go to Login →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: "Fredoka, sans-serif" }}>
                Set New Password
              </h1>
              <p className="text-[#6B7280] text-sm mb-6">
                Enter a new password for your NeuraLearn account.
              </p>

              {!token && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EF476F]/10 border border-[#EF476F]/30 mb-4">
                  <AlertCircle className="w-4 h-4 text-[#EF476F] shrink-0" />
                  <p className="text-sm text-[#EF476F] font-semibold">
                    Invalid reset link. Please request a new one.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-sm font-bold text-[#374151] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-[#e2e8f0] focus:border-[#118AB2] focus:outline-none text-[#0F172A] bg-white"
                      required
                      disabled={!token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#374151]"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-bold text-[#374151] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#118AB2] focus:outline-none text-[#0F172A] bg-white"
                    required
                    disabled={!token}
                  />
                </div>

                {/* Password strength hints */}
                <ul className="text-xs text-[#6B7280] space-y-1 pl-1">
                  {[
                    { ok: password.length >= 8, label: "At least 8 characters" },
                    { ok: /[A-Z]/.test(password), label: "One uppercase letter" },
                    { ok: /[0-9]/.test(password), label: "One number" },
                    { ok: password && password === confirm, label: "Passwords match" },
                  ].map((r) => (
                    <li key={r.label} className={`flex items-center gap-1.5 ${r.ok ? "text-[#06D6A0]" : "text-[#94a3b8]"}`}>
                      <span>{r.ok ? "✓" : "○"}</span> {r.label}
                    </li>
                  ))}
                </ul>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EF476F]/10 border border-[#EF476F]/30">
                    <AlertCircle className="w-4 h-4 text-[#EF476F] shrink-0" />
                    <p className="text-sm text-[#EF476F] font-semibold">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="neura-btn bg-[#118AB2] text-white w-full h-12 disabled:opacity-50"
                >
                  {loading ? "Resetting…" : "Reset Password"}
                </button>
              </form>

              <p className="text-center text-sm text-[#6B7280] mt-4">
                Remember your password?{" "}
                <Link to="/login" className="text-[#118AB2] font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
