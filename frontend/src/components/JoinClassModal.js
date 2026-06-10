import { useState } from "react";
import { X, Hash, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { useClassStore } from "@/lib/classStore";

export default function JoinClassModal({ onClose, onJoined }) {
  const { isJunior, card, btnPrimary, input, textPrimary, textSecondary, textMuted, accent1, accent3 } = useGradeTheme();
  const { joinClass } = useClassStore();
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState("enter"); // enter | preview | success
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6) {
      toast.error(isJunior ? "Please enter a valid class code! '" : "Enter a valid class code.");
      return;
    }
    setLoading(true);
    try {
      // Preview: try to find the class without joining
      const { data } = await api.post("/enroll/join", { classCode: trimmed });
      setPreview(data.classInfo);
      setStep("success");
      onJoined && onJoined(data.classInfo);
      toast.success(isJunior ? "You joined the class! 🎉" : "Successfully joined the class.");
    } catch (err) {
      const msg = err?.response?.data?.detail;
      if (msg === "Already enrolled in this class") {
        toast.error(isJunior ? "You're already in this class! 😊" : "Already enrolled in this class.");
      } else if (msg === "Invalid class code") {
        toast.error(isJunior ? "Oops! That code doesn't work. Try again! " : "Invalid class code. Please check and try again.");
      } else {
        toast.error(msg || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const overlayBg = isJunior ? "bg-black/40" : "bg-black/60 backdrop-blur-sm";
  const modalBg = isJunior
    ? "bg-white border-[3px] border-[#1A1A2E] rounded-2xl shadow-[8px_8px_0px_#1A1A2E]"
    : "bg-[#0D1117] border border-indigo-500/30 rounded-2xl shadow-2xl";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayBg}`} onClick={onClose}>
      <div className={`w-full max-w-md ${modalBg} p-6`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isJunior ? "bg-[#118AB2] border-2 border-[#1A1A2E]" : "bg-indigo-600/20 border border-indigo-500/40"
            }`}>
              <Hash className={`w-5 h-5 ${isJunior ? "text-white" : "text-[#4F46E5]"}`} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`} style={isJunior ? { fontFamily: "Fredoka, sans-serif" } : { fontFamily: "Space Grotesk, sans-serif" }}>
              {isJunior ? "Join a Class! 🎉" : "Join Class"}
            </h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${isJunior ? "hover:bg-gray-100" : "hover:bg-[#F3F4F6]"} ${textMuted}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "enter" && (
          <div className="space-y-4">
            <p className={`text-sm ${textSecondary}`}>
              {isJunior
                ? "Ask your teacher for the class code and type it below! 🎓"
                : "Enter the 8-character class code provided by your teacher."}
            </p>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                {isJunior ? "Class Code 🔑" : "Class Code"}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder={isJunior ? "e.g. ABC12345" : "e.g. ABC12345"}
                maxLength={8}
                className={`w-full px-4 py-3 text-center text-2xl font-bold tracking-widest uppercase ${input} focus:outline-none focus:ring-2 ${
                  isJunior ? "focus:ring-[#118AB2]" : "focus:ring-indigo-500"
                }`}
                autoFocus
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || code.trim().length < 6}
              className={`w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl transition-all ${btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isJunior ? "Join Now! 🚀" : "Join Class"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {step === "success" && preview && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isJunior ? "bg-[#06D6A0]/10 border-2 border-[#06D6A0]" : "bg-emerald-500/10 border border-emerald-500/30"}`}>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className={`w-6 h-6 ${isJunior ? "text-[#06D6A0]" : "text-emerald-400"}`} />
                <span className={`font-bold ${isJunior ? "text-[#065f46]" : "text-emerald-400"}`}>
                  {isJunior ? "You're in! 🎉" : "Joined successfully!"}
                </span>
              </div>
              <h3 className={`text-lg font-bold ${textPrimary}`}>{preview.className}</h3>
              <p className={`text-sm ${textSecondary}`}>
                {preview.subject} . Grade {preview.grade}
              </p>
              {preview.teacherName && (
                <p className={`text-sm mt-1 ${textMuted}`}>
                  {isJunior ? "👀 Teacher:" : "Teacher:"} {preview.teacherName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl ${btnPrimary}`}
            >
              {isJunior ? "Let's Go! 🚀" : "Go to Dashboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
