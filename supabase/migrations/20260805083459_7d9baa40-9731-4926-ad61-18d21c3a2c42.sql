DROP POLICY IF EXISTS "Uploads allowed to event folders" ON storage.objects;
CREATE POLICY "Uploads allowed to event folders"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'event-covers'
  OR (
    bucket_id = 'event-media'
    AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = (storage.foldername(name))[1])
  )
);