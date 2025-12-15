-- Remove overly permissive storage policies for service-images bucket
DROP POLICY IF EXISTS "Anyone can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete service images from storage" ON storage.objects;

-- Keep public read access for viewing images (needed for displaying in the gallery)
-- The existing "Anyone can view service images" policy on storage.objects handles this

-- Note: Upload and delete operations now go through edge functions 
-- which use the service role key, bypassing RLS entirely.
-- This means only the server can upload/delete, not anonymous clients.