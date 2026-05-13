import { useState } from "react";
import { X, GraduationCap, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { useClassStore } from "@/lib/classStore";

const SUBJECTS = [
  "Mathematics", "Science", "English", "Social Studies",
  "Hindi", "Computer Science", "Art", "Physical Education", "General",
];

export default function CreateClassModal({ onClose, onCreated }) {
  const { isJunior, textPrimary, textSecondary, textMuted, input, btnPrimary } = useGradeTheme();
  const { createClass } = useClassStore();
  const [form, setForm] = useState({
    className: "",
    section: "A",
    grade: 5,
    subject: "Mathematics",
    academicYear: "2024-2025",
  });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.className.trim()) {
      toast.error("Please enter a class name.");
      return;
    }
    setLoading(true);
    try {
      const data = await createClass({ ...form, grade: parseInt(form.grade) });
      setCreated(data);
      onCreated && onCreated(data.class);
      toast.success(isJunior ? "Class created! 🎉" : "Class created successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create class.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!created?.classCode) return;
    navigator.clipboard.writeText(created.classCode).then(() => {
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const overlayBg = isJunior ? "bg-black/40" : "bg-black/60 backdrop-blur-sm";
  const modalBg = isJunior
    ? "bg-white border-[3px] border-[#1A1A2E] rounded-2xl shadow-[8px_8px_0px_#1A1A2E]"
    : "bg-[#0D1117] border border-indigo-500/30 rounded-2xl shadow-2xl";
  const labelClass = `block text-sm font-semibold mb-1.5 ${textPrimary}`;
  const inputClass = `w-full px-3 py-2.5 rounded-xl text-sm ${input} focus:outline-none focus:ring-2 ${isJunior ? "focus:ring-[#06D6A0]" : "focus:ring-indigo-500"}`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayBg}`} onClick={onClose}>
      <div className={`w-full max-w-lg ${modalBg} p-6 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isJunior ? "bg-[#06D6A0] border-2 border-[#1A1A2E]" : "bg-emerald-600/20 border border-emerald-500/40"
            }`}>
              <GraduationCap className={`w-5 h-5 ${isJunior ? "text-white" : "text-emerald-400"}`} />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`} style={isJunior ? { fontFamily: "Fredoka, sans-serif" } : { fontFamily: "Space Grotesk, sans-serif" }}>
              {isJunior ? "Create a Class! 🎉" : "Create New Class"}
            </h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${isJunior ? "hover:bg-gray-100" : "hover:bg-[#F3F4F6]"} ${textMuted}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {!created ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>{isJunior ? "Class Name 🎒" : "Class Name"}</label>
              <input
                type="text"
                value={form.className}
                onChange={(e) => handleChange("className", e.target.value)}
                placeholder={isJunior ? "e.g. Super Math Stars" : "e.g. Mathematics - Grade 8"}
                className={inputClass}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{isJunior ? "Section 📋" : "Section"}</label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  placeholder="A"
                  maxLength={5}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{isJunior ? "Grade 🎓" : "Grade"}</label>
                <select
                  value={form.grade}
                  onChange={(e) => handleChange("grade", e.target.value)}
                  className={inputClass}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>{isJunior ? "Subject 📚" : "Subject"}</label>
              <select
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className={inputClass}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{isJunior ? "Academic Year 📅" : "Academic Year"}</label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => handleChange("academicYear", e.target.value)}
                placeholder="2024-2025"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl transition-all ${btnPrimary} disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isJunior ? "Create Class! 🚀" : "Create Class"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className={`p-5 rounded-xl text-center ${
              isJunior ? "bg-[#06D6A0]/10 border-2 border-[#06D6A0]" : "bg-emerald-500/10 border border-emerald-500/30"
            }`}>
              <p className={`text-sm font-semibold mb-1 ${textSecondary}`}>
                {isJunior ? "Your class is ready! 🎉" : "Class created successfully!"}
              </p>
              <h3 className={`text-xl font-bold ${textPrimary}`}>{created.class?.className}</h3>
              <p className={`text-sm ${textMuted}`}>
                {created.class?.subject} . Grade {created.class?.grade} . Section {created.class?.section}
              </p>
            </div>

            <div className={`p-4 rounded-xl ${isJunior ? "bg-[#FFD166]/10 border-2 border-[#FFD166]" : "bg-amber-500/10 border border-amber-500/30"}`}>
              <p className={`text-xs font-bold mb-2 ${isJunior ? "text-[#b8860b]" : "text-amber-400"}`}>
                {isJunior ? "🔑 Share this code with your students:" : "Class Code - share with students:"}
              </p>
              <div className="flex items-center gap-3">
                <span className={`flex-1 text-center text-3xl font-bold tracking-widest ${textPrimary}`} style={{ fontFamily: "monospace" }}>
                  {created.classCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className={`p-2.5 rounded-xl ${
                    isJunior ? "bg-[#FFD166] border-2 border-[#1A1A2E]" : "bg-amber-500/20 border border-amber-500/30"
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl ${btnPrimary}`}
            >
              {isJunior ? "Done! 🎓" : "Done"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
