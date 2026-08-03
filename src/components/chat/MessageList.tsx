"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { formatDateHeading } from "@/utils/relativeTime";
import type { Message } from "@/types/message";
import type { User } from "@/types/user";

interface MessageListProps {
  messages: Message[];
  usersById: Record<string, User>;
  currentUserId: string;
  pulsingIds?: Set<string>;
  onReply?: (messageId: string) => void;
  onEdit: (messageId: string, text: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onToggleReaction: (messageId: string, emoji: string) => void;
}

export function MessageList({
  messages,
  usersById,
  currentUserId,
  pulsingIds,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return <p className="px-4 py-3 text-sm text-text-tertiary">Noch keine Nachrichten.</p>;
  }

  const { items } = messages.reduce<{
    items: { message: Message; heading: string | null }[];
    lastHeading: string | null;
  }>(
    (state, message) => {
      const heading = formatDateHeading(message.createdAt);
      state.items.push({ message, heading: heading !== state.lastHeading ? heading : null });
      return { items: state.items, lastHeading: heading };
    },
    { items: [], lastHeading: null }
  );

  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      {items.map(({ message, heading }) => (
        <div key={message.id}>
          {heading && (
            <div className="my-3 flex justify-center">
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-tertiary">
                {heading}
              </span>
            </div>
          )}
          <MessageItem
            message={message}
            sender={usersById[message.senderId]}
            mentionedNames={message.mentionedUserIds
              .map((uid) => usersById[uid]?.name)
              .filter((name): name is string => Boolean(name))}
            isOwn={message.senderId === currentUserId}
            currentUserId={currentUserId}
            isPulsing={pulsingIds?.has(message.id) ?? false}
            onReply={onReply ? () => onReply(message.id) : undefined}
            onEdit={(text) => onEdit(message.id, text)}
            onDelete={() => onDelete(message.id)}
            onToggleReaction={(emoji) => onToggleReaction(message.id, emoji)}
          />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
