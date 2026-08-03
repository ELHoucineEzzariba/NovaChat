"use client";

/** Live-Liste der Channels, in denen der aktuelle Nutzer Mitglied ist. */
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { subscribeToUserChannels } from "@/lib/repositories/channels";
import type { Channel } from "@/types/channel";

export function useChannels() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserChannels(
      user.uid,
      (data) => {
        setChannels(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Channels konnten nicht geladen werden.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  if (!user) {
    return { channels: [], loading: false, error: null };
  }

  return { channels, loading, error };
}
