"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Modal } from "./Modal";
import { listUsers } from "@/lib/repositories/users";
import { getOrCreateDirectMessage } from "@/lib/repositories/directMessages";
import { inputClass } from "@/lib/ui/formStyles";
import type { User } from "@/types/user";

interface UserSearchModalProps {
  currentUserId: string;
  onClose: () => void;
  onSelect: (dmId: string) => void;
}

export function UserSearchModal({ currentUserId, onClose, onSelect }: UserSearchModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [creatingUid, setCreatingUid] = useState<string | null>(null);

  useEffect(() => {
    listUsers()
      .then((allUsers) => setUsers(allUsers.filter((candidate) => candidate.uid !== currentUserId)))
      .catch(() => setUsers([]));
  }, [currentUserId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((candidate) => candidate.name.toLowerCase().includes(query));
  }, [users, search]);

  const handleSelect = async (otherUser: User) => {
    setCreatingUid(otherUser.uid);
    try {
      const dmId = await getOrCreateDirectMessage(currentUserId, otherUser.uid);
      onSelect(dmId);
    } finally {
      setCreatingUid(null);
    }
  };

  return (
    <Modal title="Direktnachricht starten" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          autoFocus
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nach Namen suchen…"
          className={inputClass}
        />
        <ul className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-sm text-text-tertiary">Keine Nutzer gefunden.</p>
          ) : (
            filtered.map((candidate) => (
              <li key={candidate.uid}>
                <button
                  type="button"
                  onClick={() => handleSelect(candidate)}
                  disabled={creatingUid === candidate.uid}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover hover:text-text-primary disabled:opacity-50"
                >
                  <Image src={candidate.avatarUrl} alt="" width={24} height={24} className="rounded-full" />
                  {candidate.name}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </Modal>
  );
}
