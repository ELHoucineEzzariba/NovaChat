"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useUiStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDirectMessages } from "@/lib/hooks/useDirectMessages";
import { DirectMessageListItem } from "./DirectMessageListItem";
import { UserSearchModal } from "./UserSearchModal";

/** Direktnachrichten-Abschnitt der Sidebar: Liste plus Nutzersuche zum Starten neuer DMs. */
export function DirectMessageList() {
  const { user } = useAuth();
  const { conversations: directMessages, loading: dmLoading, error: dmError } = useDirectMessages();
  const { activeConversationId, unreadCounts, openConversation } = useUiStore();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="text-sm font-bold text-text-primary">Direktnachrichten</span>
        <button
          type="button"
          aria-label="Neue Direktnachricht"
          onClick={() => setSearchOpen(true)}
          className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
        >
          <Search size={14} />
        </button>
      </div>
      {dmError ? (
        <p className="px-2 text-sm text-danger">{dmError}</p>
      ) : dmLoading ? (
        <p className="px-2 text-sm text-text-tertiary">Lädt…</p>
      ) : directMessages.length === 0 ? (
        <p className="px-2 text-sm text-text-tertiary">Noch keine Direktnachrichten.</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {directMessages.map((conversation) => {
            const otherUserId = conversation.participantIds.find((uid) => uid !== user?.uid);
            if (!otherUserId) return null;
            return (
              <DirectMessageListItem
                key={conversation.id}
                otherUserId={otherUserId}
                active={activeConversationId === conversation.id}
                unread={unreadCounts[conversation.id] ?? 0}
                onSelect={() => openConversation(conversation.id, "dm")}
              />
            );
          })}
        </ul>
      )}

      {searchOpen && user && (
        <UserSearchModal
          currentUserId={user.uid}
          onClose={() => setSearchOpen(false)}
          onSelect={(dmId) => {
            setSearchOpen(false);
            openConversation(dmId, "dm");
          }}
        />
      )}
    </div>
  );
}
