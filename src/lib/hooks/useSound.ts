"use client";

/** Spielt kurze UI-Sounds (Senden/Empfangen/Benachrichtigung) ab, sofern der Nutzer sie nicht stummgeschaltet hat. */
import { useCallback, useRef } from "react";

export type SoundName = "message-send" | "message-receive" | "notification";

const SOUND_SOURCES: Record<SoundName, string> = {
  "message-send": "/sounds/message-send.mp3",
  "message-receive": "/sounds/message-receive.mp3",
  notification: "/sounds/notification.mp3",
};

const VOLUME = 0.45;

export function useSound(name: SoundName) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return useCallback(
    (muted: boolean) => {
      if (muted || typeof window === "undefined") return;
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUND_SOURCES[name]);
        audioRef.current.volume = VOLUME;
      }
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Browser blockiert Autoplay ohne User-Geste – ignorieren.
      });
    },
    [name]
  );
}
