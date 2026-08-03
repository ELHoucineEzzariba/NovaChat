"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Moon, Search, Sun } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTheme } from "@/lib/hooks/useTheme";
import { useUiStore } from "@/lib/store/uiStore";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { NotificationBell } from "./NotificationBell";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Topbar({ sidebarOpen, onToggleSidebar }: TopbarProps) {
  const { user } = useAuth();
  const openConversation = useUiStore((state) => state.openConversation);
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-3">
      <div className="flex items-center gap-2">
        <Image
          src="/images/brand/logo-mark.png"
          alt="NovaChat"
          width={28}
          height={28}
          className="rounded-md"
        />
        <span className="hidden font-bold text-text-primary sm:inline">NovaChat</span>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Sidebar einklappen" : "Sidebar ausklappen"}
          className="ml-1 rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <div className="mx-auto hidden max-w-md flex-1 md:block">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center gap-2 rounded-full border border-border bg-bg px-3 py-1.5 text-left text-sm text-text-tertiary transition-colors hover:border-accent/50"
        >
          <Search size={15} className="shrink-0" />
          <span className="flex-1 truncate">Suche in NovaChat…</span>
          <span className="rounded border border-border px-1.5 py-0.5 text-xs text-text-tertiary">⌘K</span>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <div className="mr-1 hidden items-center gap-0.5 rounded-full border border-border p-0.5 sm:flex">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            aria-label="Dunkles Design"
            aria-pressed={theme === "dark"}
            className={`rounded-full p-1.5 transition-colors ${
              theme === "dark" ? "bg-hover text-text-primary" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <Moon size={14} />
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            aria-label="Helles Design"
            aria-pressed={theme === "light"}
            className={`rounded-full p-1.5 transition-colors ${
              theme === "light" ? "bg-hover text-text-primary" : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <Sun size={14} />
          </button>
        </div>

        <NotificationBell />

        <ProfileMenu />
      </div>

      {searchOpen && user && (
        <GlobalSearchModal
          currentUserId={user.uid}
          onClose={() => setSearchOpen(false)}
          onOpenChannel={(channelId) => {
            setSearchOpen(false);
            openConversation(channelId, "channel");
          }}
          onOpenDm={(dmId) => {
            setSearchOpen(false);
            openConversation(dmId, "dm");
          }}
        />
      )}
    </div>
  );
}
