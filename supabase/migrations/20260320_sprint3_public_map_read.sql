-- Allow public read access for community map browsing (authenticated + anonymous)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ratings'
      AND policyname = 'Public can view ratings'
  ) THEN
    CREATE POLICY "Public can view ratings"
      ON public.ratings
      FOR SELECT
      TO public
      USING (true);
  END IF;
END
$$;
