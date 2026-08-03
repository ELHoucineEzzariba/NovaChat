"use client";

import { useEffect, useRef } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "./useAuth";
import { useChannels } from "./useChannels";
import { useDirectMessages } from "./useDirectMessages";
import { useUserProfile } from "./useUserProfile";
import { useSound } from "./useSound";
import { useUiStore } from "@/lib/store/uiStore";

interface WatchedConversation {
  id: string;
  collectionName: "channels" | "directMessages";
}

/**
 * Beobachtet alle Channels/DMs des Nutzers auf neue Nachrichten, auch wenn sie
 * gerade nicht aktiv geöffnet sind. Erhöht den Unread-Badge und spielt bei
 * @mentions oder neuen DMs den "notification"-Sound (Design-Plan Punkt 6).
 */
export function useNotificationWatcher() {
  const { user } = useAuth();
  const profile = useUserProfile(user?.uid);
  const { channels } = useChannels();
  const { conversations: directMessages } = useDirectMessages();
  const activeConversationId = useUiStore((state) => state.activeConversationId);
  const incrementUnread = useUiStore((state) => state.incrementUnread);
  const playNotification = useSound("notification");

  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const mutedRef = useRef(profile?.soundMuted ?? false);
  useEffect(() => {
    mutedRef.current = profile?.soundMuted ?? false;
  }, [profile?.soundMuted]);

  const conversations: WatchedConversation[] = [
    ...channels.map((channel) => ({ id: channel.id, collectionName: "channels" as const })),
    ...directMessages.map((dm) => ({ id: dm.id, collectionName: "directMessages" as const })),
  ];
  const conversationsKey = conversations
    .map((conversation) => `${conversation.collectionName}:${conversation.id}`)
    .sort()
    .join(",");

  useEffect(() => {
    if (!user) return;

    const unsubscribers = conversations.map((conversation) => {
      const q = query(
        collection(db, conversation.collectionName, conversation.id, "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      let isFirstSnapshot = true;
      let lastSeenId: string | null = null;

      return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) return;
        const docSnap = snapshot.docs[0];

        if (isFirstSnapshot) {
          isFirstSnapshot = false;
          lastSeenId = docSnap.id;
          return;
        }
        if (docSnap.id === lastSeenId) return;
        lastSeenId = docSnap.id;

        const data = docSnap.data();
        if (data.senderId === user.uid) return;

        const isActive = activeConversationIdRef.current === conversation.id;
        const tabHidden = typeof document !== "undefined" && document.visibilityState !== "visible";
        if (isActive && !tabHidden) return;

        incrementUnread(conversation.id);

        const mentionedUserIds: string[] = data.mentionedUserIds ?? [];
        const isMention = mentionedUserIds.includes(user.uid);
        const isDm = conversation.collectionName === "directMessages";
        if (isMention || isDm) {
          playNotification(mutedRef.current);
        }
      });
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-subscribe only when the watched conversation set changes
  }, [user, conversationsKey, incrementUnread, playNotification]);
}
