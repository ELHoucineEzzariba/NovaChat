"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, Pencil, SmilePlus, Trash2 } from "lucide-react";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "👀", "🚀"];

interface MessageHoverActionsProps {
  isOwn: boolean;
  onReply?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleReaction: (emoji: string) => void;
}

/** Aktionsleiste, die beim Hover über eine Nachricht erscheint: Reaktion hinzufügen, antworten, bearbeiten, löschen. */
export function MessageHoverActions({ isOwn, onReply, onEdit, onDelete, onToggleReaction }: MessageHoverActionsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pickerOpen]);

  return (
    <div className="relative hidden shrink-0 items-center gap-1 group-hover:flex">
      <button
        type="button"
        onClick={() => setPickerOpen((open) => !open)}
        aria-label="Reaktion hinzufügen"
        className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
      >
        <SmilePlus size={14} />
      </button>
      {onReply && (
        <button
          type="button"
          onClick={onReply}
          aria-label="In Thread antworten"
          className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
        >
          <MessageSquareText size={14} />
        </button>
      )}
      {isOwn && (
        <>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Nachricht bearbeiten"
            className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Nachricht löschen"
            className="rounded p-1 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}

      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full z-10 mt-1 flex gap-1 rounded-md border border-border bg-surface-elevated p-1 shadow-md"
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onToggleReaction(emoji);
                  setPickerOpen(false);
                }}
                className="rounded p-1 text-base transition-colors hover:bg-hover"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
