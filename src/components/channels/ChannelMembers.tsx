"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserMinus, UserPlus } from "lucide-react";
import { addChannelMember, removeChannelMember } from "@/lib/repositories/channels";
import { listUsers } from "@/lib/repositories/users";
import type { Channel } from "@/types/channel";
import type { User } from "@/types/user";

interface ChannelMembersProps {
  channel: Channel;
  canAdd: boolean;
  canRemove: boolean;
}

export function ChannelMembers({ channel, canAdd, canRemove }: ChannelMembersProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  useEffect(() => {
    listUsers()
      .then(setAllUsers)
      .catch(() => setAllUsers([]));
  }, [channel.memberIds]);

  const members = allUsers.filter((candidate) => channel.memberIds.includes(candidate.uid));
  const nonMembers = allUsers.filter((candidate) => !channel.memberIds.includes(candidate.uid));

  const handleAdd = async (uid: string) => {
    setPendingUid(uid);
    try {
      await addChannelMember(channel.id, uid);
    } finally {
      setPendingUid(null);
    }
  };

  const handleRemove = async (uid: string) => {
    setPendingUid(uid);
    try {
      await removeChannelMember(channel.id, uid);
    } finally {
      setPendingUid(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-sm font-medium text-text-secondary">Mitglieder ({members.length})</span>
        <ul className="mt-2 flex flex-col gap-1">
          {members.map((member) => (
            <li
              key={member.uid}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-hover"
            >
              <span className="flex items-center gap-2">
                <Image src={member.avatarUrl} alt="" width={20} height={20} className="rounded-full" />
                {member.name}
              </span>
              {canRemove && member.uid !== channel.createdBy && (
                <button
                  type="button"
                  onClick={() => handleRemove(member.uid)}
                  disabled={pendingUid === member.uid}
                  aria-label={`${member.name} entfernen`}
                  className="rounded p-1 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {canAdd && nonMembers.length > 0 && (
        <div>
          <span className="text-sm font-medium text-text-secondary">Hinzufügen</span>
          <ul className="mt-2 flex max-h-32 flex-col gap-1 overflow-y-auto">
            {nonMembers.map((candidate) => (
              <li
                key={candidate.uid}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-hover"
              >
                <span className="flex items-center gap-2">
                  <Image src={candidate.avatarUrl} alt="" width={20} height={20} className="rounded-full" />
                  {candidate.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdd(candidate.uid)}
                  disabled={pendingUid === candidate.uid}
                  aria-label={`${candidate.name} hinzufügen`}
                  className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary disabled:opacity-50"
                >
                  <UserPlus size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
