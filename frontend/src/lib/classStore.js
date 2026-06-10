import { create } from "zustand";
import api from "./api";

export const useClassStore = create((set, get) => ({
  // State
  currentClass: null,
  myClasses: [],
  enrolledClass: null,
  teacher: null,
  isLoading: false,

  // Actions
  fetchMyClasses: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/classes/my-classes");
      set({ myClasses: data.classes || [] });
    } catch (err) {
      console.error("fetchMyClasses error:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEnrolledClass: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/enroll/my-class");
      set({
        enrolledClass: data.class || null,
        teacher: data.teacher || null,
      });
      return data;
    } catch (err) {
      console.error("fetchEnrolledClass error:", err);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  createClass: async (classData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/classes/create", classData);
      set((state) => ({
        myClasses: [data.class, ...state.myClasses],
        currentClass: data.class,
      }));
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  joinClass: async (classCode) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/enroll/join", { classCode });
      set({ enrolledClass: data.classInfo || null });
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  leaveClass: async () => {
    // Students can be removed by teacher; this clears local state
    set({ enrolledClass: null, teacher: null });
  },

  setCurrentClass: (cls) => set({ currentClass: cls }),
}));
