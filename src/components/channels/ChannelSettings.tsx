"use client";

import { useState } from "react";
import { Modal } from "@/components/shell/Modal";
import { ChannelForm } from "./ChannelForm";
import { ChannelMembers } from "./ChannelMembers";
import { updateChannelDetails } from "@/lib/repositories/channels";
import type { Channel } from "@/types/channel";

interface ChannelSettingsProps {
  channel: Channel;
  currentUserId: string;
  onClose: () => void;
}

export function ChannelSettings({ channel, currentUserId, onClose }: ChannelSettingsProps) {
  const isCreator = channel.createdBy === currentUserId;
  const [editing, setEditing] = useState(false);

  return (
    <Modal title={`# ${channel.name}`} onClose={onClose}>
      <div className="flex flex-col gap-5">
        {isCreator && editing ? (
          <ChannelForm
            mode="edit"
            initialValues={{ name: channel.name, description: channel.description }}
            submitLabel="Speichern"
            onCancel={() => setEditing(false)}
            onSubmit={async (values) => {
              await updateChannelDetails(channel.id, {
                name: values.name,
                description: values.description,
              });
              setEditing(false);
            }}
          />
        ) : (
          <div>
            <p className="text-sm text-text-secondary">{channel.description || "Keine Beschreibung."}</p>
            {isCreator && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-2 text-sm font-medium text-accent hover:underline"
              >
                Bearbeiten
              </button>
            )}
          </div>
        )}

        <ChannelMembers channel={channel} canAdd={true} canRemove={isCreator} />
      </div>
    </Modal>
  );
}
