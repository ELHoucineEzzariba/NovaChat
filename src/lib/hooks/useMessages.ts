"use client";

/** Live-Nachrichtenliste für einen Channel/eine DM (null Path = nicht geladen). */
import { useEffect, useState } from "react";
import { subscribeToMessages, type ConversationPath } from "@/lib/repositories/messages";
import type { Message } from "@/types/message";

export function useMessages(path: ConversationPath | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;

    const unsubscribe = subscribeToMessages(
      path,
      (data) => {
        setMessages(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Nachrichten konnten nicht geladen werden.");
        setLoading(false);
      }
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on primitive fields, not object identity
  }, [path?.collection, path?.id]);

  if (!path) {
    return { messages: [], loading: false, error: null };
  }

  return { messages, loading, error };
}
