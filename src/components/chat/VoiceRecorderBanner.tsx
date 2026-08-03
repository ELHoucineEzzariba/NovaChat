"use client";

import { Square, X } from "lucide-react";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface VoiceRecorderBannerProps {
  seconds: number;
  onCancel: () => void;
  onStop: () => void;
}

/** Ersetzt die Eingabezeile, solange eine Sprachnachricht aufgenommen wird. */
export function VoiceRecorderBanner({ seconds, onCancel, onStop }: VoiceRecorderBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-2.5">
      <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-danger" />
      <span className="flex-1 text-sm text-text-primary">Aufnahme läuft… {formatDuration(seconds)}</span>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Aufnahme verwerfen"
        className="rounded p-1.5 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
      >
        <X size={16} />
      </button>
      <button
        type="button"
        onClick={onStop}
        aria-label="Aufnahme beenden und senden"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-strong text-white transition-opacity hover:opacity-90"
      >
        <Square size={14} />
      </button>
    </div>
  );
}
