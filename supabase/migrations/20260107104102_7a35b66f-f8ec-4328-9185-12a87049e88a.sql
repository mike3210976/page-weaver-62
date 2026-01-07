-- Add UPDATE policy for destination images in storage
CREATE POLICY "Authenticated users can update destination images storage"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'destination-images' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'destination-images' AND auth.uid() IS NOT NULL);