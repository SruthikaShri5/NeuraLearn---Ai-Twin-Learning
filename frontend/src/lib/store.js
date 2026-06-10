import { create } from "zustand";
import { persist } from "zustand/middleware";

// Grade group helper - used everywhere for conditional rendering
export function getGradeGroup(gradeLevel) {
  if (!gradeLevel) return "junior"; // default safe
  const num = parseInt(gradeLevel.replace("class_", ""), 10);
  if (isNaN(num)) return "junior";
  return num <= 5 ? "junior" : "senior"; // junior=1-5, senior=6-12
}

export const useAppStore = create(persist((set, get) => ({
  // Navigation
  activeLesson: null,
  setActiveLesson: (lesson) => set({ activeLesson: lesson }),

  // Grade-based styling
  gradeGroup: "junior", // "junior" (1-5) | "senior" (6-12)
  setGradeGroup: (gradeLevel) => set({ gradeGroup: getGradeGroup(gradeLevel) }),

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

  // Focus Mode
  focusMode: false,
  setFocusMode: (v) => set({ focusMode: v }),
  focusTreeMinutes: 0,
  incrementFocusTree: () => set((s) => ({ focusTreeMinutes: s.focusTreeMinutes + 1 })),
  resetFocusTree: () => set({ focusTreeMinutes: 0 }),

  // FSRS cards cache
  fsrsCards: {},
  setFsrsCard: (lessonId, card) => set((state) => ({
    fsrsCards: { ...state.fsrsCards, [lessonId]: card }
  })),

  // Mastery streaks per concept
  masteryStreaks: {},
  incrementMasteryStreak: (conceptId) => set((state) => ({
    masteryStreaks: {
      ...state.masteryStreaks,
      [conceptId]: (state.masteryStreaks[conceptId] || 0) + 1,
    }
  })),
  resetMasteryStreak: (conceptId) => set((state) => ({
    masteryStreaks: { ...state.masteryStreaks, [conceptId]: 0 }
  })),

  // Virtual tour
  tourActive: false,
  tourCompleted: false,
  setTourActive: (v) => set({ tourActive: v }),
  setTourCompleted: (v) => set({ tourCompleted: v }),

  // Offline queue
  offlineQueueCount: 0,
  setOfflineQueueCount: (v) => set({ offlineQueueCount: v }),

  // Student self-report mood
  selfReportMood: null,
  setSelfReportMood: (v) => set({ selfReportMood: v }),
  quizCountSinceReport: 0,
  incrementQuizCount: () => set((s) => ({ quizCountSinceReport: s.quizCountSinceReport + 1 })),
  resetQuizCount: () => set({ quizCountSinceReport: 0 }),

  // AI Tutor thinking state
  tutorThinking: false,
  setTutorThinking: (v) => set({ tutorThinking: v }),

  // Dynamic favicon emotion
  faviconEmotion: "neutral",
  setFaviconEmotion: (v) => set({ faviconEmotion: v }),

  // Teacher messages (real-time toasts)
  teacherMessages: [],
  addTeacherMessage: (msg) => set((s) => ({
    teacherMessages: [msg, ...s.teacherMessages].slice(0, 10)
  })),
  clearTeacherMessages: () => set({ teacherMessages: [] }),
}), {
  name: "neuralearn-storage",
  partialize: (state) => ({
    tourCompleted: state.tourCompleted,
    focusMode: state.focusMode,
    settings: state.settings,
  }),
}));
