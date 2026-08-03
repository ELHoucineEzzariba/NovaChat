"use client";

/**
 * Mittlere Spalte der App: aktiver Channel/DM. Kopfzeile lebt in
 * ChatAreaHeader, diese Datei lädt Nachrichten/Mitglieder und verdrahtet
 * Senden, Bearbeiten, Löschen, Reaktionen und den Favoriten-Stern.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useUiStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useChannels } from "@/lib/hooks/useChannels";
import { useDirectMessages } from "@/lib/hooks/useDirectMessages";
import { useMessages } from "@/lib/hooks/useMessages";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useSound } from "@/lib/hooks/useSound";
import { ChatAreaHeader } from "./ChatAreaHeader";
import { MessageList } from "./MessageList";
import { MessageListSkeleton } from "./MessageListSkeleton";
import { MessageInput } from "./MessageInput";
import {
  deleteMessage,
  editMessage,
  sendMessage,
  toggleReaction,
  type ConversationPath,
} from "@/lib/repositories/messages";
import { addFavoriteChannel, listUsers, removeFavoriteChannel } from "@/lib/repositories/users";
import type { Attachment } from "@/types/message";
import type { User } from "@/types/user";

export function ChatArea() {
  const { user } = useAuth();
  const profile = useUserProfile(user?.uid);
  const { channels } = useChannels();
  const { conversations: directMessages } = useDirectMessages();
  const { activeConversationId, activeConversationType, closeConversation, openThread, toggleInfoPanel } =
    useUiStore();
  const [usersById, setUsersById] = useState<Record<string, User>>({});
  const [pulsingIds, setPulsingIds] = useState<Set<string>>(new Set());
  const previousMessageIdsRef = useRef<Set<string> | null>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playSend = useSound("message-send");
  const playReceive = useSound("message-receive");

  const activeChannel =
    activeConversationType === "channel"
      ? channels.find((channel) => channel.id === activeConversationId)
      : undefined;

  const activeDm =
    activeConversationType === "dm"
      ? directMessages.find((conversation) => conversation.id === activeConversationId)
      : undefined;

  const otherUserId = activeDm && user ? activeDm.participantIds.find((id) => id !== user.uid) : undefined;
  const otherUser = otherUserId ? usersById[otherUserId] : undefined;

  const messagePath: ConversationPath | null = useMemo(() => {
    if (activeConversationType === "channel" && activeChannel) {
      return { collection: "channels", id: activeChannel.id };
    }
    if (activeConversationType === "dm" && activeConversationId) {
      return { collection: "directMessages", id: activeConversationId };
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on ids, not object identity
  }, [activeConversationType, activeChannel?.id, activeConversationId]);

  const { messages, loading: messagesLoading, error: messagesError } = useMessages(messagePath);

  useEffect(() => {
    if (!activeConversationId) return;
    listUsers()
      .then((users) => setUsersById(Object.fromEntries(users.map((candidate) => [candidate.uid, candidate]))))
      .catch(() => setUsersById({}));
  }, [activeConversationId]);

  // Neue eingehende Nachrichten von anderen: kurzer Puls + Ton, aber nicht beim ersten Laden der Historie.
  useEffect(() => {
    previousMessageIdsRef.current = null;
  }, [messagePath?.collection, messagePath?.id]);

  useEffect(() => {
    if (messagesLoading || !user) return;
    const previous = previousMessageIdsRef.current;
    const currentIds = new Set(messages.map((message) => message.id));

    if (previous) {
      const newFromOthers = messages.filter(
        (message) => !previous.has(message.id) && message.senderId !== user.uid
      );
      if (newFromOthers.length > 0) {
        playReceive(profile?.soundMuted ?? false);
        setPulsingIds(new Set(newFromOthers.map((message) => message.id)));
        if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
        pulseTimeoutRef.current = setTimeout(() => setPulsingIds(new Set()), 1200);
      }
    }
    previousMessageIdsRef.current = currentIds;
  }, [messages, messagesLoading, user, profile?.soundMuted, playReceive]);

  useEffect(() => {
    return () => {
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, []);

  if (!activeConversationId || !activeConversationType) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-sm text-text-tertiary">
        Wähle einen Channel oder eine Direktnachricht.
      </div>
    );
  }

  const title = activeConversationType === "channel" ? `# ${activeChannel?.name ?? ""}` : (otherUser?.name ?? "");

  const channelMembers = activeChannel
    ? activeChannel.memberIds.map((uid) => usersById[uid]).filter((candidate): candidate is User => Boolean(candidate))
    : [];

  const favorite = Boolean(activeChannel && profile?.favoriteChannelIds.includes(activeChannel.id));

  const handleToggleFavorite = () => {
    if (!activeChannel || !user) return;
    if (favorite) {
      removeFavoriteChannel(user.uid, activeChannel.id);
    } else {
      addFavoriteChannel(user.uid, activeChannel.id);
    }
  };

  const handleSend = async (text: string, mentionedUserIds: string[], attachment: Attachment | null = null) => {
    if (!messagePath || !user) return;
    await sendMessage(messagePath, user.uid, text, mentionedUserIds, attachment, otherUserId ?? null);
    playSend(profile?.soundMuted ?? false);
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <ChatAreaHeader
        title={title}
        activeChannel={activeChannel}
        channelMembers={channelMembers}
        favorite={favorite}
        onToggleFavorite={handleToggleFavorite}
        onClose={closeConversation}
        onToggleInfoPanel={toggleInfoPanel}
      />

      <div className="flex-1 overflow-y-auto">
        {activeChannel && (
          <p className="px-4 pt-3 text-sm text-text-tertiary">
            Dies ist der Beginn von <span className="font-medium text-text-secondary">#{activeChannel.name}</span>.
          </p>
        )}
        {!user || !messagePath ? (
          <p className="px-4 py-3 text-sm text-text-tertiary">Noch keine Nachrichten.</p>
        ) : messagesError ? (
          <p className="px-4 py-3 text-sm text-danger">{messagesError}</p>
        ) : messagesLoading ? (
          <MessageListSkeleton />
        ) : (
          <MessageList
            messages={messages}
            usersById={usersById}
            currentUserId={user.uid}
            pulsingIds={pulsingIds}
            onReply={activeConversationType === "channel" ? openThread : undefined}
            onEdit={(messageId, text) => editMessage(messagePath, messageId, text)}
            onDelete={(messageId) => deleteMessage(messagePath, messageId)}
            onToggleReaction={(messageId, emoji) => toggleReaction(messagePath, messageId, emoji, user.uid)}
          />
        )}
      </div>

      {user && messagePath && (
        <MessageInput
          members={channelMembers}
          onSend={handleSend}
          conversationPath={messagePath}
          placeholder={activeChannel ? `Nachricht an #${activeChannel.name}` : `Nachricht an ${title}`}
        />
      )}
    </div>
  );
}
