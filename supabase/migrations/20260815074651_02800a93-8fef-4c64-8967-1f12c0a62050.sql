ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS guest_limit integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS plan_price integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'free';