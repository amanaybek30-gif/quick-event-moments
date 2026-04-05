
CREATE OR REPLACE FUNCTION public.sync_event_uploads_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_event_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_event_id := OLD.event_id;
  ELSE
    target_event_id := NEW.event_id;
  END IF;

  UPDATE public.events
  SET uploads = (
    SELECT count(*)::integer FROM public.event_media WHERE event_id = target_event_id
  )
  WHERE id = target_event_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_uploads ON public.event_media;
CREATE TRIGGER trg_sync_uploads
AFTER INSERT OR DELETE ON public.event_media
FOR EACH ROW
EXECUTE FUNCTION public.sync_event_uploads_count();

-- Backfill existing counts
UPDATE public.events e
SET uploads = (SELECT count(*)::integer FROM public.event_media em WHERE em.event_id = e.id);
