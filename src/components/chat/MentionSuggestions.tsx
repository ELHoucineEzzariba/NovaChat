"use client";

import Image from "next/image";
import type { User } from "@/types/user";

interface MentionSuggestionsProps {
  matches: User[];
  onSelect: (member: User) => void;
}

/** Dropdown mit passenden Mitgliedern, während im Textfeld eine @-Erwähnung getippt wird. */
export function MentionSuggestions({ matches, onSelect }: MentionSuggestionsProps) {
  if (matches.length === 0) return null;

  return (
    <div className="absolute bottom-full left-4 z-10 mb-1 w-56 rounded-md border border-border bg-surface-elevated py-1 shadow-md">
      {matches.map((member) => (
        <button
          key={member.uid}
          type="button"
          onClick={() => onSelect(member)}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
        >
          <Image src={member.avatarUrl} alt="" width={18} height={18} className="rounded-full" />
          {member.name}
        </button>
      ))}
    </div>
  );
}
