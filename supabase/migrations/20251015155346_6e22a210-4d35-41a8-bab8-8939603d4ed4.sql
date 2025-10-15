-- Migration for Phase 4: Parent Tools (Fixed)

-- 1. Enhance screen_time_sessions table (add context)
ALTER TABLE screen_time_sessions
ADD COLUMN IF NOT EXISTS activity_type TEXT,
ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id);

-- 2. Create parent notifications table
CREATE TABLE IF NOT EXISTS parent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reward_request', 'weekly_report', 'achievement', 'concern', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on parent_notifications
ALTER TABLE parent_notifications ENABLE ROW LEVEL SECURITY;

-- Parents can view their own notifications
CREATE POLICY "Parents can view own notifications"
ON parent_notifications FOR SELECT
TO authenticated
USING (parent_id = auth.uid());

-- Parents can update their own notifications (mark as read)
CREATE POLICY "Parents can update own notifications"
ON parent_notifications FOR UPDATE
TO authenticated
USING (parent_id = auth.uid());

-- 3. Add screen time limit to children table
ALTER TABLE children
ADD COLUMN IF NOT EXISTS daily_screen_time_limit_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS screen_time_enabled BOOLEAN DEFAULT true;

-- 4. Update reward_redemptions with parent notes
ALTER TABLE reward_redemptions
ADD COLUMN IF NOT EXISTS parent_notes TEXT,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES profiles(id);

-- Update existing redemptions to have parent_id
UPDATE reward_redemptions
SET parent_id = (
  SELECT parent_id FROM children WHERE children.id = reward_redemptions.child_id
)
WHERE parent_id IS NULL;

-- 5. Create parent_child_messages table
CREATE TABLE IF NOT EXISTS parent_child_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('parent', 'child')),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'encouragement', 'reminder', 'celebration')),
  message_text TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  reaction TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on parent_child_messages
ALTER TABLE parent_child_messages ENABLE ROW LEVEL SECURITY;

-- Parents can view messages for their children
CREATE POLICY "Parents can view children messages"
ON parent_child_messages FOR SELECT
TO authenticated
USING (
  parent_id = auth.uid() OR 
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

-- Parents can send messages
CREATE POLICY "Parents can send messages"
ON parent_child_messages FOR INSERT
TO authenticated
WITH CHECK (
  parent_id = auth.uid() AND
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

-- Parents can update their messages (mark as read)
CREATE POLICY "Parents can update messages"
ON parent_child_messages FOR UPDATE
TO authenticated
USING (
  parent_id = auth.uid() OR
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_parent_notifications_parent_id ON parent_notifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_created_at ON parent_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_screen_time_child_date ON screen_time_sessions(child_id, session_start);
CREATE INDEX IF NOT EXISTS idx_messages_child_created ON parent_child_messages(child_id, created_at DESC);