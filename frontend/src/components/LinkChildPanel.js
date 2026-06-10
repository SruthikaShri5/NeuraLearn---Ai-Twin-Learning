import { useState } from "react";
import api from "@/lib/api";
import { Link2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LinkChildPanel({ onLinked }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(null);

  const handleLink = async (e) => {
    e.preventDefault();
    if (code.trim().length < 4) return;
    setLoading(true);
    try {
      const { data } = await api.post("/parent/link-child", { child_code: code.trim().toUpperCase() });
      setLinked(data.child);
      toast.success(`Linked to ${data.child?.name}! 🎉`);
      onLinked && onLinked(data.child);
      setCode("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid code. Ask your child for their code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neura-card p-5 mb-6 bg-[#118AB2]/5 border-[#118AB2]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#118AB2] border-2 border-[#1A1A2E] flex items-center justify-center">
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: "Fredoka, sans-serif" }}>
            Link Your Child's Account
          </h3>
          <p className="text-xs text-[#64748B]">Ask your child to share their 6-character code from Settings</p>
        </div>
      </div>

      <form onSubmit={handleLink} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="ABC123"
          maxLength={6}
          className="flex-1 h-11 px-4 border-2 border-[#0F172A] rounded-xl font-black text-center text-lg tracking-widest uppercase bg-white focus:outline-none focus:border-[#118AB2]"
          aria-label="Child's link code"
        />
        <button
          type="submit"
          disabled={loading || code.trim().length < 4}
          className="h-11 px-5 rounded-xl bg-[#118AB2] text-white font-bold border-2 border-[#1A1A2E] hover:shadow-[3px_3px_0px_#1A1A2E] transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          {loading ? "Linking..." : "Link"}
        </button>
      </form>

      {linked && (
        <div className="mt-3 flex items-center gap-2 text-sm text-[#065f46] font-bold">
          <CheckCircle className="w-4 h-4 text-[#06D6A0]" />
          Successfully linked to {linked.name}!
        </div>
      )}

      <p className="text-xs text-[#94a3b8] mt-3">
        💡 Your child can find their code in{" "}
        <strong>Settings → Learning Profile → My Link Code</strong>
      </p>
    </div>
  );
}
