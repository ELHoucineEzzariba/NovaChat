"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Reaction } from "@/types/message";

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUserId: string;
  onToggleReaction: (emoji: string) => void;
}

/** Reihe der vorhandenen Reaktionen unter einer Nachricht, mit kurzem Bounce beim (De-)Selektieren. */
export function MessageReactions({ reactions, currentUserId, onToggleReaction }: MessageReactionsProps) {
  const [bouncingEmoji, setBouncingEmoji] = useState<string | null>(null);

  if (reactions.length === 0) return null;

  const handleToggle = (emoji: string) => {
    onToggleReaction(emoji);
    setBouncingEmoji(emoji);
    setTimeout(() => setBouncingEmoji((current) => (current === emoji ? null : current)), 300);
  };

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {reactions.map((reaction) => {
        const reacted = reaction.userIds.includes(currentUserId);
        return (
          <motion.button
            key={reaction.emoji}
            type="button"
            onClick={() => handleToggle(reaction.emoji)}
            animate={bouncingEmoji === reaction.emoji ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition-colors ${
              reacted
                ? "border-accent bg-accent-subtle text-accent"
                : "border-border bg-surface text-text-secondary hover:bg-hover"
            }`}
          >
            <span>{reaction.emoji}</span>
            <span>{reaction.userIds.length}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
