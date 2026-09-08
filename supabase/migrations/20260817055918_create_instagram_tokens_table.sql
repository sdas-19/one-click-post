/*
# Create instagram_tokens table (single-tenant, no auth)

1. New Tables
- `instagram_tokens`
  - `id` (uuid, primary key)
  - `access_token` (text, long-lived Meta access token for Instagram Graph API)
  - `ig_user_id` (text, the Instagram business account ID used for publishing)
  - `page_id` (text, the Facebook Page ID linked to the Instagram account)
  - `token_type` (text, e.g. "active" or "pending" for OAuth state tracking)
  - `expires_at` (timestamptz, when the token expires — nullable)
  - `created_at` (timestamptz, when the record was created)
  - `updated_at` (timestamptz, when the record was last updated)

2. Security
- Enable RLS on `instagram_tokens`.
- Allow anon + authenticated full CRUD because this is a single-tenant no-auth demo app with intentionally shared data.
*/

CREATE TABLE IF NOT EXISTS instagram_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  ig_user_id text NOT NULL DEFAULT '',
  page_id text NOT NULL DEFAULT '',
  token_type text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE instagram_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_instagram_tokens" ON instagram_tokens;
CREATE POLICY "anon_select_instagram_tokens" ON instagram_tokens FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_instagram_tokens" ON instagram_tokens;
CREATE POLICY "anon_insert_instagram_tokens" ON instagram_tokens FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_instagram_tokens" ON instagram_tokens;
CREATE POLICY "anon_update_instagram_tokens" ON instagram_tokens FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_instagram_tokens" ON instagram_tokens;
CREATE POLICY "anon_delete_instagram_tokens" ON instagram_tokens FOR DELETE
  TO anon, authenticated USING (true);
