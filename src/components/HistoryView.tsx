import { useEffect, useState } from "react";
import { Eye, Calendar, Film, Image as ImageIcon, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { PLATFORMS, PLATFORM_ICONS } from "@/lib/platforms";
import type { PostRecord } from "@/types";

export function HistoryView() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data as PostRecord[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Post History
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track published and scheduled posts across all platforms.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Refresh"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </header>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="Total Posts" value={posts.length} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Scheduled" value={scheduledCount} />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
          <p className="text-sm text-gray-400 dark:text-gray-500">No posts yet.</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
            Published and scheduled posts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{value.toLocaleString()}</p>
    </div>
  );
}

function PostRow({ post }: { post: PostRecord }) {
  const platforms = (post.platforms || []) as string[];
  const isScheduled = post.status === "scheduled";
  const scheduledDate = post.scheduled_for ? new Date(post.scheduled_for) : null;
  const created = new Date(post.created_at);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-4">
        {/* Media icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {post.media_type === "video" ? <Film className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {post.media_name || "Untitled media"}
            </p>
            <HistoryBadge status={post.status} />
          </div>
          {post.caption && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
              {post.caption}
            </p>
          )}

          {/* Platforms */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {platforms.map((pid) => {
              const config = PLATFORMS.find((p) => p.id === pid);
              if (!config) return null;
              const Icon = PLATFORM_ICONS[config.id];
              return (
                <div
                  key={pid}
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${config.brand}14`, color: config.brand }}
                  title={config.name}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              );
            })}
          </div>

          {/* Meta */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {isScheduled && scheduledDate
                ? `Scheduled for ${scheduledDate.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`
                : created.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </span>
            {!isScheduled && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {(post.views || 0).toLocaleString()} views
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800",
    scheduled: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-800",
    failed: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-800",
  };
  const cls = styles[status] || styles.published;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", cls)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
