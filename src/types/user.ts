export type UserStatus = "online" | "away" | "offline";

export interface User {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: UserStatus;
  createdAt: number;
  soundMuted: boolean;
  favoriteChannelIds: string[];
}
