import { create } from "zustand";

export const useAppStore = create((set) => ({
  // Navigation
  activeLesson: null,
  setActiveLesson: (lesson) => set({ activeLesson: lesson }),

  // Settings
  settings: {
    highContrast: false,
    fontSize: "medium",
    reduceMotion: false,
    hapticIntensity: "medium",
    soundscapeVolume: 50,
    inputChannels: { gaze: false, voice: false, gesture: false, touch: true, keyboard: true },
    federatedSharing: true,
  },
  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  // Cognitive state (simulated / emotion detection)
  cognitiveLoad: 30,
  attentionScore: 75,
  emotionState: "neutral",
  setCognitiveLoad: (v) => set({ cognitiveLoad: v }),
  setAttentionScore: (v) => set({ attentionScore: v }),
  setEmotionState: (v) => set({ emotionState: v }),

  // Breathing interface
  breathingActive: false,
  setBreathingActive: (v) => set({ breathingActive: v }),

  // AI Companion
  companionActive: false,
  setCompanionActive: (v) => set({ companionActive: v }),

  // Knowledge graph data
  concepts: [],
  mastery: [],
  setConcepts: (c) => set({ concepts: c }),
  setMastery: (m) => set({ mastery: m }),

  // Lessons
  lessons: [],
  setLessons: (l) => set({ lessons: l }),

  // Spaced repetition
  dueReviews: [],
  setDueReviews: (r) => set({ dueReviews: r }),
}));
