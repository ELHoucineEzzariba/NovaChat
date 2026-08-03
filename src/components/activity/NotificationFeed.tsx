"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useUiStore } from "@/lib/store/uiStore";
import { listUsers } from "@/lib/repositories/users";
import { markNotificationsRead } from "@/lib/repositories/notifications";
import { NotificationRow } from "./NotificationRow";
import type { NotificationType } from "@/types/notification";
import type { User } from "@/types/user";

interface NotificationFeedProps {
  title: string;
  filterType?: NotificationType;
  emptyIcon: LucideIcon;
  emptyText: string;
}

export function NotificationFeed({ title, filterType, emptyIcon: EmptyIcon, emptyText }: NotificationFeedProps) {
  const { user } = useAuth();
  const { notifications, loading } = useNotifications(user?.uid);
  const openConversation = useUiStore((state) => state.openConversation);
  const [usersById, setUsersById] = useState<Record<string, User>>({});

  const items = filterType ? notifications.filter((n) => n.type === filterType) : notifications;
  const unreadIdsKey = items
    .filter((n) => !n.read)
    .map((n) => n.id)
    .join(",");

  useEffect(() => {
    listUsers()
      .then((users) => setUsersById(Object.fromEntries(users.map((candidate) => [candidate.uid, candidate]))))
      .catch(() => setUsersById({}));
  }, []);

  useEffect(() => {
    if (!user || !unreadIdsKey) return;
    markNotificationsRead(user.uid, unreadIdsKey.split(","));
  }, [user, unreadIdsKey]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <span className="font-medium text-text-primary">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <p className="px-2 py-3 text-sm text-text-tertiary">Lädt…</p>
        ) : items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-text-tertiary">
            <EmptyIcon size={24} />
            <p className="text-sm">{emptyText}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {items.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                fromUser={usersById[notification.fromUserId]}
                onSelect={() =>
                  openConversation(
                    notification.conversationId,
                    notification.conversationCollection === "channels" ? "channel" : "dm"
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
