"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { logout } from "@/lib/services/auth";
import { subscribeToUser, updateSoundMuted, updateUserStatus } from "@/lib/repositories/users";
import { ProfileSettings } from "./ProfileSettings";
import type { User, UserStatus } from "@/types/user";

const STATUS_OPTIONS: { value: UserStatus; label: string; dot: string }[] = [
  { value: "online", label: "Online", dot: "bg-online" },
  { value: "away", label: "Abwesend", dot: "bg-away" },
  { value: "offline", label: "Offline", dot: "bg-offline" },
];

export function ProfileMenu() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToUser(user.uid, setProfile);
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!user || !profile) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Profilmenü"
        className="overflow-hidden rounded-full ring-2 ring-transparent transition-colors hover:ring-border"
      >
        <Image src={profile.avatarUrl} alt="" width={28} height={28} className="rounded-full" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-20 mt-2 w-56 origin-top-right rounded-lg rounded-tr-none border border-border bg-surface-elevated py-1 shadow-lg"
          >
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-medium text-text-primary">{profile.name}</p>
              <p className="truncate text-xs text-text-tertiary">{profile.email}</p>
            </div>

            <div className="border-b border-border py-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateUserStatus(user.uid, option.value)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover"
                >
                  <span className={`h-2 w-2 rounded-full ${option.dot}`} />
                  {option.label}
                  {profile.status === option.value && <span className="ml-auto text-xs text-accent">✓</span>}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => updateSoundMuted(user.uid, !profile.soundMuted)}
              className="flex w-full items-center gap-2 border-b border-border px-3 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover"
            >
              {profile.soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {profile.soundMuted ? "Sounds stummgeschaltet" : "Sounds aktiv"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSettingsOpen(true);
                setOpen(false);
              }}
              className="flex w-full px-3 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover"
            >
              Profil bearbeiten
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="flex w-full px-3 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover"
            >
              Abmelden
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {settingsOpen && <ProfileSettings currentUser={profile} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
