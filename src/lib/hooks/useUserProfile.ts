"use client";

/** Live-Firestore-Profil (Name, Avatar, Status, Einstellungen) zu einer Nutzer-ID. */
import { useEffect, useState } from "react";
import { subscribeToUser } from "@/lib/repositories/users";
import type { User } from "@/types/user";

export function useUserProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeToUser(uid, setProfile);
  }, [uid]);

  return profile;
}
