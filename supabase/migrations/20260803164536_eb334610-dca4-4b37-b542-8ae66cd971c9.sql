ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue text DEFAULT '';
UPDATE public.events SET venue = COALESCE(NULLIF(venue, ''), description, '') WHERE COALESCE(venue, '') = '';