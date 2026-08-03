"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Hash } from "lucide-react";
import { Modal } from "./Modal";
import { useChannels } from "@/lib/hooks/useChannels";
import { listUsers } from "@/lib/repositories/users";
import { getOrCreateDirectMessage } from "@/lib/repositories/directMessages";
import { inputClass } from "@/lib/ui/formStyles";
import type { User } from "@/types/user";

interface GlobalSearchModalProps {
  currentUserId: string;
  onClose: () => void;
  onOpenChannel: (channelId: string) => void;
  onOpenDm: (dmId: string) => void;
}

export function GlobalSearchModal({
  currentUserId,
  onClose,
  onOpenChannel,
  onOpenDm,
}: GlobalSearchModalProps) {
  const { channels } = useChannels();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  useEffect(() => {
    listUsers()
      .then((all) => setUsers(all.filter((candidate) => candidate.uid !== currentUserId)))
      .catch(() => setUsers([]));
  }, [currentUserId]);

  const query = search.trim().toLowerCase();
  const filteredChannels = useMemo(
    () => (query ? channels.filter((channel) => channel.name.toLowerCase().includes(query)) : channels),
    [channels, query]
  );
  const filteredUsers = useMemo(
    () => (query ? users.filter((candidate) => candidate.name.toLowerCase().includes(query)) : users),
    [users, query]
  );

  const handleSelectUser = async (otherUser: User) => {
    setPendingUid(otherUser.uid);
    try {
      const dmId = await getOrCreateDirectMessage(currentUserId, otherUser.uid);
      onOpenDm(dmId);
    } finally {
      setPendingUid(null);
    }
  };

  return (
    <Modal title="Suche" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          autoFocus
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Channels oder Personen suchen…"
          className={inputClass}
        />

        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
          {filteredChannels.length > 0 && (
            <div>
              <span className="px-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Channels
              </span>
              <ul className="mt-1 flex flex-col gap-0.5">
                {filteredChannels.map((channel) => (
                  <li key={channel.id}>
                    <button
                      type="button"
                      onClick={() => onOpenChannel(channel.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
                    >
                      <Hash size={14} />
                      {channel.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div>
              <span className="px-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Personen
              </span>
              <ul className="mt-1 flex flex-col gap-0.5">
                {filteredUsers.map((candidate) => (
                  <li key={candidate.uid}>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(candidate)}
                      disabled={pendingUid === candidate.uid}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover hover:text-text-primary disabled:opacity-50"
                    >
                      <Image src={candidate.avatarUrl} alt="" width={20} height={20} className="rounded-full" />
                      {candidate.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {filteredChannels.length === 0 && filteredUsers.length === 0 && (
            <p className="px-2 py-3 text-sm text-text-tertiary">Keine Treffer.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
