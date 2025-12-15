-- Remove overly permissive table policies - only server-side operations allowed via edge functions
DROP POLICY IF EXISTS "Anyone can insert service images" ON public.service_images;
DROP POLICY IF EXISTS "Anyone can delete service images" ON public.service_images;

-- Keep public read access for displaying images in the gallery
-- The existing "Anyone can view service images" policy handles SELECT