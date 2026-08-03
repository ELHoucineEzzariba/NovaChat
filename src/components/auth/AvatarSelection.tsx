"use client";

import Image from "next/image";

const AVATARS = [
  { id: "man1", src: "/images/avatars/man1.jpg" },
  { id: "man2", src: "/images/avatars/man2.jpg" },
  { id: "man3", src: "/images/avatars/man3.jpg" },
  { id: "women1", src: "/images/avatars/women1.jpg" },
  { id: "women2", src: "/images/avatars/women2.jpg" },
  { id: "women3", src: "/images/avatars/women3.jpg" },
];

export const DEFAULT_AVATAR_URL = AVATARS[0].src;

interface AvatarSelectionProps {
  value: string;
  onChange: (avatarUrl: string) => void;
}

export function AvatarSelection({ value, onChange }: AvatarSelectionProps) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {AVATARS.map((avatar) => {
        const selected = value === avatar.src;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.src)}
            aria-pressed={selected}
            aria-label={`Avatar ${avatar.id} auswählen`}
            className={`relative aspect-square overflow-hidden rounded-full ring-2 transition-colors ${
              selected ? "ring-accent" : "ring-transparent hover:ring-border"
            }`}
          >
            <Image src={avatar.src} alt="" fill sizes="48px" className="object-cover" />
          </button>
        );
      })}
    </div>
  );
}
