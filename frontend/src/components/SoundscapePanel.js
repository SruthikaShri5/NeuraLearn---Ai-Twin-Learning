import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { playSoundscape, stopSoundscape, getSoundscapePresets, isSoundscapePlaying } from "@/lib/soundscape";
import { Volume2, VolumeX, X, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function SoundscapePanel({ onClose }) {
  const { settings, updateSettings } = useAppStore();
  const [playing, setPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState('focus');
  const [volume, setVolume] = useState(settings.soundscapeVolume ?? 50);
  const presets = getSoundscapePresets();

  const handlePlay = (presetId) => {
    setActivePreset(presetId);
    playSoundscape(presetId, volume);
    setPlaying(true);
  };

  const handleStop = () => {
    stopSoundscape();
    setPlaying(false);
  };

  const handleVolumeChange = (val) => {
    setVolume(val);
    updateSettings({ soundscapeVolume: val });
    if (playing) {
      playSoundscape(activePreset, val);
    }
  };

  useEffect(() => {
    return () => stopSoundscape();
  }, []);

  return (
    <div className="fixed bottom-20 left-4 w-72 neura-card p-4 z-50 bg-white" data-testid="soundscape-panel" role="complementary" aria-label="Soundscape controls">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#FFD166]" />
          <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Soundscape</span>
          {playing && <div className="w-2 h-2 rounded-full bg-[#06D6A0] animate-pulse" />}
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#EF476F]/10 text-[#64748B] hover:text-[#EF476F]" aria-label="Close soundscape panel" data-testid="soundscape-close-btn">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Presets */}
      <div className="space-y-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePlay(preset.id)}
            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
              activePreset === preset.id && playing
                ? 'border-[#118AB2] bg-[#118AB2]/10'
                : 'border-[#e2e8f0] hover:border-[#0F172A]'
            }`}
            data-testid={`soundscape-preset-${preset.id}`}
            aria-pressed={activePreset === preset.id && playing}
          >
            <p className="font-bold text-sm text-[#0F172A]">{preset.label}</p>
            <p className="text-xs text-[#64748B]">{preset.description}</p>
          </button>
        ))}
      </div>

      {/* Volume */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-[#64748B]" /> : <Volume2 className="w-4 h-4 text-[#118AB2]" />}
            <span className="text-sm font-bold text-[#0F172A]">Volume</span>
          </div>
          <span className="text-sm font-bold text-[#118AB2]">{volume}%</span>
        </div>
        <Slider
          value={[volume]}
          onValueChange={(v) => handleVolumeChange(v[0])}
          max={100}
          step={5}
          className="w-full"
          aria-label="Soundscape volume"
          data-testid="soundscape-volume-slider"
        />
      </div>

      {/* Stop button */}
      {playing && (
        <button
          onClick={handleStop}
          className="neura-btn bg-[#EF476F] text-white w-full h-10 text-sm"
          data-testid="soundscape-stop-btn"
        >
          <VolumeX className="w-4 h-4" /> Stop Soundscape
        </button>
      )}

      <p className="text-xs text-[#94a3b8] mt-2 text-center">
        Ambient sounds generated with Web Audio API
      </p>
    </div>
  );
}
