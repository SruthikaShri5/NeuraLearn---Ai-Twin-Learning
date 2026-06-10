import { create } from "zustand";
import api from "./api";

export const useMessageStore = create((set, get) => ({
  // State
  conversations: {},   // keyed by conversationId
  currentMessages: [],
  currentConversationId: null,
  unreadCount: 0,

  // Actions
  fetchConversation: async (userId) => {
    try {
      const { data } = await api.get(`/messages/conversation/${userId}`);
      const msgs = data.messages || [];
      const convId = data.conversationId;
      set((state) => ({
        conversations: { ...state.conversations, [convId]: msgs },
        currentMessages: msgs,
        currentConversationId: convId,
      }));
      return data;
    } catch (err) {
      console.error("fetchConversation error:", err);
      return null;
    }
  },

  sendMessage: async (toUserId, message, attachments = []) => {
    try {
      const { data } = await api.post("/messages/send", { toUserId, message, attachments });
      const newMsg = data.message;
      set((state) => {
        const convId = newMsg.conversationId;
        const existing = state.conversations[convId] || [];
        return {
          conversations: { ...state.conversations, [convId]: [...existing, newMsg] },
          currentMessages:
            state.currentConversationId === convId
              ? [...state.currentMessages, newMsg]
              : state.currentMessages,
        };
      });
      return data;
    } catch (err) {
      console.error("sendMessage error:", err);
      throw err;
    }
  },

  markConversationRead: async (conversationId) => {
    try {
      await api.put(`/messages/read/${conversationId}`);
      await get().fetchUnreadCount();
    } catch (err) {
      console.error("markConversationRead error:", err);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get("/messages/unread-count");
      set({ unreadCount: data.count || 0 });
      return data.count || 0;
    } catch (err) {
      console.error("fetchUnreadCount error:", err);
      return 0;
    }
  },

  setCurrentConversation: (conversationId) => {
    const msgs = get().conversations[conversationId] || [];
    set({ currentConversationId: conversationId, currentMessages: msgs });
  },
}));
