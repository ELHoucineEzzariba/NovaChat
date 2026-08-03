"use client";

/**
 * App-Gerüst nach dem Login: Topbar oben, darunter Sidebar / Chat- oder
 * Nav-Ansicht / optionale vierte Spalte (Thread oder Kanal-Info) nebeneinander.
 * Steuert außerdem die mobile Ansicht (immer nur eine Spalte sichtbar) sowie
 * den Tab-Titel mit ungelesenen Nachrichten.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { ThreadPanel } from "@/components/chat/ThreadPanel";
import { ChannelInfoPanel } from "@/components/channels/ChannelInfoPanel";
import { MentionsView } from "@/components/activity/MentionsView";
import { ActivityView } from "@/components/activity/ActivityView";
import { FavoritesView } from "@/components/activity/FavoritesView";
import { useUiStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useChannels } from "@/lib/hooks/useChannels";
import { useNotificationWatcher } from "@/lib/hooks/useNotificationWatcher";
import { useWelcomeChannel } from "@/lib/hooks/useWelcomeChannel";

export function MainLayout() {
  const { user } = useAuth();
  const { channels } = useChannels();
  const activeConversationId = useUiStore((state) => state.activeConversationId);
  const activeConversationType = useUiStore((state) => state.activeConversationType);
  const threadMessageId = useUiStore((state) => state.threadMessageId);
  const infoPanelOpen = useUiStore((state) => state.infoPanelOpen);
  const activeNavView = useUiStore((state) => state.activeNavView);
  const unreadCounts = useUiStore((state) => state.unreadCounts);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useNotificationWatcher();
  useWelcomeChannel();

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) NovaChat` : "NovaChat";
    return () => {
      document.title = "NovaChat";
    };
  }, [totalUnread]);

  const activeChannel =
    activeConversationType === "channel"
      ? channels.find((channel) => channel.id === activeConversationId)
      : undefined;

  const showFourthColumn = Boolean(threadMessageId) || (infoPanelOpen && Boolean(activeChannel));
  const mobileView = showFourthColumn
    ? "panel"
    : activeConversationId || activeNavView
      ? "chat"
      : "sidebar";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg">
      <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="flex flex-1 gap-2 overflow-hidden bg-bg p-2">
        <div
          className={`flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] lg:flex lg:shrink-0 ${
            mobileView === "sidebar" ? "flex w-full" : "hidden"
          } ${
            sidebarOpen
              ? "lg:w-72 lg:translate-x-0 lg:opacity-100"
              : "lg:w-0 lg:-translate-x-8 lg:opacity-0"
          }`}
        >
          <div className="flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-2xl bg-surface shadow-lg shadow-black/20">
            <Sidebar />
          </div>
        </div>

        <div className={`flex-col lg:flex lg:flex-1 ${mobileView === "chat" ? "flex w-full" : "hidden"}`}>
          <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-lg shadow-black/20">
            {activeNavView === "mentions" ? (
              <MentionsView />
            ) : activeNavView === "activity" ? (
              <ActivityView />
            ) : activeNavView === "favorites" ? (
              <FavoritesView />
            ) : (
              <ChatArea />
            )}
          </div>
        </div>

        <AnimatePresence>
          {showFourthColumn && (
            <motion.div
              key="fourth-column"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex w-full flex-col lg:w-96 lg:shrink-0"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-lg shadow-black/20">
                {threadMessageId ? (
                  <ThreadPanel />
                ) : activeChannel && user ? (
                  <ChannelInfoPanel channel={activeChannel} currentUserId={user.uid} />
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
