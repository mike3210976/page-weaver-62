-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create destinations table for detailed destination info
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT,
  tagline TEXT,
  full_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Everyone can view destinations
CREATE POLICY "Anyone can view destinations"
ON public.destinations
FOR SELECT
USING (true);

-- Only authenticated users can update destinations
CREATE POLICY "Authenticated users can update destinations"
ON public.destinations
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Only authenticated users can insert destinations
CREATE POLICY "Authenticated users can insert destinations"
ON public.destinations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create destination_images table
CREATE TABLE public.destination_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.destination_images ENABLE ROW LEVEL SECURITY;

-- Everyone can view destination images
CREATE POLICY "Anyone can view destination images"
ON public.destination_images
FOR SELECT
USING (true);

-- Only authenticated users can manage destination images
CREATE POLICY "Authenticated users can insert destination images"
ON public.destination_images
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update destination images"
ON public.destination_images
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete destination images"
ON public.destination_images
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create storage bucket for destination images
INSERT INTO storage.buckets (id, name, public)
VALUES ('destination-images', 'destination-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for destination images
CREATE POLICY "Anyone can view destination images storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'destination-images');

CREATE POLICY "Authenticated users can upload destination images storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'destination-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete destination images storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'destination-images' AND auth.uid() IS NOT NULL);

-- Insert initial destinations
INSERT INTO public.destinations (slug, name, short_description, tagline) VALUES
('maldives', 'Maldives', 'Crystal waters & overwater villas', 'Perfect for luxury seekers and honeymooners.'),
('dominican-republic', 'Dominican Republic', 'Caribbean charm & vibrant culture', 'Ideal for beach lovers and adventure enthusiasts.'),
('mexico', 'Mexico', 'Sun-kissed beaches & rich heritage', 'Great for family vacations and cultural experiences.'),
('egypt-marsa-alam', 'Egypt – Marsa Alam', 'Red Sea paradise & vibrant marine life', 'A hidden gem for divers, snorkelers, and desert explorers.'),
('spain', 'Spain', 'Mediterranean vibes & historic cities', 'Perfect for foodies and art lovers.'),
('italy', 'Italy', 'Romantic escapes & timeless elegance', 'Ideal for history buffs and culinary explorers.'),
('slovenia', 'Slovenia', 'Alpine beauty & serene lakes', 'A hidden gem for nature lovers and hikers.'),
('bosnia', 'Bosnia', 'Cultural crossroads & scenic landscapes', 'Perfect for history enthusiasts and off-the-beaten-path travelers.');

-- Create trigger for updated_at
CREATE TRIGGER update_destinations_updated_at
BEFORE UPDATE ON public.destinations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();