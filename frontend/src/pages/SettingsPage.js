import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/lib/store";
import api from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings, Accessibility, Volume2, Hand, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { settings, updateSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = user?.settings || {};
    const initial = {
      highContrast: s.high_contrast || false,
      fontSize: s.font_size || "medium",
      reduceMotion: s.reduce_motion || false,
      hapticIntensity: s.haptic_intensity || "medium",
      soundscapeVolume: s.soundscape_volume ?? 50,
      gaze: s.input_channels?.gaze || false,
      voice: s.input_channels?.voice || false,
      gesture: s.input_channels?.gesture || false,
      touch: s.input_channels?.touch ?? true,
      keyboard: s.input_channels?.keyboard ?? true,
      federatedSharing: s.federated_sharing ?? true,
    };
    setLocalSettings(initial);
    updateSettings(initial);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
      toast.success("Settings saved!");
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
    await handleSave();
  };

  if (!localSettings) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="settings-page">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-[#334155] hover:text-[#0F172A]" data-testid="settings-back-link">
            <ArrowLeft className="w-5 h-5" /> Dashboard
          </Link>
          <h1 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <Settings className="w-5 h-5 inline mr-1" /> Settings
          </h1>
          <div className="w-24" />
        </div>
      </nav>

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-8 space-y-6">
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
              <Select value={localSettings.fontSize} onValueChange={(v) => update("fontSize", v)}>
                <SelectTrigger className="h-12 border-2 border-[#0F172A] rounded-xl" data-testid="settings-font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
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
      </main>
    </div>
  );
}
