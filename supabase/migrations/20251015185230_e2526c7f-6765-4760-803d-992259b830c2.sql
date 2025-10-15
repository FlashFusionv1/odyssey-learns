-- Create beta_feedback table
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'content_issue', 'usability', 'general')),
  category TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  device_info JSONB,
  page_url TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'in_progress', 'resolved', 'wont_fix')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for beta_feedback
CREATE POLICY "Parents can submit feedback"
ON public.beta_feedback
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Parents can view own feedback"
ON public.beta_feedback
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for analytics_events
CREATE POLICY "Parents can log events for children"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can view children events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);