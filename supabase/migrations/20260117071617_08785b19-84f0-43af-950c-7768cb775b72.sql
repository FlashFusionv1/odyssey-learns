-- Create table to track generated images
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_type TEXT NOT NULL, -- 'dashboard', 'subject', 'badge', 'mascot', 'illustration', 'ui'
  image_category TEXT, -- 'k2', '35', '68', '912', 'parent', 'teacher', etc.
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  storage_path TEXT,
  storage_url TEXT,
  base64_preview TEXT, -- Small preview for quick loading
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Public read access for active images (no auth required for public assets)
CREATE POLICY "Anyone can view active images"
ON public.generated_images
FOR SELECT
USING (is_active = true);

-- Only admins can manage images using existing has_role function
CREATE POLICY "Admins can manage images"
ON public.generated_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for platform images
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-images', 'platform-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for platform images
CREATE POLICY "Platform images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'platform-images');

CREATE POLICY "Admins can upload platform images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'platform-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update platform images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'platform-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete platform images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'platform-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Add index for faster lookups
CREATE INDEX idx_generated_images_type ON public.generated_images(image_type);
CREATE INDEX idx_generated_images_category ON public.generated_images(image_category);