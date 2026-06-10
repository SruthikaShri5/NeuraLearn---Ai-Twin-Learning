/**
 * useGradeTheme - grade-adaptive style hook
 * BOTH junior and senior use the LIGHT theme.
 * Junior = playful, rounded, Fredoka, bright accents
 * Senior = clean, minimal, Inter/Space Grotesk, same light bg
 */
import { useAppStore } from "./store";

export function useGradeTheme() {
  const gradeGroup = useAppStore((s) => s.gradeGroup);
  const isJunior = gradeGroup === "junior";
  const isSenior = gradeGroup === "senior";

  return {
    gradeGroup,
    isJunior,
    isSenior,

    // ── Cards ──────────────────────────────────────────────────────────────
    card: "neura-card",

    // ── Buttons ────────────────────────────────────────────────────────────
    btn: "neura-btn",
    btnPrimary: isJunior
      ? "neura-btn bg-[#118AB2] text-white"
      : "neura-btn bg-[#118AB2] text-white border-[#0e7a9e]",
    btnSuccess: isJunior
      ? "neura-btn bg-[#06D6A0] text-[#1A1A2E]"
      : "neura-btn bg-[#06D6A0] text-[#1A1A2E] border-[#059669]",
    btnDanger: "neura-btn bg-[#EF476F] text-white",
    btnSecondary: isJunior
      ? "neura-btn bg-white text-[#1A1A2E]"
      : "neura-btn bg-white text-[#1A1A2E] border-[#D1D5DB]",

    // ── Typography ─────────────────────────────────────────────────────────
    headingFont: isJunior
      ? { fontFamily: "Fredoka, sans-serif" }
      : { fontFamily: "Space Grotesk, sans-serif", letterSpacing: "-0.02em" },
    bodyFont: isJunior
      ? { fontFamily: "Nunito, sans-serif" }
      : { fontFamily: "Inter, sans-serif" },

    // ── Backgrounds ────────────────────────────────────────────────────────
    pageBg:    isJunior ? "bg-[#FFFBF0]" : "bg-[#FAFAFA]",
    surfaceBg: "bg-white",

    // ── Text colours ───────────────────────────────────────────────────────
    textPrimary:   "text-[#1A1A2E]",
    textSecondary: "text-[#374151]",
    textMuted:     "text-[#6B7280]",

    // ── Nav ────────────────────────────────────────────────────────────────
    navBg: isJunior
      ? "bg-white/95 border-b-[3px] border-[#1A1A2E]"
      : "bg-white/95 border-b border-[#E5E7EB] backdrop-blur-md",

    // ── Inputs ─────────────────────────────────────────────────────────────
    input: isJunior
      ? "border-2 border-[#1A1A2E] rounded-xl bg-white text-[#1A1A2E] px-3 py-2"
      : "border border-[#D1D5DB] rounded-lg bg-white text-[#1A1A2E] px-3 py-2",

    // ── Badges ─────────────────────────────────────────────────────────────
    badge: isJunior
      ? "border-2 border-[#1A1A2E] rounded-full font-bold"
      : "border border-[#D1D5DB] rounded-md font-medium text-xs",

    // ── Accent colours ─────────────────────────────────────────────────────
    accent1: "#118AB2",
    accent2: "#FFD166",
    accent3: "#06D6A0",
    accent4: "#EF476F",
    accent5: "#C8B6FF",
    accent6: "#FF6B35",

    // ── Section headings ───────────────────────────────────────────────────
    sectionHeading: isJunior
      ? "text-xl font-bold text-[#1A1A2E]"
      : "text-lg font-semibold text-[#1A1A2E] tracking-tight",

    // ── Progress bars ──────────────────────────────────────────────────────
    progressBar: isJunior
      ? "h-4 rounded-full bg-[#FFD166]/30"
      : "h-2 rounded-full bg-[#E5E7EB]",

    // ── Show/hide cartoon elements ─────────────────────────────────────────
    showCartoon:      isJunior,
    showProfessional: isSenior,

    // ── Modal overlays ─────────────────────────────────────────────────────
    modalOverlay: "bg-black/40 backdrop-blur-sm",
    modalBg: isJunior
      ? "bg-white border-[3px] border-[#1A1A2E] rounded-2xl shadow-[8px_8px_0px_#1A1A2E]"
      : "bg-white border border-[#E5E7EB] rounded-2xl shadow-xl",

    // ── Component-specific helpers ─────────────────────────────────────────
    chatBubbleOwn: isJunior
      ? "bg-[#118AB2] text-white rounded-br-sm"
      : "bg-[#118AB2] text-white rounded-br-sm",
    chatBubbleOther: isJunior
      ? "bg-[#F3F4F6] text-[#1A1A2E] rounded-bl-sm border-2 border-[#E5E7EB]"
      : "bg-[#F3F4F6] text-[#1A1A2E] rounded-bl-sm border border-[#E5E7EB]",

    // ── Notification colours ───────────────────────────────────────────────
    notifUnread: isJunior
      ? "bg-[#118AB2]/5 border-[#E5E7EB]"
      : "bg-[#EFF8FF] border-[#E5E7EB]",
  };
}
