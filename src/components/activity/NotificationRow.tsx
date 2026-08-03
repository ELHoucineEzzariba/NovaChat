"use client";

import Image from "next/image";
import { AtSign, MessageCircle, Smile } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "@/components/auth/AvatarSelection";
import { relativeTime } from "@/utils/relativeTime";
import type { AppNotification } from "@/types/notification";
import type { User } from "@/types/user";

const TYPE_ICON = { mention: AtSign, reaction: Smile, dm: MessageCircle } as const;

function describeNotification(notification: AppNotification, fromName: string) {
  switch (notification.type) {
    case "mention":
      return `${fromName} hat dich erwähnt: „${notification.preview}“`;
    case "reaction":
      return `${fromName} hat auf deine Nachricht reagiert: ${notification.preview}`;
    case "dm":
      return `${fromName} hat dir geschrieben: „${notification.preview}“`;
    default:
      return `${fromName} hat etwas getan.`;
  }
}

interface NotificationRowProps {
  notification: AppNotification;
  fromUser?: User;
  onSelect: () => void;
}

export function NotificationRow({ notification, fromUser, onSelect }: NotificationRowProps) {
  const Icon = TYPE_ICON[notification.type];
  const fromName = fromUser?.name ?? "Jemand";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-hover ${
        notification.read ? "" : "bg-accent-subtle"
      }`}
    >
      <Image
        src={fromUser?.avatarUrl ?? DEFAULT_AVATAR_URL}
        alt=""
        width={32}
        height={32}
        className="mt-0.5 shrink-0 rounded-full"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm text-text-primary">
          <Icon size={13} className="shrink-0 text-text-tertiary" />
          <span className="truncate">{describeNotification(notification, fromName)}</span>
        </span>
        <span className="mt-0.5 block text-xs text-text-tertiary">{relativeTime(notification.createdAt)}</span>
      </span>
      {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
    </button>
  );
}
