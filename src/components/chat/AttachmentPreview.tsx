"use client";

import { Download, FileText } from "lucide-react";
import type { Attachment } from "@/types/message";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  isOwn: boolean;
}

/** Rendert einen Nachrichten-Anhang je nach Typ: Bild/GIF-Vorschau, Audio-Player oder Datei-Download-Karte. */
export function AttachmentPreview({ attachment, isOwn }: AttachmentPreviewProps) {
  if (attachment.type === "image" || attachment.type === "gif") {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block max-w-[280px]">
        {/* Nutzergenerierte Anhänge mit unbekannten Maßen: bewusst <img> statt next/image */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-72 w-full rounded-lg border border-border object-cover"
        />
      </a>
    );
  }

  if (attachment.type === "audio") {
    return (
      <audio controls preload="metadata" className="h-10 max-w-[280px]">
        <source src={attachment.url} type={attachment.mimeType} />
      </audio>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex max-w-[280px] items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
        isOwn
          ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
          : "border-border bg-surface-elevated text-text-primary hover:bg-hover"
      }`}
    >
      <FileText size={18} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{attachment.name}</span>
        <span className={`text-xs ${isOwn ? "text-white/70" : "text-text-tertiary"}`}>
          {formatFileSize(attachment.size)}
        </span>
      </span>
      <Download size={14} className="shrink-0" />
    </a>
  );
}
