ALTER TABLE public.ratings
ADD COLUMN IF NOT EXISTS bar_name text;

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_bar_name_length_check
CHECK (bar_name IS NULL OR char_length(bar_name) <= 120);
