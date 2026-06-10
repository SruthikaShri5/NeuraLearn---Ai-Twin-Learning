import { useState } from "react";
import { X, FileText, Calendar, BookOpen, Plus, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useGradeTheme } from "@/lib/useGradeTheme";
import api from "@/lib/api";

export default function CreateAssignmentModal({ onClose, onCreated, classId }) {
  const { isJunior, textPrimary, textMuted } = useGradeTheme();
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    lessonId: "",
    totalPoints: 100,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) {
      toast.error(isJunior ? "Please fill title and due date! 📅" : "Please fill title and due date.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/assignments/create", {
        classId,
        title: form.title.trim(),
        description: form.description,
        dueDate: form.dueDate,
        lessonId: form.lessonId || undefined,
        totalPoints: parseInt(form.totalPoints),
      });
      toast.success(isJunior ? "Assignment created! 🎉" : "Assignment created successfully.");
      onCreated && onCreated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || (isJunior ? "Failed to create assignment 😢" : "Failed to create assignment."));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-3 py-2.5 rounded-xl text-sm border-2 border-[#e2e8f0] focus:outline-none focus:border-[#06D6A0]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="w-full max-w-lg bg-white border-[3px] border-[#1A1A2E] rounded-2xl shadow-[8px_8px_0px_#1A1A2E] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EF476F] border-2 border-[#1A1A2E] flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {isJunior ? "New Assignment! 📋" : "Create Assignment"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-[#64748B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">
              {isJunior ? "Title 📝" : "Assignment Title"}
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder={isJunior ? "e.g. Chapter 5 Practice" : "e.g. Chapter 5 Practice Problems"}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">
              {isJunior ? "Description 📄" : "Description"}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={isJunior ? "What should students do?" : "Assignment description..."}
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">
                {isJunior ? "Points 🎯" : "Total Points"}
              </label>
              <input
                type="number"
                value={form.totalPoints}
                onChange={(e) => handleChange("totalPoints", e.target.value)}
                min={1}
                max={100}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">
                {isJunior ? "Due Date 📅" : "Due Date"}
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">
              {isJunior ? "Lesson (Optional) 📚" : "Link to Lesson (Optional)"}
            </label>
            <input
              type="text"
              value={form.lessonId}
              onChange={(e) => handleChange("lessonId", e.target.value)}
              placeholder={isJunior ? "Lesson ID if any" : "Lesson ID to link"}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl bg-[#EF476F] text-white border-2 border-[#1A1A2E] hover:shadow-[3px_3px_0px_#1A1A2E] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {isJunior ? (loading ? "Creating..." : "Create Assignment! 🚀") : (loading ? "Creating..." : "Create Assignment")}
          </button>
        </form>
      </div>
    </div>
  );
}