-- 1. Remove publicly executable SECURITY DEFINER functions
DROP FUNCTION IF EXISTS public.verify_event_password(text, text);
REVOKE ALL ON FUNCTION public.sync_event_uploads_count() FROM PUBLIC, anon, authenticated;

-- 2. events: read-only for clients, writes via service role only
DROP POLICY IF EXISTS "Events can be created" ON public.events;
DROP POLICY IF EXISTS "Events can be updated" ON public.events;
DROP POLICY IF EXISTS "Events can be deleted" ON public.events;
REVOKE INSERT, UPDATE, DELETE ON public.events FROM anon, authenticated;
GRANT ALL ON public.events TO service_role;

-- 3. event_showcase_media: read-only for clients
DROP POLICY IF EXISTS "Showcase media can be uploaded" ON public.event_showcase_media;
DROP POLICY IF EXISTS "Showcase media can be deleted" ON public.event_showcase_media;
REVOKE INSERT, UPDATE, DELETE ON public.event_showcase_media FROM anon, authenticated;
GRANT ALL ON public.event_showcase_media TO service_role;

-- 4. event_media: guests may insert only for events with QR access enabled; no deletes
DROP POLICY IF EXISTS "Media can be uploaded" ON public.event_media;
DROP POLICY IF EXISTS "Media can be deleted" ON public.event_media;
REVOKE UPDATE, DELETE ON public.event_media FROM anon, authenticated;
GRANT SELECT, INSERT ON public.event_media TO anon, authenticated;
GRANT ALL ON public.event_media TO service_role;

CREATE POLICY "Guests can upload media to open events"
ON public.event_media
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_media.event_id AND e.qr_enabled = true
  )
);

-- 5. Storage: no listing, no client deletes; uploads still allowed
DROP POLICY IF EXISTS "Event covers are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Event media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete event media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload event covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload event media" ON storage.objects;

CREATE POLICY "Uploads allowed to event buckets"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id IN ('event-covers', 'event-media'));