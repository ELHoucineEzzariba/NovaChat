"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, LogOut, Pencil, Pin, Users } from "lucide-react";
import { ChannelSettings } from "./ChannelSettings";
import { removeChannelMember } from "@/lib/repositories/channels";
import { listUsers } from "@/lib/repositories/users";
import { useUiStore } from "@/lib/store/uiStore";
import type { Channel } from "@/types/channel";

interface ChannelInfoPanelProps {
  channel: Channel;
  currentUserId: string;
}

export function ChannelInfoPanel({ channel, currentUserId }: ChannelInfoPanelProps) {
  const closeConversation = useUiStore((state) => state.closeConversation);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    listUsers()
      .then((users) => {
        const members = users.filter((candidate) => channel.memberIds.includes(candidate.uid));
        setOnlineCount(members.filter((member) => member.status === "online").length);
      })
      .catch(() => setOnlineCount(null));
  }, [channel.memberIds]);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await removeChannelMember(channel.id, currentUserId);
      closeConversation();
    } finally {
      setLeaving(false);
    }
  };

  const createdDate = new Date(channel.createdAt).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="p-3">
        <div className="relative flex h-48 items-end overflow-hidden rounded-xl bg-gradient-to-br from-accent-from to-accent-to p-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40 blur-xl"
            style={{
              background:
                "radial-gradient(50% 50% at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 60%)",
            }}
          />
          <span className="relative text-2xl font-bold text-white"># {channel.name}</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Über diesen Kanal</h3>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Kanal bearbeiten"
            className="rounded p-1 text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary"
          >
            <Pencil size={14} />
          </button>
        </div>
        <p className="text-sm text-text-secondary">{channel.description || "Keine Beschreibung."}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border px-4 py-4">
        <div>
          <p className="flex items-center gap-1.5 text-lg font-semibold text-text-primary">
            <Users size={16} className="text-text-tertiary" />
            {channel.memberIds.length}
          </p>
          <span className="text-xs text-text-tertiary">Mitglieder</span>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-lg font-semibold text-text-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-online" />
            {onlineCount ?? "–"}
          </p>
          <span className="text-xs text-text-tertiary">Online</span>
        </div>
        <div className="col-span-2 text-xs text-text-tertiary">Erstellt am {createdDate}</div>
      </div>

      <div className="border-t border-border px-4 py-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">Medien, Links & Dateien</h3>
        <div className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border py-6 text-xs text-text-tertiary">
          <ImageIcon size={14} />
          Noch keine geteilten Medien
        </div>
      </div>

      <div className="border-t border-border px-4 py-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">Angepinnte Nachrichten</h3>
        <div className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border py-6 text-xs text-text-tertiary">
          <Pin size={14} />
          Keine angepinnten Nachrichten
        </div>
      </div>

      <div className="mt-auto border-t border-border px-4 py-4">
        <button
          type="button"
          onClick={handleLeave}
          disabled={leaving}
          className="flex items-center gap-2 text-sm font-medium text-danger transition-colors hover:underline disabled:opacity-50"
        >
          <LogOut size={14} />
          Kanal verlassen
        </button>
      </div>

      {settingsOpen && (
        <ChannelSettings channel={channel} currentUserId={currentUserId} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
