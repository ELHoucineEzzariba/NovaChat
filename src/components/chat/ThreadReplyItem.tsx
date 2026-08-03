"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "@/components/auth/AvatarSelection";
import { relativeTime } from "@/utils/relativeTime";
import type { ThreadReply } from "@/types/message";
import type { User } from "@/types/user";

interface ThreadReplyItemProps {
  reply: ThreadReply;
  sender?: User;
  isOwn: boolean;
  onEdit: (text: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function ThreadReplyItem({ reply, sender, isOwn, onEdit, onDelete }: ThreadReplyItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reply.text);
  const [saving, setSaving] = useState(false);

  const cancelEdit = () => {
    setEditing(false);
    setDraft(reply.text);
  };

  const submitEdit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === reply.text) {
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
    <div className="group flex items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-hover">
      <Image
        src={sender?.avatarUrl ?? DEFAULT_AVATAR_URL}
        alt=""
        width={28}
        height={28}
        className="mt-0.5 shrink-0 rounded-full"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-text-primary">{sender?.name ?? "Unbekannt"}</span>
          <span className="text-xs text-text-tertiary">{relativeTime(reply.createdAt)}</span>
          {reply.editedAt && <span className="text-xs text-text-tertiary">(bearbeitet)</span>}
        </div>

        {editing ? (
          <div className="mt-1 flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitEdit();
                }
                if (event.key === "Escape") cancelEdit();
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
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-text-primary">{reply.text}</p>
        )}
      </div>

      {!editing && isOwn && (
        <div className="hidden shrink-0 items-center gap-1 group-hover:flex">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Antwort bearbeiten"
            className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Antwort löschen"
            className="rounded p-1 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
