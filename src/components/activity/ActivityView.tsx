"use client";

import { Bell } from "lucide-react";
import { NotificationFeed } from "./NotificationFeed";

export function ActivityView() {
  return <NotificationFeed title="Aktivität" emptyIcon={Bell} emptyText="Noch keine Aktivität." />;
}
