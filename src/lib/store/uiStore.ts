/**
 * Globaler UI-Zustand (Zustand-Store): welche Konversation/Nav-Ansicht gerade
 * offen ist, Thread-/Info-Panel-Sichtbarkeit und ungelesene Zähler pro
 * Konversation. Enthält bewusst keine Nachrichteninhalte selbst – die kommen
 * per Firestore-Subscription aus den jeweiligen Hooks/Repositories.
 */
import { create } from "zustand";

export type ConversationType = "channel" | "dm";
export type NavView = "mentions" | "activity" | "favorites";

interface UiState {
  activeConversationId: string | null;
  activeConversationType: ConversationType | null;
  threadMessageId: string | null;
  infoPanelOpen: boolean;
  activeNavView: NavView | null;
  unreadCounts: Record<string, number>;
  openConversation: (id: string, type: ConversationType) => void;
  closeConversation: () => void;
  openThread: (messageId: string) => void;
  closeThread: () => void;
  toggleInfoPanel: () => void;
  openNavView: (view: NavView) => void;
  closeNavView: () => void;
  incrementUnread: (conversationId: string) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  activeConversationId: null,
  activeConversationType: null,
  threadMessageId: null,
  infoPanelOpen: false,
  activeNavView: null,
  unreadCounts: {},
  openConversation: (id, type) =>
    set((state) => ({
      activeConversationId: id,
      activeConversationType: type,
      threadMessageId: null,
      infoPanelOpen: false,
      activeNavView: null,
      unreadCounts: { ...state.unreadCounts, [id]: 0 },
    })),
  closeConversation: () =>
    set({
      activeConversationId: null,
      activeConversationType: null,
      threadMessageId: null,
      infoPanelOpen: false,
    }),
  openThread: (messageId) => set({ threadMessageId: messageId, infoPanelOpen: false }),
  closeThread: () => set({ threadMessageId: null }),
  toggleInfoPanel: () =>
    set((state) => ({ infoPanelOpen: !state.infoPanelOpen, threadMessageId: null })),
  openNavView: (view) =>
    set({
      activeNavView: view,
      activeConversationId: null,
      activeConversationType: null,
      threadMessageId: null,
      infoPanelOpen: false,
    }),
  closeNavView: () => set({ activeNavView: null }),
  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
      },
    })),
}));
