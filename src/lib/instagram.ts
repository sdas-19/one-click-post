import { supabase } from "@/lib/supabase";

const FUNCTION_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function startInstagramAuth(): Promise<void> {
  const res = await fetch(`${FUNCTION_BASE}/instagram-auth`, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to start Instagram authentication");
  }
  const data = await res.json();
  if (!data.url) {
    throw new Error("No auth URL returned");
  }
  window.location.href = data.url;
}

export async function checkInstagramConnected(): Promise<boolean> {
  const { data, error } = await supabase
    .from("instagram_tokens")
    .select("id")
    .eq("token_type", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return data !== null;
}

export async function disconnectInstagram(): Promise<void> {
  await supabase.from("instagram_tokens").delete().eq("token_type", "active");
}

export async function publishInstagramReel(
  videoUrl: string,
  caption: string,
): Promise<{ mediaId: string }> {
  const res = await fetch(`${FUNCTION_BASE}/instagram-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ video_url: videoUrl, caption }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error ?? `Upload failed (${res.status})`);
  }
  return { mediaId: data.mediaId };
}
