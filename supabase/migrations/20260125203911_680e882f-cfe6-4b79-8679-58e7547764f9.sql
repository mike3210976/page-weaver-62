-- Fix RLS policies for destinations table - restrict to admin only
DROP POLICY IF EXISTS "Authenticated users can insert destinations" ON public.destinations;
DROP POLICY IF EXISTS "Authenticated users can update destinations" ON public.destinations;

CREATE POLICY "Admins can insert destinations"
ON public.destinations
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update destinations"
ON public.destinations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete destinations"
ON public.destinations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix RLS policies for destination_images table - restrict to admin only
DROP POLICY IF EXISTS "Authenticated users can insert destination images" ON public.destination_images;
DROP POLICY IF EXISTS "Authenticated users can update destination images" ON public.destination_images;
DROP POLICY IF EXISTS "Authenticated users can delete destination images" ON public.destination_images;

CREATE POLICY "Admins can insert destination images"
ON public.destination_images
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update destination images"
ON public.destination_images
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete destination images"
ON public.destination_images
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix RLS policy for service_images table - restrict UPDATE to admin only
DROP POLICY IF EXISTS "Authenticated users can update image order" ON public.service_images;

CREATE POLICY "Admins can update service images"
ON public.service_images
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));