"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hash, Plus, Users } from "lucide-react";
import { useUiStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useChannels } from "@/lib/hooks/useChannels";
import { createChannel } from "@/lib/repositories/channels";
import { listUsers } from "@/lib/repositories/users";
import { Modal } from "./Modal";
import { ChannelForm } from "@/components/channels/ChannelForm";
import { ChannelMembersModal } from "@/components/channels/ChannelMembersModal";
import type { Channel } from "@/types/channel";
import type { User } from "@/types/user";

/** Channel-Abschnitt der Sidebar: Liste, Erstellen-Dialog und Mitglieder-hinzufügen pro Zeile. */
export function ChannelList() {
  const { user } = useAuth();
  const { channels, loading: channelsLoading, error: channelsError } = useChannels();
  const { activeConversationId, unreadCounts, openConversation } = useUiStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [addMembersChannel, setAddMembersChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!createOpen) return;
    listUsers()
      .then((users) => setAvailableUsers(users.filter((candidate) => candidate.uid !== user?.uid)))
      .catch(() => setAvailableUsers([]));
  }, [createOpen, user?.uid]);

  const handleCreateChannel = async (values: { name: string; description: string; memberIds: string[] }) => {
    if (!user) return;
    const channelId = await createChannel({
      name: values.name,
      description: values.description,
      createdBy: user.uid,
      memberIds: values.memberIds,
    });
    setCreateOpen(false);
    openConversation(channelId, "channel");
  };

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="text-sm font-bold text-text-primary">Channels</span>
        <button
          type="button"
          aria-label="Channel erstellen"
          onClick={() => setCreateOpen(true)}
          className="rounded p-1 text-text-secondary transition-colors hover:bg-hover hover:text-text-primary"
        >
          <Plus size={14} />
        </button>
      </div>
      {channelsError ? (
        <p className="px-2 text-sm text-danger">{channelsError}</p>
      ) : channelsLoading ? (
        <p className="px-2 text-sm text-text-tertiary">Lädt…</p>
      ) : channels.length === 0 ? (
        <p className="px-2 text-sm text-text-tertiary">Noch keine Channels.</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          <AnimatePresence initial={false}>
            {channels.map((channel, index) => {
              const active = activeConversationId === channel.id;
              const unread = unreadCounts[channel.id] ?? 0;
              return (
                <motion.li
                  key={channel.id}
                  className="group flex items-center gap-1"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, delay: index * 0.02, ease: "easeOut" }}
                >
                  <button
                    type="button"
                    onClick={() => openConversation(channel.id, "channel")}
                    aria-current={active}
                    className={`flex flex-1 items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-accent bg-accent-subtle font-medium text-text-primary"
                        : "border-transparent text-text-secondary hover:bg-hover"
                    }`}
                  >
                    <Hash size={14} className={active ? "text-accent" : ""} />
                    <span className="flex-1 truncate text-left">{channel.name}</span>
                    {unread > 0 && (
                      <span className="rounded-full bg-danger-strong px-1.5 py-0.5 text-xs font-medium text-white">
                        {unread}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMembersChannel(channel)}
                    aria-label={`Mitglieder zu ${channel.name} hinzufügen`}
                    title="Mitglieder hinzufügen"
                    className="shrink-0 rounded p-1.5 text-text-tertiary opacity-0 transition-opacity hover:bg-hover hover:text-text-primary focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Users size={14} />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {createOpen && (
        <Modal title="Channel erstellen" onClose={() => setCreateOpen(false)}>
          <ChannelForm
            mode="create"
            availableUsers={availableUsers}
            submitLabel="Erstellen"
            onCancel={() => setCreateOpen(false)}
            onSubmit={handleCreateChannel}
          />
        </Modal>
      )}

      {addMembersChannel && user && (
        <ChannelMembersModal
          channel={addMembersChannel}
          currentUserId={user.uid}
          onClose={() => setAddMembersChannel(null)}
        />
      )}
    </div>
  );
}
