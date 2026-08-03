/**
 * Firestore-Zugriff auf die Benachrichtigungen eines Nutzers
 * (users/{uid}/notifications): Mentions, Reaktionen ("Likes") und neue
 * DM-Nachrichten. Wird von messages.ts beim Senden/Reagieren befüllt und von
 * der Glocke sowie den Erwähnungen-/Aktivitäts-Ansichten gelesen.
 */
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { ConversationPath } from "./messages";
import type { AppNotification, NotificationType } from "@/types/notification";

function notificationsCollection(uid: string) {
  return collection(db, "users", uid, "notifications");
}

interface CreateNotificationInput {
  type: NotificationType;
  fromUserId: string;
  conversationPath: ConversationPath;
  messageId: string;
  preview: string;
}

export async function createNotification(targetUserId: string, input: CreateNotificationInput) {
  await addDoc(notificationsCollection(targetUserId), {
    type: input.type,
    fromUserId: input.fromUserId,
    conversationCollection: input.conversationPath.collection,
    conversationId: input.conversationPath.id,
    messageId: input.messageId,
    preview: input.preview,
    createdAt: serverTimestamp(),
    read: false,
  });
}

export function subscribeToNotifications(
  uid: string,
  callback: (notifications: AppNotification[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(notificationsCollection(uid), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            type: data.type,
            fromUserId: data.fromUserId,
            conversationCollection: data.conversationCollection,
            conversationId: data.conversationId,
            messageId: data.messageId,
            preview: data.preview ?? "",
            createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
            read: data.read ?? false,
          } satisfies AppNotification;
        })
      );
    },
    onError
  );
}

export async function markNotificationsRead(uid: string, notificationIds: string[]) {
  if (notificationIds.length === 0) return;
  const batch = writeBatch(db);
  notificationIds.forEach((id) => {
    batch.update(doc(notificationsCollection(uid), id), { read: true });
  });
  await batch.commit();
}
