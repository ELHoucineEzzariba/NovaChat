"use client";

/**
 * Nachrichten-Eingabezeile: Text mit @-Mentions, Emoji, Datei-/GIF-Anhänge und
 * Sprachnachrichten. Die Detail-UI für Emoji, Mentions und Sprachaufnahme lebt
 * in eigenen Komponenten/Hooks (siehe Imports), diese Datei orchestriert nur.
 */

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Loader2, Mic, Paperclip, Send, X } from "lucide-react";
import { AttachmentUploadError, uploadAttachment } from "@/lib/repositories/attachments";
import { useVoiceRecorder } from "@/lib/hooks/useVoiceRecorder";
import { EmojiPickerButton } from "./EmojiPickerButton";
import { MentionSuggestions } from "./MentionSuggestions";
import { VoiceRecorderBanner } from "./VoiceRecorderBanner";
import type { ConversationPath } from "@/lib/repositories/messages";
import type { Attachment } from "@/types/message";
import type { User } from "@/types/user";

interface MessageInputProps {
  members: User[];
  placeholder?: string;
  conversationPath?: ConversationPath | null;
  onSend: (text: string, mentionedUserIds: string[], attachment?: Attachment | null) => Promise<void>;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MENTION_QUERY_PATTERN = /@([^\s@]*)$/;

export function MessageInput({ members, placeholder, conversationPath, onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);

  const attachmentsEnabled = Boolean(conversationPath);

  const mentionMatches = useMemo(() => {
    if (mentionQuery === null) return [];
    const query = mentionQuery.toLowerCase();
    return members.filter((member) => member.name.toLowerCase().includes(query)).slice(0, 5);
  }, [mentionQuery, members]);

  const submit = async (attachment: Attachment | null = null) => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;
    if (sending || uploading) return;
    setSending(true);
    try {
      const mentionedUserIds = members
        .filter((member) => new RegExp(`@${escapeRegExp(member.name)}\\b`).test(trimmed))
        .map((member) => member.uid);
      await onSend(trimmed, mentionedUserIds, attachment);
      setText("");
      setMentionQuery(null);
    } finally {
      setSending(false);
    }
  };

  const uploadAndSend = async (file: Blob, fileName: string, mimeType: string) => {
    if (!conversationPath) return;
    setUploadError(null);
    setUploading(true);
    try {
      const attachment = await uploadAttachment(conversationPath, file, fileName, mimeType);
      await submit(attachment);
    } catch (error) {
      setUploadError(error instanceof AttachmentUploadError ? error.message : "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  };

  const voiceRecorder = useVoiceRecorder(
    (blob) => uploadAndSend(blob, `sprachnachricht-${Date.now()}.webm`, blob.type),
    (message) => setUploadError(message)
  );

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setText(value);
    const cursor = event.target.selectionStart ?? value.length;
    const match = value.slice(0, cursor).match(MENTION_QUERY_PATTERN);
    setMentionQuery(match ? match[1] : null);
  };

  const selectMention = (member: User) => {
    const cursor = textareaRef.current?.selectionStart ?? text.length;
    const upToCursor = text.slice(0, cursor);
    const afterCursor = text.slice(cursor);
    const replaced = upToCursor.replace(MENTION_QUERY_PATTERN, `@${member.name} `);
    setText(replaced + afterCursor);
    setMentionQuery(null);

    requestAnimationFrame(() => {
      textareaRef.current?.setSelectionRange(replaced.length, replaced.length);
      textareaRef.current?.focus();
    });
  };

  const insertEmoji = (emoji: string) => {
    const cursor = textareaRef.current?.selectionStart ?? text.length;
    const next = text.slice(0, cursor) + emoji + text.slice(cursor);
    setText(next);
    requestAnimationFrame(() => {
      const position = cursor + emoji.length;
      textareaRef.current?.setSelectionRange(position, position);
      textareaRef.current?.focus();
    });
  };

  const handleFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    uploadAndSend(file, file.name, file.type);
  };

  return (
    <div className="relative border-t border-border px-4 py-3">
      {mentionQuery !== null && <MentionSuggestions matches={mentionMatches} onSelect={selectMention} />}

      {uploadError && (
        <div className="mb-2 flex items-center justify-between rounded-md border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs text-danger">
          {uploadError}
          <button type="button" onClick={() => setUploadError(null)} aria-label="Fehler ausblenden">
            <X size={14} />
          </button>
        </div>
      )}

      {voiceRecorder.recording ? (
        <VoiceRecorderBanner
          seconds={voiceRecorder.recordSeconds}
          onCancel={voiceRecorder.cancel}
          onStop={voiceRecorder.stop}
        />
      ) : (
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-2xl border border-border bg-surface px-3 py-2 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (mentionQuery !== null && mentionMatches.length > 0) {
                    selectMention(mentionMatches[0]);
                    return;
                  }
                  submit();
                }
                if (event.key === "Escape") setMentionQuery(null);
              }}
              rows={1}
              placeholder={placeholder ?? "Nachricht schreiben… (@ für Mentions)"}
              className="w-full resize-none bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChosen}
                  disabled={!attachmentsEnabled || uploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!attachmentsEnabled || uploading}
                  aria-label="Datei anhängen"
                  title={attachmentsEnabled ? "Datei anhängen" : "Anhänge sind in Thread-Antworten nicht verfügbar"}
                  className="rounded p-1 text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Paperclip size={15} />
                </button>

                <input
                  ref={gifInputRef}
                  type="file"
                  accept="image/gif"
                  className="hidden"
                  onChange={handleFileChosen}
                  disabled={!attachmentsEnabled || uploading}
                />
                <button
                  type="button"
                  onClick={() => gifInputRef.current?.click()}
                  disabled={!attachmentsEnabled || uploading}
                  aria-label="GIF senden"
                  title={attachmentsEnabled ? "GIF-Datei senden" : "Anhänge sind in Thread-Antworten nicht verfügbar"}
                  className="rounded px-1.5 py-1 text-xs font-semibold text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  GIF
                </button>

                <EmojiPickerButton onSelect={insertEmoji} />
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-text-tertiary sm:inline">⌘⏎</span>
                <button
                  type="button"
                  onClick={voiceRecorder.start}
                  disabled={!attachmentsEnabled || uploading}
                  aria-label="Sprachnachricht aufnehmen"
                  title={attachmentsEnabled ? "Sprachnachricht aufnehmen" : "Anhänge sind in Thread-Antworten nicht verfügbar"}
                  className="rounded p-1 text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Mic size={15} />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => submit()}
            disabled={sending || uploading || !text.trim()}
            aria-label="Nachricht senden"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-from to-accent-to text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}
