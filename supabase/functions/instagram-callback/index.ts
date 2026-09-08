import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const APP_ID = Deno.env.get("INSTAGRAM_APP_ID") ?? "";
const APP_SECRET = Deno.env.get("INSTAGRAM_APP_SECRET") ?? "";
const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL") ?? ""}/functions/v1/instagram-callback`;
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
      return Response.redirect(`${APP_URL}?ig_error=${encodeURIComponent(errorParam)}`);
    }

    if (!code || !state) {
      return Response.redirect(`${APP_URL}?ig_error=missing_params`);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Verify the pending state record exists
    const { data: pendingRow } = await supabase
      .from("instagram_tokens")
      .select("id")
      .eq("access_token", state)
      .eq("token_type", "pending")
      .maybeSingle();

    if (!pendingRow) {
      return Response.redirect(`${APP_URL}?ig_error=invalid_state`);
    }

    // Step 1: Exchange short-lived code for a long-lived user access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
        new URLSearchParams({
          client_id: APP_ID,
          client_secret: APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        }),
    );

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      return Response.redirect(`${APP_URL}?ig_error=${encodeURIComponent(`token_exchange_failed: ${errBody}`)}`);
    }

    const tokenData = await tokenRes.json();
    const userAccessToken = tokenData.access_token;

    // Step 2: Fetch the user's Facebook Pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${userAccessToken}`,
    );

    if (!pagesRes.ok) {
      const errBody = await pagesRes.text();
      return Response.redirect(`${APP_URL}?ig_error=${encodeURIComponent(`pages_fetch_failed: ${errBody}`)}`);
    }

    const pagesData = await pagesRes.json();
    const pages = pagesData.data ?? [];

    if (pages.length === 0) {
      return Response.redirect(`${APP_URL}?ig_error=no_facebook_page_found`);
    }

    // Use the first page (single-tenant app)
    const page = pages[0];
    const pageId = page.id;
    const pageAccessToken = page.access_token;

    // Step 3: Fetch the Instagram business account linked to the page
    const igRes = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`,
    );

    if (!igRes.ok) {
      const errBody = await igRes.text();
      return Response.redirect(`${APP_URL}?ig_error=${encodeURIComponent(`ig_account_fetch_failed: ${errBody}`)}`);
    }

    const igData = await igRes.json();
    const igUserId = igData.instagram_business_account?.id;

    if (!igUserId) {
      return Response.redirect(`${APP_URL}?ig_error=no_instagram_business_account`);
    }

    // Step 4: Store the token and IG account info
    await supabase.from("instagram_tokens").delete().eq("id", pendingRow.id);
    await supabase.from("instagram_tokens").insert({
      access_token: pageAccessToken,
      ig_user_id: igUserId,
      page_id: pageId,
      token_type: "active",
    });

    return Response.redirect(`${APP_URL}?ig_connected=true`);
  } catch (err) {
    return Response.redirect(`${APP_URL}?ig_error=${encodeURIComponent((err as Error).message)}`);
  }
});
