import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CLIENT_ID = Deno.env.get("YOUTUBE_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("YOUTUBE_CLIENT_SECRET") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Fetch the latest stored token
    const { data: tokenRow, error: tokenErr } = await supabase
      .from("youtube_tokens")
      .select("*")
      .neq("token_type", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      return new Response(
        JSON.stringify({ error: "YouTube account not connected. Please connect your YouTube account first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let accessToken = tokenRow.access_token;

    // Refresh token if expired (or within 60s of expiry)
    const expiresAt = tokenRow.expires_at ? new Date(tokenRow.expires_at).getTime() : 0;
    if (expiresAt > 0 && Date.now() > expiresAt - 60000 && tokenRow.refresh_token) {
      const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: tokenRow.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (!refreshRes.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to refresh YouTube access token. Please reconnect your account." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const refreshed = await refreshRes.json();
      accessToken = refreshed.access_token;
      await supabase
        .from("youtube_tokens")
        .update({
          access_token: refreshed.access_token,
          expires_at: refreshed.expires_in
            ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tokenRow.id);
    }

    // Parse the multipart form data from the request
    const formData = await req.formData();
    const title = (formData.get("title") as string) || "Untitled Video";
    const description = (formData.get("description") as string) || "";
    const videoFile = formData.get("video") as File;

    if (!videoFile) {
      return new Response(
        JSON.stringify({ error: "No video file provided." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build the YouTube Data API v3 metadata
    const metadata = {
      snippet: {
        title: title.slice(0, 100),
        description,
        categoryId: "22", // People & Blogs
      },
      status: {
        privacyStatus: "public",
      },
    };

    // Upload via videos.insert (resumable upload — initial request)
    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": videoFile.type || "video/*",
          "X-Upload-Content-Length": String(videoFile.size),
        },
        body: JSON.stringify(metadata),
      },
    );

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text();
      return new Response(
        JSON.stringify({ error: `YouTube upload initiation failed: ${errBody}` }),
        { status: uploadRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const uploadUrl = uploadRes.headers.get("Location");
    if (!uploadUrl) {
      return new Response(
        JSON.stringify({ error: "YouTube did not return an upload URL." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Upload the actual video file to the resumable upload URL
    const videoRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": videoFile.type || "video/*",
        "Content-Length": String(videoFile.size),
      },
      body: videoFile,
    });

    if (!videoRes.ok) {
      const errBody = await videoRes.text();
      return new Response(
        JSON.stringify({ error: `YouTube video upload failed: ${errBody}` }),
        { status: videoRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const videoData = await videoRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        videoId: videoData.id,
        title: videoData.snippet?.title,
        description: videoData.snippet?.description,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
