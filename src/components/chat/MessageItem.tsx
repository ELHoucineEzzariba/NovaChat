"use client";

/**
 * Eine einzelne Chat-Nachricht: Avatar, Text mit @-Mention-Hervorhebung,
 * Anhang, Reaktionen und (im Hover) Aktionsleiste. Detail-UI lebt in eigenen
 * Komponenten (siehe Imports), diese Datei orchestriert nur.
 */

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_AVATAR_URL } from "@/components/auth/AvatarSelection";
import { relativeTime } from "@/utils/relativeTime";
import { AttachmentPreview } from "./AttachmentPreview";
import { MessageHoverActions } from "./MessageHoverActions";
import { MessageReactions } from "./MessageReactions";
import type { Message } from "@/types/message";
import type { User } from "@/types/user";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderMessageText(text: string, mentionedNames: string[], isOwn: boolean) {
  if (mentionedNames.length === 0) return text;

  const pattern = new RegExp(`(@(?:${mentionedNames.map(escapeRegExp).join("|")})\\b)`, "g");
  const highlightClass = isOwn
    ? "rounded bg-white/20 px-1 font-medium text-white"
    : "rounded bg-accent/15 px-1 font-medium text-accent";
  return text
    .split(pattern)
    .map((part, index) =>
      index % 2 === 1 ? (
        <span key={index} className={highlightClass}>
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
}

interface MessageItemProps {
  message: Message;
  sender?: User;
  mentionedNames: string[];
  isOwn: boolean;
  currentUserId: string;
  isPulsing?: boolean;
  onReply?: () => void;
  onEdit: (text: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onToggleReaction: (emoji: string) => void;
}

export function MessageItem({
  message,
  sender,
  mentionedNames,
  isOwn,
  currentUserId,
  isPulsing = false,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}: MessageItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const [saving, setSaving] = useState(false);

  const cancelEdit = () => {
    setEditing(false);
    setDraft(message.text);
  };

  const submitEdit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === message.text) {
      cancelEdit();
      return;
    }
    setSaving(true);
    try {
      await onEdit(trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-3 rounded-md px-2 py-1.5 ${isOwn ? "flex-row-reverse" : ""}`}
    >
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 rounded-md bg-accent-subtle"
          />
        )}
      </AnimatePresence>

      <Image
        src={sender?.avatarUrl ?? DEFAULT_AVATAR_URL}
        alt=""
        width={32}
        height={32}
        className="relative mt-0.5 shrink-0 rounded-full"
      />
      <div className={`relative flex min-w-0 flex-1 flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-text-primary">{sender?.name ?? "Unbekannt"}</span>
          <span className="text-xs text-text-tertiary">{relativeTime(message.createdAt)}</span>
          {message.editedAt && <span className="text-xs text-text-tertiary">(bearbeitet)</span>}
        </div>

        {editing ? (
          <div className="mt-1 flex w-full flex-col gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitEdit();
                }
                if (event.key === "Escape") {
                  cancelEdit();
                }
              }}
              rows={2}
              autoFocus
              className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
            <div className="flex gap-3 text-xs">
              <button
                type="button"
                onClick={submitEdit}
                disabled={saving}
                className="font-medium text-accent hover:underline disabled:opacity-50"
              >
                Speichern
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="font-medium text-text-secondary hover:underline"
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <div className={`mt-0.5 flex flex-col gap-1.5 ${isOwn ? "items-end" : "items-start"}`}>
            {message.text && (
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  isOwn ? "bg-accent-strong text-white" : "bg-surface-elevated text-text-primary"
                }`}
              >
                {renderMessageText(message.text, mentionedNames, isOwn)}
              </div>
            )}
            {message.attachment && <AttachmentPreview attachment={message.attachment} isOwn={isOwn} />}
          </div>
        )}

        <MessageReactions
          reactions={message.reactions}
          currentUserId={currentUserId}
          onToggleReaction={onToggleReaction}
        />
      </div>

      {!editing && (
        <MessageHoverActions
          isOwn={isOwn}
          onReply={onReply}
          onEdit={() => setEditing(true)}
          onDelete={onDelete}
          onToggleReaction={onToggleReaction}
        />
      )}
    </div>
  );
}
