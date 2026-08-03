"use client";

/** Live-Liste der Antworten in einem Nachrichten-Thread. */
import { useEffect, useState } from "react";
import { subscribeToThreadReplies } from "@/lib/repositories/threads";
import type { ConversationPath } from "@/lib/repositories/messages";
import type { ThreadReply } from "@/types/message";

export function useThread(path: ConversationPath | null, messageId: string | null) {
  const [replies, setReplies] = useState<ThreadReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path || !messageId) return;

    const unsubscribe = subscribeToThreadReplies(
      path,
      messageId,
      (data) => {
        setReplies(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Antworten konnten nicht geladen werden.");
        setLoading(false);
      }
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on primitives, not object identity
  }, [path?.collection, path?.id, messageId]);

  if (!path || !messageId) {
    return { replies: [], loading: false, error: null };
  }

  return { replies, loading, error };
}
