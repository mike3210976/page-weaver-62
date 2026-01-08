-- Tighten newsletter subscribers: only Edge Function (service role) writes
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- Lock down rate limit tables (no direct client access)
ALTER TABLE public.newsletter_rate_limit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny select newsletter_rate_limit" ON public.newsletter_rate_limit;
DROP POLICY IF EXISTS "Deny insert newsletter_rate_limit" ON public.newsletter_rate_limit;
DROP POLICY IF EXISTS "Deny update newsletter_rate_limit" ON public.newsletter_rate_limit;
DROP POLICY IF EXISTS "Deny delete newsletter_rate_limit" ON public.newsletter_rate_limit;

CREATE POLICY "Deny select newsletter_rate_limit"
ON public.newsletter_rate_limit
FOR SELECT
USING (false);

CREATE POLICY "Deny insert newsletter_rate_limit"
ON public.newsletter_rate_limit
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny update newsletter_rate_limit"
ON public.newsletter_rate_limit
FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny delete newsletter_rate_limit"
ON public.newsletter_rate_limit
FOR DELETE
USING (false);

-- inquiry_rate_limit currently has RLS enabled but no policies; lock it down explicitly
ALTER TABLE public.inquiry_rate_limit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny select inquiry_rate_limit" ON public.inquiry_rate_limit;
DROP POLICY IF EXISTS "Deny insert inquiry_rate_limit" ON public.inquiry_rate_limit;
DROP POLICY IF EXISTS "Deny update inquiry_rate_limit" ON public.inquiry_rate_limit;
DROP POLICY IF EXISTS "Deny delete inquiry_rate_limit" ON public.inquiry_rate_limit;

CREATE POLICY "Deny select inquiry_rate_limit"
ON public.inquiry_rate_limit
FOR SELECT
USING (false);

CREATE POLICY "Deny insert inquiry_rate_limit"
ON public.inquiry_rate_limit
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny update inquiry_rate_limit"
ON public.inquiry_rate_limit
FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny delete inquiry_rate_limit"
ON public.inquiry_rate_limit
FOR DELETE
USING (false);

-- Fix overly-permissive service_images UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update image order" ON public.service_images;
CREATE POLICY "Authenticated users can update image order"
ON public.service_images
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Enforce destination image uploads/deletes via backend function only (storage)
DROP POLICY IF EXISTS "Authenticated users can upload destination images storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update destination images storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete destination images storage" ON storage.objects;