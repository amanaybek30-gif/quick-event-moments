
-- Create events table
CREATE TABLE public.events (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  password TEXT NOT NULL,
  welcome_message TEXT,
  uploads INTEGER DEFAULT 0,
  contributors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events are publicly readable (guests need to see them via QR)
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

-- Events can be inserted by anyone (admin uses hardcoded creds, no auth)
CREATE POLICY "Events can be created"
  ON public.events FOR INSERT
  WITH CHECK (true);

-- Events can be updated by anyone (admin/organizer manage via password)
CREATE POLICY "Events can be updated"
  ON public.events FOR UPDATE
  USING (true);

-- Events can be deleted
CREATE POLICY "Events can be deleted"
  ON public.events FOR DELETE
  USING (true);

-- Create event_media table
CREATE TABLE public.event_media (
  id TEXT NOT NULL PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  uploader_name TEXT DEFAULT 'Guest',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media is viewable by everyone"
  ON public.event_media FOR SELECT
  USING (true);

CREATE POLICY "Media can be uploaded"
  ON public.event_media FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Media can be deleted"
  ON public.event_media FOR DELETE
  USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('event-covers', 'event-covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('event-media', 'event-media', true);

-- Storage policies
CREATE POLICY "Event covers are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-covers');

CREATE POLICY "Anyone can upload event covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-covers');

CREATE POLICY "Event media is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-media');

CREATE POLICY "Anyone can upload event media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-media');

CREATE POLICY "Anyone can delete event media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-media');

CREATE POLICY "Anyone can delete event covers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-covers');
