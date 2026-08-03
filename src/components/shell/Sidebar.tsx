"use client";

/**
 * Zweite Spalte der App: Kurznavigation, Channel-/DM-Listen und Nutzerkarte.
 * Jeder Abschnitt ist eine eigenständige, selbstversorgende Komponente
 * (siehe Imports) – diese Datei ist nur noch das Layout-Gerüst.
 */

import { SidebarNav } from "./SidebarNav";
import { ChannelList } from "./ChannelList";
import { DirectMessageList } from "./DirectMessageList";
import { SidebarUserCard } from "./SidebarUserCard";

export function Sidebar() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-surface">
      {/* Dekorative Aurora-Grafik, rein visuell */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-20 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 0%, var(--color-accent-from) 0%, transparent 70%), radial-gradient(60% 60% at 80% 20%, var(--color-accent-to) 0%, transparent 70%)",
        }}
      />

      <SidebarNav />

      <div className="relative z-10 flex-1 overflow-y-auto border-t border-border px-2 py-3">
        <ChannelList />
        <DirectMessageList />
      </div>

      <SidebarUserCard />
    </div>
  );
}
