"use client";

import { AtSign, Bell as BellIcon, Star } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useUiStore, type NavView } from "@/lib/store/uiStore";

const NAV_ITEMS: { icon: typeof AtSign; label: string; view: NavView; useUnreadBadge?: boolean }[] = [
  { icon: AtSign, label: "Erwähnungen", view: "mentions", useUnreadBadge: true },
  { icon: BellIcon, label: "Aktivität", view: "activity" },
  { icon: Star, label: "Favoriten", view: "favorites" },
];

/** Kurznavigation oberhalb der Channel-/DM-Liste zu den Erwähnungen-, Aktivitäts- und Favoriten-Ansichten. */
export function SidebarNav() {
  const { user } = useAuth();
  const { notifications } = useNotifications(user?.uid);
  const activeNavView = useUiStore((state) => state.activeNavView);
  const openNavView = useUiStore((state) => state.openNavView);

  const unreadMentions = notifications.filter((n) => n.type === "mention" && !n.read).length;

  return (
    <nav className="relative z-10 flex shrink-0 flex-col gap-0.5 px-2 pt-3 pb-2">
      {NAV_ITEMS.map((item) => {
        const active = activeNavView === item.view;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => openNavView(item.view)}
            aria-current={active}
            className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
              active ? "bg-accent-subtle text-text-primary" : "text-text-secondary hover:bg-hover hover:text-text-primary"
            }`}
          >
            <item.icon size={17} className={active ? "text-accent" : ""} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.useUnreadBadge && unreadMentions > 0 && (
              <span className="rounded-full bg-danger-strong px-1.5 py-0.5 text-xs font-medium text-white">
                {unreadMentions > 9 ? "9+" : unreadMentions}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
