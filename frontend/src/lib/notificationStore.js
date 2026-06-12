import { create } from "zustand";
import api from "./api";

export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,

  // Actions
  fetchNotifications: async () => {
    try {
      const { data } = await api.get("/notifications/my");
      set({
        notifications: data.notifications || [],
        unreadCount: data.unreadCount || 0,
      });
      return data;
    } catch {
      return null;
    }
  },

  markAsRead: async (notifId) => {
    try {
      await api.put(`/notifications/read/${notifId}`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notifId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllRead: async () => {
    const { notifications } = get();
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      try {
        await api.put(`/notifications/read/${n.id}`);
      } catch {}
    }
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  broadcastMessage: async (classId, title, message, type = "announcement") => {
    try {
      const { data } = await api.post("/notifications/broadcast", {
        classId, title, message, type,
      });
      return data;
    } catch (err) {
      throw err;
    }
  },
}));
