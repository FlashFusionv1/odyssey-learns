-- Feature 4: Parent-Child Video Messaging System

-- Create video messages table
CREATE TABLE public.video_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  title TEXT,
  message_text TEXT, -- Optional text accompaniment
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'deleted')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for video messages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-messages',
  'video-messages',
  false,
  52428800, -- 50MB limit
  ARRAY['video/webm', 'video/mp4', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.video_messages ENABLE ROW LEVEL SECURITY;

-- Parents can create and manage their own messages
CREATE POLICY "Parents can create messages for their children"
ON public.video_messages FOR INSERT
WITH CHECK (
  parent_id = auth.uid() AND
  child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

CREATE POLICY "Parents can view messages they sent"
ON public.video_messages FOR SELECT
USING (parent_id = auth.uid());

CREATE POLICY "Parents can update their own messages"
ON public.video_messages FOR UPDATE
USING (parent_id = auth.uid());

CREATE POLICY "Parents can delete their own messages"
ON public.video_messages FOR DELETE
USING (parent_id = auth.uid());

-- Children can view messages sent to them (via parent auth)
CREATE POLICY "Children can view messages sent to them"
ON public.video_messages FOR SELECT
USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

-- Children can mark messages as read (via parent auth)
CREATE POLICY "Children can mark messages as read"
ON public.video_messages FOR UPDATE
USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()))
WITH CHECK (status IN ('read', 'unread'));

-- Storage policies for video-messages bucket
CREATE POLICY "Parents can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'video-messages' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own family videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'video-messages' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Parents can delete their videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'video-messages' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create index for faster queries
CREATE INDEX idx_video_messages_child_status ON public.video_messages(child_id, status);
CREATE INDEX idx_video_messages_parent ON public.video_messages(parent_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_messages;