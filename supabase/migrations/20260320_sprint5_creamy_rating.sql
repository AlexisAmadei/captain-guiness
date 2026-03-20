ALTER TABLE public.ratings
ADD COLUMN IF NOT EXISTS creamy_rating numeric(2,1);

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_creamy_rating_check
CHECK (creamy_rating IS NULL OR (creamy_rating >= 1 AND creamy_rating <= 5 AND mod((creamy_rating * 10)::integer, 5) = 0));
