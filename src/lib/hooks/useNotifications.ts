"use client";

import { useEffect, useState } from "react";
import { subscribeToNotifications } from "@/lib/repositories/notifications";
import type { AppNotification } from "@/types/notification";

export function useNotifications(uid: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    return subscribeToNotifications(uid, (items) => {
      setNotifications(items);
      setLoading(false);
    });
  }, [uid]);

  if (!uid) {
    return { notifications: [], loading: false };
  }

  return { notifications, loading };
}
