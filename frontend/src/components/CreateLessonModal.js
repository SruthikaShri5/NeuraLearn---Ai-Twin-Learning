import { useState } from "react";
import { X, BookOpen, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const GRADES = ["class_1","class_2","class_3","class_4","class_5","class_6","class_7","class_8","class_9","class_10","class_11","class_12"];
const SUBJECTS = ["mathematics","science","english","evs","social_studies","physics","chemistry","biology","computer_science"];

export default function CreateLessonModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", subject: "mathematics", grade: "class_1", introduction: "", explanation: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.introduction.trim() || !form.explanation.trim()) {
      toast.error("Please fill in title, introduction and explanation.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/teacher/lessons/create", form);
      toast.success("Lesson created successfully! 🎉");
      onCreated && onCreated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create lesson.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm border-2 border-[#e2e8f0] focus:outline-none focus:border-[#06D6A0] text-[#0F172A]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="w-full max-w-lg bg-white border-[3px] border-[#1A1A2E] rounded-2xl shadow-[8px_8px_0px_#1A1A2E] p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#118AB2] border-2 border-[#1A1A2E] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "Fredoka, sans-serif" }}>Create Custom Lesson</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-[#64748B]"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">Lesson Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Fractions" className={inputClass} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">Subject</label>
              <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputClass}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">Grade</label>
              <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className={inputClass}>
                {GRADES.map(g => <option key={g} value={g}>{g.replace("class_", "Class ")}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">Introduction</label>
            <textarea value={form.introduction} onChange={e => setForm(f => ({ ...f, introduction: e.target.value }))} placeholder="Brief intro students will see first..." rows={2} className={inputClass} required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#0F172A]">Full Explanation</label>
            <textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="The main lesson content..." rows={4} className={inputClass} required />
          </div>

          <button type="submit" disabled={loading} className="w-full h-12 flex items-center justify-center gap-2 font-bold rounded-xl bg-[#118AB2] text-white border-2 border-[#1A1A2E] hover:shadow-[3px_3px_0px_#1A1A2E] transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {loading ? "Creating..." : "Create Lesson"}
          </button>
        </form>
      </div>
    </div>
  );
}
