CREATE OR REPLACE FUNCTION public.get_user_rating_stats(p_user_id uuid)
RETURNS TABLE (
  total_ratings bigint,
  average_rating numeric(3,2),
  ratings_last_30_days bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*)::bigint AS total_ratings,
    ROUND(AVG(rating)::numeric, 2) AS average_rating,
    COUNT(*) FILTER (WHERE rated_at >= timezone('utc'::text, now()) - interval '30 days')::bigint AS ratings_last_30_days
  FROM public.ratings
  WHERE user_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_rating_stats(uuid) TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload avatars'
  ) THEN
    CREATE POLICY "Users can upload avatars"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid() = (storage.foldername(name))[1]::uuid
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can view avatars'
  ) THEN
    CREATE POLICY "Public can view avatars"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'avatars');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete own avatars'
  ) THEN
    CREATE POLICY "Users can delete own avatars"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'avatars'
        AND auth.uid() = (storage.foldername(name))[1]::uuid
      );
  END IF;
END
$$;