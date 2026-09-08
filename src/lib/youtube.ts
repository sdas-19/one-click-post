import { supabase } from "@/lib/supabase";

const FUNCTION_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function startYouTubeAuth(): Promise<void> {
  const res = await fetch(`${FUNCTION_BASE}/youtube-auth`, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to start YouTube authentication");
  }
  const data = await res.json();
  if (!data.url) {
    throw new Error("No auth URL returned");
  }
  window.location.href = data.url;
}

export async function checkYouTubeConnected(): Promise<boolean> {
  const { data, error } = await supabase
    .from("youtube_tokens")
    .select("id")
    .neq("token_type", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return data !== null;
}

export async function disconnectYouTube(): Promise<void> {
  await supabase.from("youtube_tokens").delete().neq("token_type", "pending");
}

export async function uploadToYouTube(
  file: File,
  title: string,
  description: string,
): Promise<{ videoId: string }> {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("title", title);
  formData.append("description", description);

  const res = await fetch(`${FUNCTION_BASE}/youtube-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error ?? `Upload failed (${res.status})`);
  }
  return { videoId: data.videoId };
}
