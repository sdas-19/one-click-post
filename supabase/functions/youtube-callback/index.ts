import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CLIENT_ID = Deno.env.get("YOUTUBE_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("YOUTUBE_CLIENT_SECRET") ?? "";
const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL") ?? ""}/functions/v1/youtube-callback`;
const APP_URL = Deno.env.get("APP_URL") ?? "http://localhost:5173";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error");

    if (errorParam) {
      return Response.redirect(`${APP_URL}?yt_error=${encodeURIComponent(errorParam)}`);
    }

    if (!code || !state) {
      return Response.redirect(`${APP_URL}?yt_error=missing_params`);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Verify the pending state record exists
    const { data: pendingRow } = await supabase
      .from("youtube_tokens")
      .select("id")
      .eq("access_token", state)
      .eq("token_type", "pending")
      .maybeSingle();

    if (!pendingRow) {
      return Response.redirect(`${APP_URL}?yt_error=invalid_state`);
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      return Response.redirect(`${APP_URL}?yt_error=${encodeURIComponent(`token_exchange_failed: ${errBody}`)}`);
    }

    const tokens = await tokenRes.json();

    // Delete the pending row and insert the real token
    await supabase.from("youtube_tokens").delete().eq("id", pendingRow.id);
    await supabase.from("youtube_tokens").insert({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type ?? "Bearer",
      expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      scope: tokens.scope ?? "",
    });

    return Response.redirect(`${APP_URL}?yt_connected=true`);
  } catch (err) {
    return Response.redirect(`${APP_URL}?yt_error=${encodeURIComponent((err as Error).message)}`);
  }
});
