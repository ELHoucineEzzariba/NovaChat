"use client";

import Image from "next/image";
import { ArrowLeft, Headphones, MoreHorizontal, Star } from "lucide-react";
import type { Channel } from "@/types/channel";
import type { User } from "@/types/user";

interface ChatAreaHeaderProps {
  title: string;
  activeChannel?: Channel;
  channelMembers: User[];
  favorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  onToggleInfoPanel: () => void;
}

/** Kopfzeile der Chat-Spalte: Titel, Favoriten-Stern und (für Channels) Mitglieder-Vorschau + Info-Toggle. */
export function ChatAreaHeader({
  title,
  activeChannel,
  channelMembers,
  favorite,
  onToggleFavorite,
  onClose,
  onToggleInfoPanel,
}: ChatAreaHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Zurück zur Übersicht"
          className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary lg:hidden"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="truncate text-lg font-bold text-text-primary">{title}</span>
        {activeChannel && (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={favorite ? "Favorit entfernen" : "Als Favorit markieren"}
            aria-pressed={favorite}
            className="shrink-0 rounded p-1 text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary"
          >
            <Star size={16} className={favorite ? "fill-away text-away" : ""} />
          </button>
        )}
      </div>

      {activeChannel && (
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {channelMembers.slice(0, 3).map((member) => (
                <Image
                  key={member.uid}
                  src={member.avatarUrl}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full ring-2 ring-bg"
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-text-tertiary">{activeChannel.memberIds.length}</span>
          </div>
          <button
            type="button"
            aria-label="Sprachanruf"
            className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
          >
            <Headphones size={16} />
          </button>
          <button
            type="button"
            onClick={onToggleInfoPanel}
            aria-label="Kanal-Info"
            className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
