/** Firestore-Zugriff auf 1:1-Direktnachrichten-Konversationen (Dokument-ID = sortierte Nutzer-IDs). */
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { DirectMessageConversation } from "@/types/message";

const directMessagesRef = collection(db, "directMessages");

export function buildDirectMessageId(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join("_");
}

export function subscribeToUserDirectMessages(
  uid: string,
  callback: (conversations: DirectMessageConversation[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(directMessagesRef, where("participantIds", "array-contains", uid));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            participantIds: data.participantIds,
          } satisfies DirectMessageConversation;
        })
      );
    },
    onError
  );
}

export async function getOrCreateDirectMessage(uidA: string, uidB: string) {
  const dmId = buildDirectMessageId(uidA, uidB);
  const ref = doc(db, "directMessages", dmId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, {
      participantIds: [uidA, uidB].sort(),
      createdAt: serverTimestamp(),
    });
  }

  return dmId;
}
