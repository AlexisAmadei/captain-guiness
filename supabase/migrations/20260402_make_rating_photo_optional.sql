-- Make rating photo optional.
ALTER TABLE public.ratings
ALTER COLUMN photo_url DROP NOT NULL;
