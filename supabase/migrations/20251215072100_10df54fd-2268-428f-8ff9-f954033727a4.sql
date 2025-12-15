-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true);

-- Create table to track service images
CREATE TABLE public.service_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public access for this use case)
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view images
CREATE POLICY "Anyone can view service images"
ON public.service_images
FOR SELECT
USING (true);

-- Allow anyone to insert images (no auth required for this demo)
CREATE POLICY "Anyone can insert service images"
ON public.service_images
FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete images
CREATE POLICY "Anyone can delete service images"
ON public.service_images
FOR DELETE
USING (true);

-- Storage policies for the bucket
CREATE POLICY "Anyone can view service images in storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'service-images');

CREATE POLICY "Anyone can upload service images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'service-images');

CREATE POLICY "Anyone can delete service images from storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'service-images');