ALTER TABLE public.ratings
ADD COLUMN IF NOT EXISTS taste_rating numeric(2,1),
ADD COLUMN IF NOT EXISTS foam_rating numeric(2,1),
ADD COLUMN IF NOT EXISTS temperature_rating numeric(2,1),
ADD COLUMN IF NOT EXISTS presentation_rating numeric(2,1),
ADD COLUMN IF NOT EXISTS value_for_money_rating numeric(2,1),
ADD COLUMN IF NOT EXISTS pint_price numeric(6,2),
ADD COLUMN IF NOT EXISTS rated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_taste_rating_check
CHECK (taste_rating IS NULL OR (taste_rating >= 1 AND taste_rating <= 5 AND mod((taste_rating * 10)::integer, 5) = 0));

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_foam_rating_check
CHECK (foam_rating IS NULL OR (foam_rating >= 1 AND foam_rating <= 5 AND mod((foam_rating * 10)::integer, 5) = 0));

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_temperature_rating_check
CHECK (temperature_rating IS NULL OR (temperature_rating >= 1 AND temperature_rating <= 5 AND mod((temperature_rating * 10)::integer, 5) = 0));

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_presentation_rating_check
CHECK (presentation_rating IS NULL OR (presentation_rating >= 1 AND presentation_rating <= 5 AND mod((presentation_rating * 10)::integer, 5) = 0));

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_value_for_money_rating_check
CHECK (value_for_money_rating IS NULL OR (value_for_money_rating >= 1 AND value_for_money_rating <= 5 AND mod((value_for_money_rating * 10)::integer, 5) = 0));

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_pint_price_check
CHECK (pint_price IS NULL OR pint_price >= 0);

ALTER TABLE public.ratings
ADD CONSTRAINT ratings_notes_length_check
CHECK (notes IS NULL OR char_length(notes) <= 500);
