import { create } from "zustand";
import api from "./api";

export const useAssignmentStore = create((set, get) => ({
  // State
  assignments: { all: [], pending: [], submitted: [], graded: [] },
  classAssignments: [],
  submissions: [],
  isLoading: false,

  // Actions
  fetchStudentAssignments: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/assignments/student");
      set({
        assignments: {
          all: data.all || [],
          pending: data.pending || [],
          submitted: data.submitted || [],
          graded: data.graded || [],
        },
      });
      return data;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchClassAssignments: async (classId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/assignments/class/${classId}`);
      set({ classAssignments: data.assignments || [] });
      return data;
    } catch {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSubmissions: async (assignmentId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/assignments/submissions/${assignmentId}`);
      set({ submissions: data.submissions || [] });
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  createAssignment: async (assignmentData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/assignments/create", assignmentData);
      set((state) => ({
        classAssignments: [data.assignment, ...state.classAssignments],
      }));
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  submitAssignment: async (assignmentId, submissionData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post(`/assignments/submit/${assignmentId}`, submissionData);
      // Move from pending to submitted
      set((state) => {
        const pending = state.assignments.pending.filter((a) => a.id !== assignmentId);
        const assignment = state.assignments.pending.find((a) => a.id === assignmentId);
        const submitted = assignment
          ? [{ ...assignment, submission: data.submission }, ...state.assignments.submitted]
          : state.assignments.submitted;
        return {
          assignments: {
            ...state.assignments,
            pending,
            submitted,
            all: [...pending, ...submitted, ...state.assignments.graded],
          },
        };
      });
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  gradeSubmission: async (submissionId, gradeData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.put(`/assignments/grade/${submissionId}`, gradeData);
      set((state) => ({
        submissions: state.submissions.map((s) =>
          s.id === submissionId ? data.submission : s
        ),
      }));
      return data;
    } finally {
      set({ isLoading: false });
    }
  },
}));
