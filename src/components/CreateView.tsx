import { useEffect, useRef, useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle, Hash, CalendarClock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { uploadToYouTube } from "@/lib/youtube";
import { publishInstagramReel } from "@/lib/instagram";
import { PLATFORMS, PLATFORM_ICONS, emptyOverride } from "@/lib/platforms";
import { MediaUploader, type MediaItem } from "@/components/MediaUploader";
import { PlatformToggle } from "@/components/PlatformToggle";
import { OverrideCard } from "@/components/OverrideCard";
import type {
  OverrideMap,
  PlatformId,
  PlatformMap,
  PostStatus,
} from "@/types";

interface CreateViewProps {
  accounts: PlatformMap;
  selected: Set<PlatformId>;
  onToggle: (id: PlatformId) => void;
  onPublished: () => void;
}

interface PostState {
  status: PostStatus;
  message: string;
}

const STEP_DELAY = 700;

export function CreateView({ accounts, selected, onToggle, onPublished }: CreateViewProps) {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [caption, setCaption] = useState("");
  const [overrides, setOverrides] = useState<OverrideMap>(() => ({
    facebook: emptyOverride(),
    instagram: emptyOverride(),
    youtube: emptyOverride(),
    tiktok: emptyOverride(),
    snapchat: emptyOverride(),
  }));
  const [postStates, setPostStates] = useState<Record<PlatformId, PostState>>(
    () => emptyPostStates(),
  );
  const [publishing, setPublishing] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const selectedList = PLATFORMS.filter((p) => selected.has(p.id));
  const hasMedia = media !== null;
  const canPublish = selectedList.length > 0 && hasMedia && !publishing;
  const isScheduled = scheduleEnabled && scheduleAt.length > 0;

  function setOverride(id: PlatformId, next: (typeof overrides)[PlatformId]) {
    setOverrides((prev) => ({ ...prev, [id]: next }));
  }

  async function savePost(status: "published" | "scheduled") {
    const platforms = selectedList.map((p) => p.id);
    await supabase.from("posts").insert({
      media_name: media?.name ?? "",
      media_type: media?.type ?? "image",
      caption,
      platforms,
      status,
      views: status === "published" ? Math.floor(Math.random() * 5000) + 100 : 0,
      scheduled_for: isScheduled ? new Date(scheduleAt).toISOString() : null,
    });
    onPublished();
  }

  async function publish() {
    if (!canPublish) return;

    if (isScheduled) {
      savePost("scheduled");
      setPostStates(() => ({
        ...emptyPostStates(),
        facebook: { status: "success", message: `Scheduled for ${formatSchedule(scheduleAt)}` },
      }));
      window.setTimeout(() => setPostStates(emptyPostStates()), 3000);
      return;
    }

    setPublishing(true);
    setPostStates(emptyPostStates());

    const ytPlatform = selectedList.find((p) => p.id === "youtube");
    const igPlatform = selectedList.find((p) => p.id === "instagram");
    const otherPlatforms = selectedList.filter(
      (p) => p.id !== "youtube" && p.id !== "instagram",
    );

    // Simulated platforms (non-YouTube)
    otherPlatforms.forEach((p, idx) => {
      const base = idx * (STEP_DELAY * 1.6);
      timers.current.push(
        window.setTimeout(() => {
          setPostStates((s) => ({
            ...s,
            [p.id]: { status: "uploading", message: "Uploading media…" },
          }));
        }, base),
      );
      timers.current.push(
        window.setTimeout(() => {
          setPostStates((s) => ({
            ...s,
            [p.id]: { status: "posting", message: `Posting to ${p.name}…` },
          }));
        }, base + STEP_DELAY),
      );
      const fail = Math.random() < 0.08 && idx > 0;
      timers.current.push(
        window.setTimeout(() => {
          setPostStates((s) => ({
            ...s,
            [p.id]: fail
              ? { status: "error", message: "Failed — token expired" }
              : { status: "success", message: `Posted to ${p.name}` },
          }));
        }, base + STEP_DELAY * 2),
      );
    });

    // Real YouTube upload
    if (ytPlatform && media?.file) {
      setPostStates((s) => ({
        ...s,
        youtube: { status: "uploading", message: "Uploading video to YouTube…" },
      }));

      try {
        const ytOverride = overrides.youtube;
        const title = ytOverride.title || media.name || "Untitled Video";
        const description = ytOverride.caption || caption;

        const result = await uploadToYouTube(media.file, title, description);
        setPostStates((s) => ({
          ...s,
          youtube: {
            status: "success",
            message: `Uploaded to YouTube (video ID: ${result.videoId})`,
          },
        }));
      } catch (err) {
        setPostStates((s) => ({
          ...s,
          youtube: {
            status: "error",
            message: `YouTube upload failed: ${(err as Error).message}`,
          },
        }));
      }
    }

    // Real Instagram Reels upload
    if (igPlatform && media?.file) {
      setPostStates((s) => ({
        ...s,
        instagram: { status: "uploading", message: "Uploading video to storage…" },
      }));

      try {
        // Upload video to Supabase Storage for a public URL
        const fileName = `reels/${Date.now()}-${media.name.replace(/\s/g, "-")}`;
        const { error: uploadErr } = await supabase.storage
          .from("reels")
          .upload(fileName, media.file);

        if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

        const { data: publicUrlData } = supabase.storage
          .from("reels")
          .getPublicUrl(fileName);

        const videoUrl = publicUrlData.publicUrl;

        setPostStates((s) => ({
          ...s,
          instagram: { status: "posting", message: "Creating Instagram Reels container…" },
        }));

        const igOverride = overrides.instagram;
        const reelCaption = igOverride.caption || caption;

        const result = await publishInstagramReel(videoUrl, reelCaption);
        setPostStates((s) => ({
          ...s,
          instagram: {
            status: "success",
            message: `Reel published to Instagram (media ID: ${result.mediaId})`,
          },
        }));
      } catch (err) {
        setPostStates((s) => ({
          ...s,
          instagram: {
            status: "error",
            message: `Instagram upload failed: ${(err as Error).message}`,
          },
        }));
      }
    }

    const total = Math.max(otherPlatforms.length * (STEP_DELAY * 2.2) + STEP_DELAY, 2000);
    timers.current.push(
      window.setTimeout(() => {
        setPublishing(false);
        savePost("published");
      }, total),
    );
  }

  const publishLabel = publishing
    ? "Publishing…"
    : isScheduled
      ? `Schedule for ${selectedList.length} Selected`
      : `Publish to ${selectedList.length || "All"} Selected`;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Create a Post
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload one media file, write a caption, and publish everywhere at once.
        </p>
      </header>

      {/* Media */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <SectionTitle>Media</SectionTitle>
        <MediaUploader media={media} onMedia={setMedia} />
      </section>

      {/* Caption */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <SectionTitle>Global caption &amp; bio</SectionTitle>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          placeholder="Write a caption that works across all your platforms…"
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-500"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            Shared by default — override per platform below
          </span>
          <span>{caption.length} chars</span>
        </div>
      </section>

      {/* Platform selection */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <SectionTitle>Post to</SectionTitle>
        <div className="flex flex-wrap gap-2.5">
          {PLATFORMS.map((p) => {
            const connected = accounts[p.id].connected;
            return (
              <PlatformToggle
                key={p.id}
                platform={p}
                selected={selected.has(p.id)}
                disabled={!connected}
                onToggle={() => onToggle(p.id)}
              />
            );
          })}
        </div>
        {selectedList.length === 0 && (
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            Connect and select at least one platform to publish.
          </p>
        )}
      </section>

      {/* Overrides */}
      {selectedList.length > 0 && (
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <SectionTitle>Per-platform overrides</SectionTitle>
          <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
            Leave a field blank to use the global caption.
          </p>
          <div className="space-y-2.5">
            {selectedList.map((p) => (
              <OverrideCard
                key={p.id}
                platform={p}
                override={overrides[p.id]}
                globalCaption={caption}
                onChange={(next) => setOverride(p.id, next)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Schedule */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <SectionTitle>Schedule</SectionTitle>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={scheduleEnabled}
            onChange={(e) => setScheduleEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800"
          />
          <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <CalendarClock className="h-4 w-4" />
            Schedule for a future date &amp; time
          </span>
        </label>
        {scheduleEnabled && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-500 [color-scheme:light] dark:[color-scheme:dark]"
            />
            {scheduleAt && (
              <button
                onClick={() => setScheduleAt("")}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Clear date"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Publish + status */}
      <section className="sticky bottom-4 mt-4 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <button
          onClick={publish}
          disabled={!canPublish}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
            canPublish
              ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
          )}
        >
          {publishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isScheduled ? (
            <CalendarClock className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {publishLabel}
        </button>

        {!hasMedia && (
          <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
            Add media to enable publishing.
          </p>
        )}

        {(publishing ||
          Object.values(postStates).some((s) => s.status !== "idle")) && (
          <div className="mt-3 space-y-1.5">
            {selectedList.map((p) => {
              const st = postStates[p.id];
              if (st.status === "idle") return null;
              const Icon = PLATFORM_ICONS[p.id];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="flex-1 text-xs text-gray-600 dark:text-gray-300">
                    {st.message}
                  </span>
                  <StatusIcon status={st.status} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function formatSchedule(value: string) {
  const d = new Date(value);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
      {children}
    </h2>
  );
}

function StatusIcon({ status }: { status: PostStatus }) {
  if (status === "success")
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "error")
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  return <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />;
}

function emptyPostStates(): Record<PlatformId, PostState> {
  return {
    facebook: { status: "idle", message: "" },
    instagram: { status: "idle", message: "" },
    youtube: { status: "idle", message: "" },
    tiktok: { status: "idle", message: "" },
    snapchat: { status: "idle", message: "" },
  };
}
