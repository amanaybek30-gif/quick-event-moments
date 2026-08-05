-- 1. Never expose the plaintext event password through the Data API
REVOKE SELECT (password) ON public.events FROM anon, authenticated;
REVOKE UPDATE (password), INSERT (password) ON public.events FROM anon, authenticated;

-- 2. Scope media reads to real events and to app roles (not blanket public)
DROP POLICY IF EXISTS "Media is viewable by everyone" ON public.event_media;
CREATE POLICY "Media readable for existing events"
ON public.event_media FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_media.event_id));

DROP POLICY IF EXISTS "Showcase media is viewable by everyone" ON public.event_showcase_media;
CREATE POLICY "Showcase readable for existing events"
ON public.event_showcase_media FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_showcase_media.event_id));

-- 3. Storage: remove the fully public DELETE policy; no UPDATE policy => overwrites denied
DROP POLICY IF EXISTS "Anyone can delete event covers" ON storage.objects;

-- Uploads stay allowed only into the two event buckets and only under an existing event folder
DROP POLICY IF EXISTS "Uploads allowed to event buckets" ON storage.objects;
CREATE POLICY "Uploads allowed to event folders"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id IN ('event-covers','event-media')
  AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = (storage.foldername(name))[1])
);