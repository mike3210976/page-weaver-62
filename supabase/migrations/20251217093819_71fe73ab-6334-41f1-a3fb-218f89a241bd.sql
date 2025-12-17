-- Add display_order column to track image ordering
ALTER TABLE public.service_images 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update existing images with sequential order based on creation time
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY created_at) as rn
  FROM public.service_images
)
UPDATE public.service_images 
SET display_order = ordered.rn
FROM ordered
WHERE public.service_images.id = ordered.id;

-- Create RLS policy for authenticated users to update order
CREATE POLICY "Authenticated users can update image order"
ON public.service_images
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);