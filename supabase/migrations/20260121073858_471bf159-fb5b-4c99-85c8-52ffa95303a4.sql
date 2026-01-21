-- Add RLS policies to restrict write operations on newsletter_subscribers
-- Only service role (edge functions) should be able to insert/update/delete

-- Deny all INSERT operations from regular users
CREATE POLICY "Deny insert newsletter_subscribers"
ON public.newsletter_subscribers
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- Deny all UPDATE operations from regular users  
CREATE POLICY "Deny update newsletter_subscribers"
ON public.newsletter_subscribers
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Deny all DELETE operations from regular users
CREATE POLICY "Deny delete newsletter_subscribers"
ON public.newsletter_subscribers
FOR DELETE
TO authenticated, anon
USING (false);