import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import api from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Settings, Accessibility, Volume2, Hand, RotateCcw, Save, Map, ChevronDown, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import VirtualTour from "@/components/VirtualTour";
import { DISABILITY_LABELS, getDisabilityProfile, applyDisabilityBodyClass } from "@/lib/disabilityProfiles";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { settings, updateSettings, setTourActive, setTourCompleted } = useAppStore();
  const { isJunior, isSenior, headingFont } = useGradeTheme();
  const [localSettings, setLocalSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [disabilityType, setDisabilityType] = useState(user?.disability_type || "prefer_not_to_say");
  const [gradeLevel, setGradeLevel] = useState(user?.grade_level || "class_1");
  const [childCode, setChildCode] = useState(user?.child_code || null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (user?.disability_type) setDisabilityType(user.disability_type);
    if (user?.grade_level) setGradeLevel(user.grade_level);
    if (user?.child_code) setChildCode(user.child_code);
    // Fetch child code if student and not present
    if (user?.role === "student" && !user?.child_code) {
      api.get("/student/my-code").then(({ data }) => setChildCode(data.child_code)).catch(() => {});
    }
  }, [user]);

  const handleStartTour = () => {
    setTourCompleted(false);
    localStorage.removeItem("neuralearn_tour_done");
    sessionStorage.setItem("neuralearn_launch_tour", "1");
    navigate("/dashboard");
  };

  useEffect(() => {
    const s = user?.settings || {};
    const initial = {
      highContrast: s.high_contrast ?? false,
      fontSize: s.font_size ?? "medium",
      reduceMotion: s.reduce_motion ?? false,
      hapticIntensity: s.haptic_intensity ?? "medium",
      soundscapeVolume: s.soundscape_volume ?? 50,
      gaze: s.input_channels?.gaze ?? false,
      voice: s.input_channels?.voice ?? false,
      gesture: s.input_channels?.gesture ?? false,
      touch: s.input_channels?.touch ?? true,
      keyboard: s.input_channels?.keyboard ?? true,
      federatedSharing: s.federated_sharing ?? true,
    };
    setLocalSettings(initial);
    updateSettings(initial);
  }, [user, updateSettings]);

  const update = (key, value) => {
    setLocalSettings((s) => ({ ...s, [key]: value }));
    // Apply immediately for UX
    updateSettings({ [key]: value });
  };

  const handleSave = async () => {
    if (!localSettings) return;
    setSaving(true);
    try {
      await api.put("/user/settings", {
        high_contrast: localSettings.highContrast,
        font_size: localSettings.fontSize,
        reduce_motion: localSettings.reduceMotion,
        haptic_intensity: localSettings.hapticIntensity,
        soundscape_volume: localSettings.soundscapeVolume,
        input_channels: {
          gaze: localSettings.gaze, voice: localSettings.voice,
          gesture: localSettings.gesture, touch: localSettings.touch,
          keyboard: localSettings.keyboard,
        },
        federated_sharing: localSettings.federatedSharing,
      });
      await api.put("/user/profile", {
        disability_type: disabilityType,
        grade_level: gradeLevel,
      });
      // Refresh full user from server to avoid partial context overwrite
      const { data } = await api.get("/auth/me");
      if (data.user) updateUser(data.user);
      applyDisabilityBodyClass(disabilityType);
      toast.success(isJunior ? "Settings saved! ✅" : "Settings saved successfully!");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch {
      toast.error("Failed to save settings");
    } finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all settings to defaults? This won't delete your learning data.")) return;
    const defaults = {
      highContrast: false, fontSize: "medium", reduceMotion: false,
      hapticIntensity: "medium", soundscapeVolume: 50,
      gaze: false, voice: false, gesture: false, touch: true, keyboard: true,
      federatedSharing: true,
    };
    setLocalSettings(defaults);
    updateSettings(defaults);
    setSaving(true);
    try {
      await api.put("/user/settings", {
        high_contrast: defaults.highContrast,
        font_size: defaults.fontSize,
        reduce_motion: defaults.reduceMotion,
        haptic_intensity: defaults.hapticIntensity,
        soundscape_volume: defaults.soundscapeVolume,
        input_channels: {
          gaze: defaults.gaze, voice: defaults.voice,
          gesture: defaults.gesture, touch: defaults.touch,
          keyboard: defaults.keyboard,
        },
        federated_sharing: defaults.federatedSharing,
      });
      toast.success("Settings reset to defaults!");
    } catch {
      toast.error("Failed to reset settings");
    } finally { setSaving(false); }
  };

  if (!localSettings) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="settings-page">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to={user?.role === "teacher" ? "/teacher-dashboard" : user?.role === "parent" ? "/parent-dashboard" : "/dashboard"} className="flex items-center gap-2 text-[#334155] hover:text-[#0F172A]" data-testid="settings-back-link">
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>
          <h1 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <Settings className="w-5 h-5 inline mr-1" /> Settings
          </h1>
          <div className="w-24" />
        </div>
      </nav>

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Learning Profile */}
        <section className="neura-card p-6" data-testid="settings-learning-profile">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4" style={headingFont}>Learning Profile</h2>
          <div className="space-y-4">
            <div>
              <p className="font-bold text-[#0F172A] mb-2">Disability / Learning Needs</p>
              <select value={disabilityType} onChange={(e) => setDisabilityType(e.target.value)} data-testid="settings-disability-select" className="w-full h-12 pl-4 border-2 border-[#0F172A] rounded-xl bg-white font-semibold">
                {Object.entries(DISABILITY_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-[#64748B] mt-2">{getDisabilityProfile(disabilityType).tip}</p>
            </div>
            <div>
              <p className="font-bold text-[#0F172A] mb-2">Class / Grade</p>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} data-testid="settings-grade-select" className="w-full h-12 pl-4 border-2 border-[#0F172A] rounded-xl bg-white font-semibold">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={`class_${i + 1}`}>Class {i + 1}</option>
                ))}
              </select>
            </div>
            {/* Child code for parent linking — students only */}
            {user?.role === "student" && (
              <div className="p-4 rounded-xl bg-[#06D6A0]/10 border-2 border-[#06D6A0]">
                <p className="font-bold text-[#065f46] mb-1">🔗 Your Parent Link Code</p>
                <p className="text-xs text-[#374151] mb-3">Share this code with your parent so they can link to your account and track your progress.</p>
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-center font-black text-2xl tracking-[0.3em] text-[#0F172A] bg-white border-2 border-[#06D6A0] rounded-xl py-2 px-4">
                    {childCode || "------"}
                  </span>
                  <button
                    onClick={() => {
                      if (childCode) {
                        navigator.clipboard.writeText(childCode);
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 2000);
                      }
                    }}
                    disabled={!childCode}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#06D6A0] text-white font-bold text-sm border-2 border-[#065f46] disabled:opacity-40"
                  >
                    {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {codeCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Accessibility */}
        <section className="neura-card p-6" data-testid="settings-accessibility">
          <div className="flex items-center gap-2 mb-4">
            <Accessibility className="w-5 h-5 text-[#118AB2]" />
            <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Accessibility</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#0F172A]">High Contrast Mode</p>
                <p className="text-sm text-[#64748B]">Increase visibility of text and elements</p>
              </div>
              <Switch checked={localSettings.highContrast} onCheckedChange={(v) => update("highContrast", v)} data-testid="settings-high-contrast" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#0F172A]">Reduce Motion</p>
                <p className="text-sm text-[#64748B]">Minimize animations and transitions</p>
              </div>
              <Switch checked={localSettings.reduceMotion} onCheckedChange={(v) => update("reduceMotion", v)} data-testid="settings-reduce-motion" />
            </div>
            <div>
              <p className="font-bold text-[#0F172A] mb-2">Font Size</p>
              <div className="relative">
                <select
                  value={localSettings.fontSize}
                  onChange={(e) => update("fontSize", e.target.value)}
                  data-testid="settings-font-size"
                  className="w-full h-12 pl-4 pr-10 border-2 border-[#0F172A] rounded-xl bg-white text-[#0F172A] font-semibold text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#118AB2]/30 cursor-pointer"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Haptic & Sound */}
        <section className="neura-card p-6" data-testid="settings-haptic-sound">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-[#FFD166]" />
            <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Haptic & Sound</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-bold text-[#0F172A] mb-2">Haptic Intensity</p>
              <div className="flex gap-2">
                {["off", "medium", "full"].map((v) => (
                  <button key={v} onClick={() => update("hapticIntensity", v)} className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold capitalize ${
                    localSettings.hapticIntensity === v ? 'border-[#118AB2] bg-[#118AB2]/10 text-[#118AB2]' : 'border-[#e2e8f0] text-[#334155]'
                  }`} data-testid={`settings-haptic-${v}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-[#0F172A]">Soundscape Volume</p>
                <span className="text-sm font-bold text-[#118AB2]">{localSettings.soundscapeVolume}%</span>
              </div>
              <Slider
                value={[localSettings.soundscapeVolume]}
                onValueChange={(v) => update("soundscapeVolume", v[0])}
                max={100}
                step={5}
                className="w-full"
                data-testid="settings-volume-slider"
              />
            </div>
          </div>
        </section>

        {/* Input Channels */}
        <section className="neura-card p-6" data-testid="settings-input-channels">
          <div className="flex items-center gap-2 mb-4">
            <Hand className="w-5 h-5 text-[#06D6A0]" />
            <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Input Channels</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: "keyboard", label: "Keyboard" },
              { key: "touch", label: "Touch" },
              { key: "voice", label: "Voice Commands" },
              { key: "gaze", label: "Eye Tracking" },
              { key: "gesture", label: "Hand Gestures" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <p className="font-bold text-[#0F172A]">{item.label}</p>
                <Switch checked={localSettings[item.key]} onCheckedChange={(v) => update(item.key, v)} data-testid={`settings-input-${item.key}`} />
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="neura-card p-6" data-testid="settings-privacy">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Privacy</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[#0F172A]">Federated Data Sharing</p>
              <p className="text-sm text-[#64748B]">Share anonymized learning stats with peers</p>
            </div>
            <Switch checked={localSettings.federatedSharing} onCheckedChange={(v) => update("federatedSharing", v)} data-testid="settings-federated" />
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleReset} className="neura-btn bg-white text-[#0F172A] flex-1 h-14" data-testid="settings-reset-btn">
            <RotateCcw className="w-5 h-5" /> Reset to Defaults
          </button>
          <button onClick={handleSave} disabled={saving} className="neura-btn bg-[#118AB2] text-white flex-1 h-14 disabled:opacity-50" data-testid="settings-save-btn">
            <Save className="w-5 h-5" /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Tour */}
        <div className="neura-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[#0F172A]" style={headingFont}>
                {isJunior ? "🗺️ Guided Tour" : "Guided Tour"}
              </p>
              <p className="text-sm text-[#64748B]">
                {isJunior ? "Let Benny show you around NeuraLearn!" : "Replay the interactive onboarding tour"}
              </p>
            </div>
            <button
              onClick={handleStartTour}
              className={`neura-btn h-10 px-4 text-sm ${isJunior ? "bg-[#FFD166] text-[#1A1A2E]" : "bg-indigo-600 text-white border-indigo-500"}`}
              data-testid="settings-start-tour-btn"
            >
              <Map className="w-4 h-4" /> Start Tour
            </button>
          </div>
        </div>
      </main>
      <VirtualTour />
    </div>
  );
}
