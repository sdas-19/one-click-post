import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 24; // 2 minutes max

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Fetch the latest stored Instagram token
    const { data: tokenRow, error: tokenErr } = await supabase
      .from("instagram_tokens")
      .select("*")
      .eq("token_type", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      return new Response(
        JSON.stringify({ error: "Instagram account not connected. Please connect your Instagram account first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const accessToken = tokenRow.access_token;
    const igUserId = tokenRow.ig_user_id;

    if (!igUserId) {
      return new Response(
        JSON.stringify({ error: "No Instagram business account ID found. Please reconnect." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Parse request body
    const body = await req.json();
    const videoUrl = body.video_url as string;
    const caption = (body.caption as string) ?? "";

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: "No video URL provided. Instagram requires a publicly accessible video URL." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step A: Create a Reels media container
    const createRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "REELS",
          video_url: videoUrl,
          caption,
          access_token: accessToken,
        }),
      },
    );

    if (!createRes.ok) {
      const errBody = await createRes.text();
      return new Response(
        JSON.stringify({ error: `Container creation failed: ${errBody}` }),
        { status: createRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const createData = await createRes.json();
    const containerId = createData.id;

    if (!containerId) {
      return new Response(
        JSON.stringify({ error: "No container ID returned from Instagram." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step B: Poll the container status until FINISHED
    let status = "IN_PROGRESS";
    let attempts = 0;

    while (status !== "FINISHED" && attempts < MAX_POLL_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const statusRes = await fetch(
        `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`,
      );

      if (!statusRes.ok) {
        const errBody = await statusRes.text();
        return new Response(
          JSON.stringify({ error: `Status polling failed: ${errBody}` }),
          { status: statusRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const statusData = await statusRes.json();
      status = statusData.status_code ?? "IN_PROGRESS";
      attempts++;

      if (status === "ERROR") {
        return new Response(
          JSON.stringify({ error: "Instagram container processing returned ERROR status." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (status !== "FINISHED") {
      return new Response(
        JSON.stringify({ error: "Timed out waiting for Instagram container to finish processing." }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step C: Publish the Reel
    const publishRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      },
    );

    if (!publishRes.ok) {
      const errBody = await publishRes.text();
      return new Response(
        JSON.stringify({ error: `Publish failed: ${errBody}` }),
        { status: publishRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const publishData = await publishRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        mediaId: publishData.id,
        containerId,
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
