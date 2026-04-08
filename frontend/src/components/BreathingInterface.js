import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { X } from "lucide-react";
import { vibrate } from "@/lib/haptics";

const BREATHING_ORB = "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/11d923b2a3fe0748d26ac2545f83ed937d3bae7e5b7961490d602369f27f650f.png";

const PHASES = [
  { name: "Inhale", duration: 4000, scale: 1.0 },
  { name: "Hold", duration: 7000, scale: 1.0 },
  { name: "Exhale", duration: 8000, scale: 0.6 },
];

export default function BreathingInterface() {
  const setBreathingActive = useAppStore((s) => s.setBreathingActive);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timer, setTimer] = useState(PHASES[0].duration / 1000);

  const phase = PHASES[phaseIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          const nextIdx = (phaseIndex + 1) % PHASES.length;
          setPhaseIndex(nextIdx);
          // Haptic feedback on phase change
          if (PHASES[nextIdx].name === 'Inhale') vibrate('breathe_in');
          else if (PHASES[nextIdx].name === 'Exhale') vibrate('breathe_out');
          return PHASES[nextIdx].duration / 1000;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phaseIndex]);

  const close = useCallback(() => setBreathingActive(false), [setBreathingActive]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#1e1b4b]/95 flex items-center justify-center" data-testid="breathing-interface" role="dialog" aria-label="Breathing exercise">
      <button onClick={close} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-xl" data-testid="breathing-close-btn" aria-label="Close breathing exercise">
        <X className="w-8 h-8" />
      </button>

      <div className="text-center">
        {/* Orb */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <img
            src={BREATHING_ORB}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain transition-transform"
            style={{
              transform: `scale(${phase.scale})`,
              transitionDuration: `${phase.duration}ms`,
              transitionTimingFunction: 'ease-in-out',
            }}
          />
          <div className="absolute inset-0 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(200,182,255,0.2) 0%, transparent 70%)',
            transform: `scale(${phase.scale * 1.3})`,
            transition: `transform ${phase.duration}ms ease-in-out`,
          }} />
        </div>

        {/* Phase text */}
        <div aria-live="assertive">
          <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="breathing-phase">
            {phase.name}
          </h2>
          <p className="text-6xl font-bold text-[#C8B6FF]" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="breathing-timer">
            {timer}
          </p>
        </div>

        {/* Phase indicators */}
        <div className="flex justify-center gap-3 mt-8">
          {PHASES.map((p, i) => (
            <div key={p.name} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              i === phaseIndex ? 'bg-[#C8B6FF] text-[#0F172A]' : 'bg-white/10 text-white/50'
            }`}>
              {p.name}
            </div>
          ))}
        </div>

        <p className="text-white/50 text-sm mt-6">Press <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd> or click X to close</p>
      </div>
    </div>
  );
}
