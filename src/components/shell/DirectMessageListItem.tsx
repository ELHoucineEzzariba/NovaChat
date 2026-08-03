"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { subscribeToUser } from "@/lib/repositories/users";
import type { User, UserStatus } from "@/types/user";

const statusColor: Record<UserStatus, string> = {
  online: "bg-online",
  away: "bg-away",
  offline: "bg-offline",
};

const statusLabel: Record<UserStatus, string> = {
  online: "Online",
  away: "Abwesend",
  offline: "Offline",
};

interface DirectMessageListItemProps {
  otherUserId: string;
  active: boolean;
  unread: number;
  onSelect: () => void;
}

export function DirectMessageListItem({ otherUserId, active, unread, onSelect }: DirectMessageListItemProps) {
  const [otherUser, setOtherUser] = useState<User | null>(null);

  useEffect(() => subscribeToUser(otherUserId, setOtherUser), [otherUserId]);

  if (!otherUser) return null;

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active}
        className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-colors ${
          active
            ? "border-accent bg-accent-subtle"
            : "border-transparent text-text-secondary hover:bg-hover"
        }`}
      >
        <Image src={otherUser.avatarUrl} alt="" width={28} height={28} className="shrink-0 rounded-full" />
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-medium text-text-primary">{otherUser.name}</span>
          <span className="flex items-center gap-1 text-xs text-text-tertiary">
            <span className={`h-1.5 w-1.5 rounded-full ${statusColor[otherUser.status]}`} />
            {statusLabel[otherUser.status]}
          </span>
        </span>
        {unread > 0 && (
          <span className="rounded-full bg-danger-strong px-1.5 py-0.5 text-xs font-medium text-white">
            {unread}
          </span>
        )}
      </button>
    </motion.li>
  );
}
