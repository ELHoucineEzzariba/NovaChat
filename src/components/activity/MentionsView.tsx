"use client";

import { AtSign } from "lucide-react";
import { NotificationFeed } from "./NotificationFeed";

export function MentionsView() {
  return (
    <NotificationFeed
      title="Erwähnungen"
      filterType="mention"
      emptyIcon={AtSign}
      emptyText="Noch keine Erwähnungen."
    />
  );
}
