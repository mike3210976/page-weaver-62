
-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);

-- Storage policies for videos bucket
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Admins can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create table for section videos
CREATE TABLE public.section_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL,
  video_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.section_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view section videos"
ON public.section_videos FOR SELECT
USING (true);

CREATE POLICY "Admins can insert section videos"
ON public.section_videos FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update section videos"
ON public.section_videos FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete section videos"
ON public.section_videos FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));
