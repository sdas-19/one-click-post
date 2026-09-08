/*
# Create youtube_tokens table (single-tenant, no auth)

1. New Tables
- `youtube_tokens`
  - `id` (uuid, primary key)
  - `access_token` (text, OAuth access token for YouTube Data API)
  - `refresh_token` (text, OAuth refresh token for long-term access)
  - `token_type` (text, e.g. "Bearer")
  - `expires_at` (timestamptz, when the access token expires)
  - `scope` (text, granted OAuth scopes)
  - `created_at` (timestamptz, when the record was created)
  - `updated_at` (timestamptz, when the record was last updated)

2. Security
- Enable RLS on `youtube_tokens`.
- Allow anon + authenticated full CRUD because this is a single-tenant no-auth demo app with intentionally shared data.
*/

CREATE TABLE IF NOT EXISTS youtube_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  refresh_token text,
  token_type text NOT NULL DEFAULT 'Bearer',
  expires_at timestamptz,
  scope text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE youtube_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_youtube_tokens" ON youtube_tokens;
CREATE POLICY "anon_select_youtube_tokens" ON youtube_tokens FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_youtube_tokens" ON youtube_tokens;
CREATE POLICY "anon_insert_youtube_tokens" ON youtube_tokens FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_youtube_tokens" ON youtube_tokens;
CREATE POLICY "anon_update_youtube_tokens" ON youtube_tokens FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_youtube_tokens" ON youtube_tokens;
CREATE POLICY "anon_delete_youtube_tokens" ON youtube_tokens FOR DELETE
  TO anon, authenticated USING (true);
