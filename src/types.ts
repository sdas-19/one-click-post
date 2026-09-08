export type PlatformId =
  | "facebook"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "snapchat";

export type ConnectionStatus = "connected" | "disconnected";

export interface PlatformAccount {
  connected: boolean;
  handle: string;
}

export type PlatformMap = Record<PlatformId, PlatformAccount>;

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  /** Short label for the account handle, e.g. "Page", "Channel" */
  handleLabel: string;
  brand: string;
  /** Fields this platform accepts as overrides */
  fields: ("title" | "caption" | "hashtags")[];
}

export type PostStatus =
  | "idle"
  | "queued"
  | "uploading"
  | "posting"
  | "success"
  | "error";

export interface PlatformOverride {
  title: string;
  caption: string;
  hashtags: string;
}

export type OverrideMap = Record<PlatformId, PlatformOverride>;

export type ViewId = "accounts" | "create" | "history";

export interface PostRecord {
  id: string;
  media_name: string;
  media_type: string;
  caption: string;
  platforms: string[];
  status: string;
  views: number;
  scheduled_for: string | null;
  created_at: string;
}
