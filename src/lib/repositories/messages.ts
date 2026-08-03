/**
 * Firestore-Zugriff auf Nachrichten in Channels/DMs: Senden (inkl. Mention-
 * und DM-Benachrichtigungen), Bearbeiten, Löschen und Reaktionen. Thread-
 * Antworten leben in einer eigenen Subcollection, siehe threads.ts.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { createNotification } from "./notifications";
import type { Attachment, Message, Reaction } from "@/types/message";

export interface ConversationPath {
  collection: "channels" | "directMessages";
  id: string;
}

function messagesCollection(path: ConversationPath) {
  return collection(db, path.collection, path.id, "messages");
}

export function subscribeToMessages(
  path: ConversationPath,
  callback: (messages: Message[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(messagesCollection(path), orderBy("createdAt", "asc"));
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
            reactions: data.reactions ?? [],
            threadReplyCount: data.threadReplyCount ?? 0,
            mentionedUserIds: data.mentionedUserIds ?? [],
            attachment: data.attachment ?? null,
          } satisfies Message;
        })
      );
    },
    onError
  );
}

export function subscribeToMessage(
  path: ConversationPath,
  messageId: string,
  callback: (message: Message | null) => void
) {
  return onSnapshot(doc(db, path.collection, path.id, "messages", messageId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = snapshot.data();
    callback({
      id: snapshot.id,
      senderId: data.senderId,
      text: data.text,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      editedAt: data.editedAt?.toMillis?.() ?? null,
      reactions: data.reactions ?? [],
      threadReplyCount: data.threadReplyCount ?? 0,
      mentionedUserIds: data.mentionedUserIds ?? [],
      attachment: data.attachment ?? null,
    });
  });
}

export async function sendMessage(
  path: ConversationPath,
  senderId: string,
  text: string,
  mentionedUserIds: string[] = [],
  attachment: Attachment | null = null,
  dmRecipientId: string | null = null
) {
  const docRef = await addDoc(messagesCollection(path), {
    senderId,
    text,
    createdAt: serverTimestamp(),
    editedAt: null,
    reactions: [],
    threadReplyCount: 0,
    mentionedUserIds,
    attachment,
  });

  const preview = text.slice(0, 80) || (attachment ? `📎 ${attachment.name}` : "");

  for (const mentionedUserId of mentionedUserIds) {
    if (mentionedUserId === senderId) continue;
    await createNotification(mentionedUserId, {
      type: "mention",
      fromUserId: senderId,
      conversationPath: path,
      messageId: docRef.id,
      preview,
    });
  }

  if (dmRecipientId && dmRecipientId !== senderId) {
    await createNotification(dmRecipientId, {
      type: "dm",
      fromUserId: senderId,
      conversationPath: path,
      messageId: docRef.id,
      preview,
    });
  }

  return docRef.id;
}

export async function editMessage(path: ConversationPath, messageId: string, text: string) {
  await updateDoc(doc(db, path.collection, path.id, "messages", messageId), {
    text,
    editedAt: serverTimestamp(),
  });
}

export async function deleteMessage(path: ConversationPath, messageId: string) {
  await deleteDoc(doc(db, path.collection, path.id, "messages", messageId));
}

export async function toggleReaction(
  path: ConversationPath,
  messageId: string,
  emoji: string,
  userId: string
) {
  const ref = doc(db, path.collection, path.id, "messages", messageId);
  let notifyRecipientId: string | null = null;

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) return;

    const data = snapshot.data();
    const reactions: Reaction[] = data.reactions ?? [];
    const existing = reactions.find((reaction) => reaction.emoji === emoji);

    let updatedReactions: Reaction[];
    let added = false;
    if (!existing) {
      updatedReactions = [...reactions, { emoji, userIds: [userId] }];
      added = true;
    } else if (existing.userIds.includes(userId)) {
      updatedReactions = reactions
        .map((reaction) =>
          reaction.emoji === emoji
            ? { ...reaction, userIds: reaction.userIds.filter((id) => id !== userId) }
            : reaction
        )
        .filter((reaction) => reaction.userIds.length > 0);
    } else {
      updatedReactions = reactions.map((reaction) =>
        reaction.emoji === emoji ? { ...reaction, userIds: [...reaction.userIds, userId] } : reaction
      );
      added = true;
    }

    transaction.update(ref, { reactions: updatedReactions });

    if (added && data.senderId !== userId) {
      notifyRecipientId = data.senderId;
    }
  });

  if (notifyRecipientId) {
    await createNotification(notifyRecipientId, {
      type: "reaction",
      fromUserId: userId,
      conversationPath: path,
      messageId,
      preview: emoji,
    });
  }
}
