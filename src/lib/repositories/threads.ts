/** Firestore-Zugriff auf Thread-Antworten (Subcollection unter einer Nachricht) inkl. Antwortzähler auf der Root-Nachricht. */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { ConversationPath } from "./messages";
import type { ThreadReply } from "@/types/message";

function threadCollection(path: ConversationPath, messageId: string) {
  return collection(db, path.collection, path.id, "messages", messageId, "thread");
}

function messageDoc(path: ConversationPath, messageId: string) {
  return doc(db, path.collection, path.id, "messages", messageId);
}

export function subscribeToThreadReplies(
  path: ConversationPath,
  messageId: string,
  callback: (replies: ThreadReply[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(threadCollection(path, messageId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            senderId: data.senderId,
            text: data.text,
            createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
            editedAt: data.editedAt?.toMillis?.() ?? null,
          } satisfies ThreadReply;
        })
      );
    },
    onError
  );
}

export async function sendThreadReply(
  path: ConversationPath,
  messageId: string,
  senderId: string,
  text: string
) {
  await addDoc(threadCollection(path, messageId), {
    senderId,
    text,
    createdAt: serverTimestamp(),
    editedAt: null,
  });
  await updateDoc(messageDoc(path, messageId), { threadReplyCount: increment(1) });
}

export async function editThreadReply(
  path: ConversationPath,
  messageId: string,
  replyId: string,
  text: string
) {
  await updateDoc(doc(threadCollection(path, messageId), replyId), {
    text,
    editedAt: serverTimestamp(),
  });
}

export async function deleteThreadReply(path: ConversationPath, messageId: string, replyId: string) {
  await deleteDoc(doc(threadCollection(path, messageId), replyId));
  await updateDoc(messageDoc(path, messageId), { threadReplyCount: increment(-1) });
}
