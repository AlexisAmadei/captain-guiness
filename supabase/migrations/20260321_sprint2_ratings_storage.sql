-- Create ratings table for Sprint 2
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating numeric(2,1) NOT NULL CHECK (rating >= 0.5 AND rating <= 5),
  notes text,
  photo_url text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  place_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS ratings_user_id_idx ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS ratings_place_id_idx ON public.ratings(place_id);
CREATE INDEX IF NOT EXISTS ratings_created_at_idx ON public.ratings(created_at);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
-- Users can view all ratings (for exploring places)
CREATE POLICY "Users can view all ratings"
ON public.ratings FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own ratings
CREATE POLICY "Users can insert their own ratings"
ON public.ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
ON public.ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
ON public.ratings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create storage bucket for rating photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('ratings', 'ratings', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage
CREATE POLICY "Users can upload rating photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ratings' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Public can view rating photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ratings');

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ratings' AND auth.uid() = (storage.foldername(name))[1]::uuid);
