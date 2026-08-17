ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photo_limit integer NOT NULL DEFAULT 5;

CREATE TABLE IF NOT EXISTS public.event_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_token text NOT NULL,
  uploads integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (event_id, guest_token)
);

GRANT ALL ON public.event_guests TO service_role;

ALTER TABLE public.event_guests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_event_guests_event ON public.event_guests(event_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_event_guests_updated_at ON public.event_guests;
CREATE TRIGGER update_event_guests_updated_at
BEFORE UPDATE ON public.event_guests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Guests can upload media to open events" ON public.event_media;