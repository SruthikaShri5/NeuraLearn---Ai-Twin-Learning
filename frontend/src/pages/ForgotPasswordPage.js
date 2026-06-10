import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("If that email exists, a reset link was sent.");
    } catch {
      toast.error("Could not send reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="neura-card p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-8 h-8 text-[#118AB2]" />
          <h1 className="text-2xl font-bold text-[#0F172A]">Forgot Password</h1>
        </div>
        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-[#334155]">Check your email for a reset link. It may take a few minutes.</p>
            <Link to="/login" className="neura-btn bg-[#118AB2] text-white w-full h-12 inline-flex items-center justify-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-bold">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="neura-btn bg-[#118AB2] text-white w-full h-12 disabled:opacity-50">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
