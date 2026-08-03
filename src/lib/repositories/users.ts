/**
 * Firestore-Zugriff auf Nutzerprofile: anlegen, lesen, Status/Sound-
 * Einstellungen, Favoriten-Channels sowie den synthetischen System-Nutzer,
 * der die Willkommensnachricht verschickt (siehe SYSTEM_USER_ID).
 */
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { User, UserStatus } from "@/types/user";

interface NewUserDefaults {
  name: string;
  email: string;
  avatarUrl: string;
}

export const SYSTEM_USER_ID = "system";

export async function ensureSystemUser() {
  const ref = doc(db, "users", SYSTEM_USER_ID);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  await setDoc(ref, {
    uid: SYSTEM_USER_ID,
    name: "NovaChat",
    email: "system@novachat.app",
    avatarUrl: "/images/brand/logo-mark.png",
    status: "online" satisfies UserStatus,
    createdAt: serverTimestamp(),
    soundMuted: true,
    favoriteChannelIds: [],
  });
}

export async function ensureUserDocument(uid: string, defaults: NewUserDefaults) {
  const ref = doc(db, "users", uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  await setDoc(ref, {
    uid,
    name: defaults.name,
    email: defaults.email,
    avatarUrl: defaults.avatarUrl,
    status: "online" satisfies UserStatus,
    createdAt: serverTimestamp(),
    soundMuted: false,
    favoriteChannelIds: [],
  });
}

export async function getUserDocument(uid: string): Promise<User | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    uid,
    name: data.name,
    email: data.email,
    avatarUrl: data.avatarUrl,
    status: data.status,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    soundMuted: data.soundMuted ?? false,
    favoriteChannelIds: data.favoriteChannelIds ?? [],
  };
}

export async function updateUserStatus(uid: string, status: UserStatus) {
  await updateDoc(doc(db, "users", uid), { status });
}

export async function updateUserProfile(
  uid: string,
  data: { name: string; email: string; avatarUrl: string }
) {
  await updateDoc(doc(db, "users", uid), data);
}

export async function updateSoundMuted(uid: string, soundMuted: boolean) {
  await updateDoc(doc(db, "users", uid), { soundMuted });
}

export async function addFavoriteChannel(uid: string, channelId: string) {
  await updateDoc(doc(db, "users", uid), { favoriteChannelIds: arrayUnion(channelId) });
}

export async function removeFavoriteChannel(uid: string, channelId: string) {
  await updateDoc(doc(db, "users", uid), { favoriteChannelIds: arrayRemove(channelId) });
}

export function subscribeToUser(uid: string, callback: (user: User | null) => void) {
  return onSnapshot(doc(db, "users", uid), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.data();
    callback({
      uid: snapshot.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      status: data.status,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      soundMuted: data.soundMuted ?? false,
      favoriteChannelIds: data.favoriteChannelIds ?? [],
    });
  });
}

export async function listUsers(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      uid: docSnap.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      status: data.status,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      soundMuted: data.soundMuted ?? false,
      favoriteChannelIds: data.favoriteChannelIds ?? [],
    };
  });
}
