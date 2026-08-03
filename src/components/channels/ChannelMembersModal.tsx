"use client";

import { Modal } from "@/components/shell/Modal";
import { ChannelMembers } from "./ChannelMembers";
import type { Channel } from "@/types/channel";

interface ChannelMembersModalProps {
  channel: Channel;
  currentUserId: string;
  onClose: () => void;
}

export function ChannelMembersModal({ channel, currentUserId, onClose }: ChannelMembersModalProps) {
  const isCreator = channel.createdBy === currentUserId;

  return (
    <Modal title={`# ${channel.name} – Mitglieder`} onClose={onClose}>
      <ChannelMembers channel={channel} canAdd canRemove={isCreator} />
    </Modal>
  );
}
