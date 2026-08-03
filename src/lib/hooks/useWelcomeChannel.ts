"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useChannels } from "./useChannels";
import { useUiStore } from "@/lib/store/uiStore";
import { ensureWelcomeChannelMembership, WELCOME_CHANNEL_NAME } from "@/lib/repositories/channels";

/**
 * Sorgt dafür, dass jeder Nutzer Mitglied des gemeinsamen Willkommens-Channels
 * ist, und öffnet ihn direkt nach dem Login (einmal pro Sitzung), sofern noch
 * keine andere Konversation aktiv ist.
 */
export function useWelcomeChannel() {
  const { user } = useAuth();
  const { channels, loading } = useChannels();
  const activeConversationId = useUiStore((state) => state.activeConversationId);
  const openConversation = useUiStore((state) => state.openConversation);
  const hasLandedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    ensureWelcomeChannelMembership(user.uid);
  }, [user]);

  useEffect(() => {
    if (!user || loading || hasLandedRef.current || activeConversationId) return;
    const welcomeChannel = channels.find((channel) => channel.name === WELCOME_CHANNEL_NAME);
    if (welcomeChannel) {
      hasLandedRef.current = true;
      openConversation(welcomeChannel.id, "channel");
    }
  }, [user, loading, channels, activeConversationId, openConversation]);
}
