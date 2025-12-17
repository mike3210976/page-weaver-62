-- Create table for rate limiting inquiries
CREATE TABLE public.inquiry_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inquiry_rate_limit ENABLE ROW LEVEL SECURITY;

-- Create index for efficient lookups
CREATE INDEX idx_inquiry_rate_limit_ip_created ON public.inquiry_rate_limit(ip_address, created_at);

-- Auto-cleanup old records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.inquiry_rate_limit 
  WHERE created_at < now() - INTERVAL '1 hour';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_cleanup_rate_limits
AFTER INSERT ON public.inquiry_rate_limit
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_rate_limits();