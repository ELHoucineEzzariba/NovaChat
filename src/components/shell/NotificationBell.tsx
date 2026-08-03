"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useUiStore } from "@/lib/store/uiStore";
import { listUsers } from "@/lib/repositories/users";
import { markNotificationsRead } from "@/lib/repositories/notifications";
import { NotificationRow } from "@/components/activity/NotificationRow";
import type { User } from "@/types/user";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications } = useNotifications(user?.uid);
  const openConversation = useUiStore((state) => state.openConversation);
  const [open, setOpen] = useState(false);
  const [usersById, setUsersById] = useState<Record<string, User>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 8);
  const recentUnreadIdsKey = recent
    .filter((n) => !n.read)
    .map((n) => n.id)
    .join(",");

  useEffect(() => {
    if (!open) return;
    listUsers()
      .then((users) => setUsersById(Object.fromEntries(users.map((candidate) => [candidate.uid, candidate]))))
      .catch(() => setUsersById({}));
  }, [open]);

  useEffect(() => {
    if (!open || !user || !recentUnreadIdsKey) return;
    markNotificationsRead(user.uid, recentUnreadIdsKey.split(","));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim Öffnen einmal ausführen
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Benachrichtigungen"
        className="relative rounded p-2 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-strong px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-md border border-border bg-surface-elevated py-1 shadow-lg">
          <div className="border-b border-border px-3 py-2 text-sm font-medium text-text-primary">
            Benachrichtigungen
          </div>
          <div className="max-h-96 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="px-3 py-4 text-sm text-text-tertiary">Keine Benachrichtigungen.</p>
            ) : (
              recent.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  fromUser={usersById[notification.fromUserId]}
                  onSelect={() => {
                    setOpen(false);
                    openConversation(
                      notification.conversationId,
                      notification.conversationCollection === "channels" ? "channel" : "dm"
                    );
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
