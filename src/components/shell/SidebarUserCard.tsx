"use client";

import { useState } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { DEFAULT_AVATAR_URL } from "@/components/auth/AvatarSelection";

/** Nutzerkarte am unteren Sidebar-Rand mit Zugriff auf die Profil-Einstellungen. */
export function SidebarUserCard() {
  const { user } = useAuth();
  const profile = useUserProfile(user?.uid);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative z-10 mt-auto flex shrink-0 items-center gap-2 border-t border-border px-3 py-3">
      <Image
        src={profile?.avatarUrl ?? DEFAULT_AVATAR_URL}
        alt=""
        width={32}
        height={32}
        className="rounded-full"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">{profile?.name ?? "…"}</p>
        <span className="flex items-center gap-1 text-xs text-text-tertiary">
          <span className="h-1.5 w-1.5 rounded-full bg-online" />
          Online
        </span>
      </div>
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label="Profil-Einstellungen"
        className="rounded p-1 text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary"
      >
        <Settings size={16} />
      </button>

      {settingsOpen && profile && (
        <ProfileSettings currentUser={profile} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
