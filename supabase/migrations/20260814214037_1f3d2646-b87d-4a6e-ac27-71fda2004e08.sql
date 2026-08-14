ALTER TABLE public.events ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.events ALTER COLUMN password SET DEFAULT '';
CREATE INDEX IF NOT EXISTS events_owner_id_idx ON public.events (owner_id);