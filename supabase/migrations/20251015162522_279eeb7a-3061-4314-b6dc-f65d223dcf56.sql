-- Create friends/peer connections table
CREATE TABLE IF NOT EXISTS public.peer_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  peer_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(child_id, peer_id),
  CHECK (child_id != peer_id)
);

-- Enable RLS
ALTER TABLE public.peer_connections ENABLE ROW LEVEL SECURITY;

-- Parents can manage their children's peer connections
CREATE POLICY "Parents can view children peer connections"
ON public.peer_connections FOR SELECT
USING (
  child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  OR peer_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

CREATE POLICY "Parents can create peer connections for children"
ON public.peer_connections FOR INSERT
WITH CHECK (
  child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

CREATE POLICY "Parents can update peer connections"
ON public.peer_connections FOR UPDATE
USING (
  child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  OR peer_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

CREATE POLICY "Parents can delete peer connections"
ON public.peer_connections FOR DELETE
USING (
  child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

-- Create shared activities table
CREATE TABLE IF NOT EXISTS public.shared_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('quiz', 'discussion', 'project', 'challenge')),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  max_participants INTEGER DEFAULT 4,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity participants table (before shared_activities RLS)
CREATE TABLE IF NOT EXISTS public.activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.shared_activities(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  contribution JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
  UNIQUE(activity_id, child_id)
);

-- Now enable RLS and add policies for shared_activities
ALTER TABLE public.shared_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view shared activities"
ON public.shared_activities FOR SELECT
USING (
  created_by IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  OR id IN (
    SELECT activity_id FROM public.activity_participants 
    WHERE child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  )
);

CREATE POLICY "Children can create shared activities"
ON public.shared_activities FOR INSERT
WITH CHECK (
  created_by IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

CREATE POLICY "Children can update their activities"
ON public.shared_activities FOR UPDATE
USING (
  created_by IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

-- Enable RLS for activity_participants
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view activity participants"
ON public.activity_participants FOR SELECT
USING (
  child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  OR activity_id IN (
    SELECT id FROM public.shared_activities 
    WHERE created_by IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  )
);

CREATE POLICY "Children can join activities"
ON public.activity_participants FOR INSERT
WITH CHECK (
  child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

CREATE POLICY "Children can update their participation"
ON public.activity_participants FOR UPDATE
USING (
  child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
);

-- Add indexes for performance
CREATE INDEX idx_peer_connections_child ON public.peer_connections(child_id);
CREATE INDEX idx_peer_connections_peer ON public.peer_connections(peer_id);
CREATE INDEX idx_peer_connections_status ON public.peer_connections(status);
CREATE INDEX idx_shared_activities_created_by ON public.shared_activities(created_by);
CREATE INDEX idx_shared_activities_status ON public.shared_activities(status);
CREATE INDEX idx_activity_participants_activity ON public.activity_participants(activity_id);
CREATE INDEX idx_activity_participants_child ON public.activity_participants(child_id);