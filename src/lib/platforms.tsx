import type { PlatformConfig, PlatformId, PlatformMap } from "@/types";

type IconProps = { className?: string };

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.36 2.67.94 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.12-1.38 5.88 5.88 0 0 0 1.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.12A5.88 5.88 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z" />
    </svg>
  );
}

function YouTubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.55 15.57V8.43L15.82 12z" />
    </svg>
  );
}

function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.06v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.3 0 .6.05.88.13v-3.1a5.96 5.96 0 0 0-.88-.07A5.97 5.97 0 0 0 3 15.03a5.97 5.97 0 0 0 5.97 5.97A5.97 5.97 0 0 0 14.94 15V8.66a7.86 7.86 0 0 0 4.57 1.46V7.06a4.85 4.85 0 0 1-.08-.37z" />
    </svg>
  );
}

function SnapchatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.2 23h-.41c-.31 0-.32-.01-.95-.08a4.3 4.3 0 0 1-1.3-.27 2.7 2.7 0 0 0-.94-.2c-.2-.08-.4-.17-.6-.27-.4-.2-.8-.2-1.2 0-.27.13-.54.27-.82.37-.5.18-.9-.06-.97-.6-.04-.27-.06-.55-.1-.82-.05-.36-.2-.5-.56-.56-.2-.03-.4-.05-.6-.1-.5-.13-.6-.45-.2-.8.34-.3.75-.5 1.15-.66.6-.24 1.1-.6 1.5-1.1.2-.25.3-.5.15-.82a4.7 4.7 0 0 0-.3-.5c-.4-.65-.8-1.3-1-2.05-.2-.8-.1-1.5.4-2.15.4-.5.5-1.1.5-1.7 0-.6 0-1.2.1-1.8.2-1.4.9-2.5 2.1-3.2a5.5 5.5 0 0 1 3.7-.5c.6.1 1.2.3 1.7.6 1.1.7 1.8 1.7 2 3 .1.6.1 1.2.1 1.8 0 .6.1 1.2.5 1.7.5.65.6 1.35.4 2.15-.2.75-.6 1.4-1 2.05-.1.17-.2.33-.3.5-.15.32-.05.57.15.82.4.5.9.86 1.5 1.1.4.16.8.36 1.15.66.4.35.3.67-.2.8-.2.05-.4.07-.6.1-.36.06-.5.2-.56.56-.04.27-.06.55-.1.82-.07.54-.47.78-.97.6-.28-.1-.55-.24-.82-.37-.4-.2-.8-.2-1.2 0-.2.1-.4.19-.6.27a2.7 2.7 0 0 1-.94.2 4.3 4.3 0 0 1-1.3.27c-.63.07-.64.08-.95.08z" />
    </svg>
  );
}

export type PlatformIcon = (props: IconProps) => JSX.Element;

export const PLATFORM_ICONS: Record<PlatformId, PlatformIcon> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  snapchat: SnapchatIcon,
};

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "facebook",
    name: "Facebook",
    handleLabel: "Page",
    brand: "#1877F2",
    fields: ["title", "caption", "hashtags"],
  },
  {
    id: "instagram",
    name: "Instagram",
    handleLabel: "Username",
    brand: "#E4405F",
    fields: ["title", "caption", "hashtags"],
  },
  {
    id: "youtube",
    name: "YouTube",
    handleLabel: "Channel",
    brand: "#FF0000",
    fields: ["title", "caption", "hashtags"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    handleLabel: "Username",
    brand: "#111827",
    fields: ["title", "caption", "hashtags"],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    handleLabel: "Username",
    brand: "#FFFC00",
    fields: ["title", "caption"],
  },
];

export const DEFAULT_ACCOUNTS: PlatformMap = {
  facebook: { connected: false, handle: "" },
  instagram: { connected: false, handle: "" },
  youtube: { connected: false, handle: "" },
  tiktok: { connected: false, handle: "" },
  snapchat: { connected: false, handle: "" },
};

export function emptyOverride() {
  return { title: "", caption: "", hashtags: "" };
}
