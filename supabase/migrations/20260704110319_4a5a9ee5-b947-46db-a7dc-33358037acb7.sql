
-- Revoke SELECT on the password column from public roles; keep it for service_role.
REVOKE SELECT (password) ON public.events FROM anon, authenticated;

-- Secure RPC to verify an event password without exposing it.
CREATE OR REPLACE FUNCTION public.verify_event_password(_event_id text, _password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = _event_id AND password = _password
  );
$$;

-- Lock down execute: only anon + authenticated can call it, not PUBLIC broadly.
REVOKE ALL ON FUNCTION public.verify_event_password(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_event_password(text, text) TO anon, authenticated;

-- Prevent password from being broadcast over Realtime by removing the events
-- table from the realtime publication and re-adding it with a column filter.
-- Postgres publications don't support column filters via ALTER cleanly across
-- versions, so instead we drop the password from being visible: since anon
-- and authenticated can no longer SELECT the column, Realtime (which enforces
-- RLS + column privileges) will not include it in payloads.
