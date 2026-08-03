"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "@/components/auth/AvatarSelection";
import { useUiStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useChannels } from "@/lib/hooks/useChannels";
import { useThread } from "@/lib/hooks/useThread";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useSound } from "@/lib/hooks/useSound";
import { subscribeToMessage, type ConversationPath } from "@/lib/repositories/messages";
import { deleteThreadReply, editThreadReply, sendThreadReply } from "@/lib/repositories/threads";
import { listUsers } from "@/lib/repositories/users";
import { ThreadReplyItem } from "./ThreadReplyItem";
import { MessageInput } from "./MessageInput";
import { relativeTime } from "@/utils/relativeTime";
import type { Message } from "@/types/message";
import type { User } from "@/types/user";

export function ThreadPanel() {
  const { user } = useAuth();
  const profile = useUserProfile(user?.uid);
  const playSend = useSound("message-send");
  const { channels } = useChannels();
  const { threadMessageId, activeConversationId, activeConversationType, closeThread } = useUiStore();
  const [rootMessage, setRootMessage] = useState<Message | null>(null);
  const [usersById, setUsersById] = useState<Record<string, User>>({});

  const conversationPath: ConversationPath | null =
    activeConversationType === "channel" && activeConversationId
      ? { collection: "channels", id: activeConversationId }
      : null;

  const { replies, loading: repliesLoading, error: repliesError } = useThread(conversationPath, threadMessageId);

  const activeChannel = conversationPath
    ? channels.find((channel) => channel.id === conversationPath.id)
    : undefined;
  const members = activeChannel
    ? activeChannel.memberIds.map((uid) => usersById[uid]).filter((candidate): candidate is User => Boolean(candidate))
    : [];

  useEffect(() => {
    if (!threadMessageId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeThread();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [threadMessageId, closeThread]);

  useEffect(() => {
    if (!conversationPath || !threadMessageId) return;

    return subscribeToMessage(conversationPath, threadMessageId, (message) => {
      setRootMessage(message);
      if (!message) closeThread();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on primitives, not object identity
  }, [conversationPath?.collection, conversationPath?.id, threadMessageId, closeThread]);

  useEffect(() => {
    if (!threadMessageId) return;
    listUsers()
      .then((users) => setUsersById(Object.fromEntries(users.map((candidate) => [candidate.uid, candidate]))))
      .catch(() => setUsersById({}));
  }, [threadMessageId]);

  if (!threadMessageId || !conversationPath) return null;

  const sender = rootMessage ? usersById[rootMessage.senderId] : undefined;

  const handleSend = async (text: string) => {
    if (!user) return;
    await sendThreadReply(conversationPath, threadMessageId, user.uid, text);
    playSend(profile?.soundMuted ?? false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-medium text-text-primary">Thread</span>
        <button
          type="button"
          onClick={closeThread}
          aria-label="Thread schließen"
          className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {rootMessage && (
          <div className="flex items-start gap-3 border-b border-border pb-4">
            <Image
              src={sender?.avatarUrl ?? DEFAULT_AVATAR_URL}
              alt=""
              width={32}
              height={32}
              className="mt-0.5 shrink-0 rounded-full"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-text-primary">{sender?.name ?? "Unbekannt"}</span>
                <span className="text-xs text-text-tertiary">{relativeTime(rootMessage.createdAt)}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-text-primary">{rootMessage.text}</p>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-col gap-1">
          {repliesError ? (
            <p className="text-sm text-danger">{repliesError}</p>
          ) : repliesLoading ? (
            <p className="text-sm text-text-tertiary">Lädt…</p>
          ) : replies.length === 0 ? (
            <p className="text-sm text-text-tertiary">Noch keine Antworten.</p>
          ) : (
            replies.map((reply) => (
              <ThreadReplyItem
                key={reply.id}
                reply={reply}
                sender={usersById[reply.senderId]}
                isOwn={user?.uid === reply.senderId}
                onEdit={(text) => editThreadReply(conversationPath, threadMessageId, reply.id, text)}
                onDelete={() => deleteThreadReply(conversationPath, threadMessageId, reply.id)}
              />
            ))
          )}
        </div>
      </div>

      {user && <MessageInput members={members} onSend={handleSend} />}
    </div>
  );
}
