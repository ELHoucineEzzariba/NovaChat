"use client";

import { Hash, Star } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useChannels } from "@/lib/hooks/useChannels";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useUiStore } from "@/lib/store/uiStore";

export function FavoritesView() {
  const { user } = useAuth();
  const profile = useUserProfile(user?.uid);
  const { channels } = useChannels();
  const openConversation = useUiStore((state) => state.openConversation);

  const favoriteChannels = channels.filter((channel) => profile?.favoriteChannelIds.includes(channel.id));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <span className="font-medium text-text-primary">Favoriten</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {favoriteChannels.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-text-tertiary">
            <Star size={24} />
            <p className="text-sm">Noch keine favorisierten Channels.</p>
            <p className="max-w-56 text-xs">
              Markiere einen Channel im Chat-Header mit dem Stern, um ihn hier zu sehen.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {favoriteChannels.map((channel) => (
              <li key={channel.id}>
                <button
                  type="button"
                  onClick={() => openConversation(channel.id, "channel")}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
                >
                  <Hash size={14} />
                  <span className="flex-1 truncate">{channel.name}</span>
                  <Star size={14} className="fill-away text-away" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
