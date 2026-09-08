/*
# Create storage policies for the reels bucket

1. Storage Policies
- Allow anon + authenticated to upload, read, and delete objects in the `reels` bucket.
- This is a single-tenant no-auth app where the bucket is intentionally public.
*/

DROP POLICY IF EXISTS "anon_upload_reels" ON storage.objects;
CREATE POLICY "anon_upload_reels" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'reels');

DROP POLICY IF EXISTS "anon_read_reels" ON storage.objects;
CREATE POLICY "anon_read_reels" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'reels');

DROP POLICY IF EXISTS "anon_delete_reels" ON storage.objects;
CREATE POLICY "anon_delete_reels" ON storage.objects FOR DELETE
  TO anon, authenticated USING (bucket_id = 'reels');
