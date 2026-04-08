import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Accessibility, Settings, Target, ArrowRight, ArrowLeft, Check } from "lucide-react";

const MASCOT_URL = "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/0d5a58ad11917c107d19197bb800270b2ab4affe5ac9d9ef444167284e0b11be.png";

const SUBJECTS = [
  { id: "mathematics", label: "Mathematics", color: "bg-[#FFD166]" },
  { id: "science", label: "Science", color: "bg-[#06D6A0]/30" },
  { id: "english", label: "English", color: "bg-[#C8B6FF]" },
  { id: "social_studies", label: "Social Studies", color: "bg-[#118AB2]/20" },
  { id: "arts", label: "Arts", color: "bg-[#EF476F]/20" },
];

const DAILY_GOALS = [
  { value: 15, label: "15 min", desc: "Quick daily boost" },
  { value: 30, label: "30 min", desc: "Balanced learning" },
  { value: 45, label: "45 min", desc: "Focused practice" },
  { value: 60, label: "60 min", desc: "Deep learning" },
];

const STEPS = [
  { icon: Sparkles, title: "Welcome", color: "bg-[#FFD166]" },
  { icon: Accessibility, title: "Accessibility", color: "bg-[#C8B6FF]" },
  { icon: Settings, title: "Input Modes", color: "bg-[#06D6A0]/30" },
  { icon: Target, title: "Goals", color: "bg-[#118AB2]/20" },
];

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({
    highContrast: false, reduceMotion: false, fontSize: "medium", screenReader: false,
    gaze: false, voice: false, gesture: false, touch: true, keyboard: true,
    subjects: ["mathematics"], dailyGoal: 30,
  });

  const updatePref = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));
  const toggleSubject = (id) => {
    setPrefs((p) => ({
      ...p,
      subjects: p.subjects.includes(id)
        ? p.subjects.filter((s) => s !== id)
        : p.subjects.length < 5 ? [...p.subjects, id] : p.subjects,
    }));
  };

  const finish = async () => {
    try {
      const { data } = await api.put("/user/profile", {
        onboarding_complete: true,
        subjects: prefs.subjects,
        daily_goal_minutes: prefs.dailyGoal,
      });
      await api.put("/user/settings", {
        high_contrast: prefs.highContrast,
        reduce_motion: prefs.reduceMotion,
        font_size: prefs.fontSize,
        input_channels: {
          gaze: prefs.gaze, voice: prefs.voice, gesture: prefs.gesture,
          touch: prefs.touch, keyboard: prefs.keyboard,
        },
      });
      if (data.user) updateUser(data.user);
      navigate("/dashboard");
    } catch {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6 py-12" data-testid="onboarding-page">
      <main id="main-content" className="w-full max-w-xl">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                i <= step ? 'border-[#118AB2] bg-[#118AB2] text-white' : 'border-[#e2e8f0] bg-white text-[#64748B]'
              }`}>
                {i < step ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-[#118AB2]' : 'bg-[#e2e8f0]'}`} />}
            </div>
          ))}
        </div>

        <div className="neura-card p-8" data-testid="onboarding-card">
          {/* Mascot */}
          <div className="flex justify-center mb-4" aria-hidden="true">
            <img src={MASCOT_URL} alt="" className="w-20 h-20 object-contain float-animation" />
          </div>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Welcome to NeuraLearn, {user?.name?.split(" ")[0] || "Learner"}!
              </h1>
              <p className="text-[#334155] text-lg">Let's set up your learning experience. This will only take a minute!</p>
              <button onClick={() => setStep(1)} className="neura-btn bg-[#118AB2] text-white text-lg px-12 h-14 mx-auto" data-testid="onboarding-start-btn">
                Let's Go! <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 1: Accessibility */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-[#0F172A] text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Accessibility Preferences
              </h2>
              <p className="text-[#334155] text-center">Customize how NeuraLearn looks and feels for you.</p>
              <div className="space-y-4">
                {[
                  { key: "highContrast", label: "High Contrast Mode", desc: "Increase text and element visibility" },
                  { key: "reduceMotion", label: "Reduce Motion", desc: "Minimize animations and transitions" },
                  { key: "screenReader", label: "Screen Reader Mode", desc: "Optimize for screen reader use" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border-2 border-[#e2e8f0] bg-white">
                    <div>
                      <p className="font-bold text-[#0F172A]">{item.label}</p>
                      <p className="text-sm text-[#64748B]">{item.desc}</p>
                    </div>
                    <Switch checked={prefs[item.key]} onCheckedChange={(v) => updatePref(item.key, v)} data-testid={`onboarding-${item.key}-switch`} />
                  </div>
                ))}
                <div className="p-4 rounded-xl border-2 border-[#e2e8f0] bg-white">
                  <p className="font-bold text-[#0F172A] mb-2">Font Size</p>
                  <div className="flex gap-2">
                    {["small", "medium", "large", "extra-large"].map((s) => (
                      <button key={s} onClick={() => updatePref("fontSize", s)} className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-bold capitalize ${prefs.fontSize === s ? 'border-[#118AB2] bg-[#118AB2]/10 text-[#118AB2]' : 'border-[#e2e8f0] text-[#334155]'}`} data-testid={`onboarding-font-${s}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Input modes */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-[#0F172A] text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Input Preferences
              </h2>
              <p className="text-[#334155] text-center">Choose how you want to interact with NeuraLearn.</p>
              <div className="space-y-3">
                {[
                  { key: "keyboard", label: "Keyboard", desc: "Navigate with keyboard shortcuts" },
                  { key: "touch", label: "Touch", desc: "Tap and swipe interactions" },
                  { key: "voice", label: "Voice Commands", desc: "Control with your voice" },
                  { key: "gaze", label: "Eye Tracking", desc: "Navigate by looking" },
                  { key: "gesture", label: "Hand Gestures", desc: "Use hand movements" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border-2 border-[#e2e8f0] bg-white">
                    <div>
                      <p className="font-bold text-[#0F172A]">{item.label}</p>
                      <p className="text-sm text-[#64748B]">{item.desc}</p>
                    </div>
                    <Switch checked={prefs[item.key]} onCheckedChange={(v) => updatePref(item.key, v)} data-testid={`onboarding-input-${item.key}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-[#0F172A] text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Learning Goals
              </h2>
              <p className="text-[#334155] text-center">Pick subjects and set your daily learning time.</p>
              <div>
                <p className="font-bold text-[#0F172A] mb-2">Subjects (up to 5)</p>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button key={s.id} onClick={() => toggleSubject(s.id)} className={`px-4 py-2 rounded-full border-2 font-bold text-sm transition-all ${
                      prefs.subjects.includes(s.id) ? 'border-[#118AB2] bg-[#118AB2]/10 text-[#118AB2]' : 'border-[#e2e8f0] text-[#334155] hover:border-[#0F172A]'
                    }`} data-testid={`onboarding-subject-${s.id}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold text-[#0F172A] mb-2">Daily Learning Time</p>
                <div className="grid grid-cols-2 gap-3">
                  {DAILY_GOALS.map((g) => (
                    <button key={g.value} onClick={() => updatePref("dailyGoal", g.value)} className={`p-4 rounded-xl border-2 text-left transition-all ${
                      prefs.dailyGoal === g.value ? 'border-[#118AB2] bg-[#118AB2]/10' : 'border-[#e2e8f0] hover:border-[#0F172A]'
                    }`} data-testid={`onboarding-goal-${g.value}`}>
                      <p className="font-bold text-[#0F172A] text-lg">{g.label}</p>
                      <p className="text-sm text-[#64748B]">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step > 0 && (
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep((s) => s - 1)} className="neura-btn bg-white text-[#0F172A] flex-1 h-14" data-testid="onboarding-back-btn">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              {step < 3 ? (
                <button onClick={() => setStep((s) => s + 1)} className="neura-btn bg-[#118AB2] text-white flex-1 h-14" data-testid="onboarding-next-btn">
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={finish} className="neura-btn bg-[#06D6A0] text-[#0F172A] flex-1 h-14" data-testid="onboarding-finish-btn">
                  Start Learning! <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Skip */}
          {step > 0 && step < 3 && (
            <button onClick={() => setStep((s) => s + 1)} className="w-full mt-3 text-[#64748B] text-sm font-semibold hover:text-[#0F172A]" data-testid="onboarding-skip-btn">
              Skip this step
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
