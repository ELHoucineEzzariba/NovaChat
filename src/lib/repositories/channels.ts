/**
 * Firestore-Zugriff auf Channels: anlegen, bearbeiten, Mitglieder verwalten,
 * sowie den gemeinsamen Willkommens-Channel sicherstellen (siehe
 * ensureWelcomeChannelMembership, genutzt von useWelcomeChannel).
 */
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ensureSystemUser, SYSTEM_USER_ID } from "./users";
import type { Channel } from "@/types/channel";

const channelsRef = collection(db, "channels");

export const WELCOME_CHANNEL_NAME = "Willkommen";

export function subscribeToUserChannels(
  uid: string,
  callback: (channels: Channel[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(channelsRef, where("memberIds", "array-contains", uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const channels = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          description: data.description,
          createdBy: data.createdBy,
          memberIds: data.memberIds,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        } satisfies Channel;
      });
      channels.sort((a, b) => a.name.localeCompare(b.name));
      callback(channels);
    },
    onError
  );
}

interface CreateChannelInput {
  name: string;
  description: string;
  createdBy: string;
  memberIds: string[];
}

export async function createChannel(input: CreateChannelInput) {
  const memberIds = Array.from(new Set([...input.memberIds, input.createdBy]));
  const docRef = await addDoc(channelsRef, {
    name: input.name,
    description: input.description,
    createdBy: input.createdBy,
    memberIds,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateChannelDetails(
  channelId: string,
  data: { name: string; description: string }
) {
  await updateDoc(doc(db, "channels", channelId), data);
}

export async function addChannelMember(channelId: string, uid: string) {
  await updateDoc(doc(db, "channels", channelId), { memberIds: arrayUnion(uid) });
}

export async function removeChannelMember(channelId: string, uid: string) {
  await updateDoc(doc(db, "channels", channelId), { memberIds: arrayRemove(uid) });
}

/**
 * Stellt sicher, dass es einen gemeinsamen Willkommens-Channel gibt und der
 * angegebene Nutzer Mitglied ist. Wird bei jedem Login aufgerufen, damit auch
 * Bestandsnutzer automatisch aufgenommen werden.
 */
export async function ensureWelcomeChannelMembership(uid: string): Promise<string> {
  const snapshot = await getDocs(query(channelsRef, where("name", "==", WELCOME_CHANNEL_NAME)));

  if (snapshot.empty) {
    await ensureSystemUser();
    const docRef = await addDoc(channelsRef, {
      name: WELCOME_CHANNEL_NAME,
      description: "Herzlich willkommen bei NovaChat! Hier findet ihr Ankündigungen und könnt euch kennenlernen.",
      createdBy: SYSTEM_USER_ID,
      memberIds: [uid],
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "channels", docRef.id, "messages"), {
      senderId: SYSTEM_USER_ID,
      text: "Herzlich willkommen bei NovaChat! 👋 Schön, dass du da bist.",
      createdAt: serverTimestamp(),
      editedAt: null,
      reactions: [],
      threadReplyCount: 0,
      mentionedUserIds: [],
      attachment: null,
    });
    return docRef.id;
  }

  const channelDoc = snapshot.docs[0];
  const memberIds: string[] = channelDoc.data().memberIds ?? [];
  if (!memberIds.includes(uid)) {
    await updateDoc(channelDoc.ref, { memberIds: arrayUnion(uid) });
  }
  return channelDoc.id;
}
