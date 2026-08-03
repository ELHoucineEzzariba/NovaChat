"use client";

/** Live-Liste der Direktnachrichten-Konversationen des aktuellen Nutzers. */
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { subscribeToUserDirectMessages } from "@/lib/repositories/directMessages";
import type { DirectMessageConversation } from "@/types/message";

export function useDirectMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<DirectMessageConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserDirectMessages(
      user.uid,
      (data) => {
        setConversations(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Direktnachrichten konnten nicht geladen werden.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  if (!user) {
    return { conversations: [], loading: false, error: null };
  }

  return { conversations, loading, error };
}
