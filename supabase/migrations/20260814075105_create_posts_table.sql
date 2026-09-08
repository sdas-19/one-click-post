/*
# Create posts table for post history (single-tenant, no auth)

1. New Tables
- `posts`
  - `id` (uuid, primary key)
  - `media_name` (text, name of the uploaded media file)
  - `media_type` (text, either 'image' or 'video')
  - `caption` (text, the global caption used)
  - `platforms` (jsonb, array of platform ids that were posted to, e.g. ["facebook","instagram"])
  - `status` (text, overall publish status: 'published' or 'scheduled' or 'failed')
  - `views` (integer, mock view count, defaults to 0)
  - `scheduled_for` (timestamptz, nullable — when the post is scheduled to go live)
  - `created_at` (timestamptz, when the post record was created)

2. Security
- Enable RLS on `posts`.
- Allow anon + authenticated full CRUD because this is a single-tenant no-auth demo app with intentionally shared/public data.
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_name text NOT NULL DEFAULT '',
  media_type text NOT NULL DEFAULT 'image',
  caption text NOT NULL DEFAULT '',
  platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'published',
  views integer NOT NULL DEFAULT 0,
  scheduled_for timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_posts" ON posts;
CREATE POLICY "anon_select_posts" ON posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_posts" ON posts;
CREATE POLICY "anon_insert_posts" ON posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_posts" ON posts;
CREATE POLICY "anon_update_posts" ON posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_posts" ON posts;
CREATE POLICY "anon_delete_posts" ON posts FOR DELETE
  TO anon, authenticated USING (true);
