-- Add challenge mode support to children table
ALTER TABLE children
ADD COLUMN IF NOT EXISTS challenge_mode_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS weekly_report_enabled boolean DEFAULT true;

-- Create lesson_notes table for digital notebook
CREATE TABLE IF NOT EXISTS lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  note_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(child_id, lesson_id)
);

-- Enable RLS on lesson_notes
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view their own notes"
ON lesson_notes FOR SELECT
USING (auth.uid() IN (
  SELECT parent_id FROM children WHERE id = child_id
));

CREATE POLICY "Children can create their own notes"
ON lesson_notes FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT parent_id FROM children WHERE id = child_id
));

CREATE POLICY "Children can update their own notes"
ON lesson_notes FOR UPDATE
USING (auth.uid() IN (
  SELECT parent_id FROM children WHERE id = child_id
));

-- Create collaboration_requests table for safe peer learning
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  recipient_child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  parent_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  UNIQUE(requester_child_id, recipient_child_id, lesson_id)
);

-- Enable RLS on collaboration_requests
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view collaboration requests for their children"
ON collaboration_requests FOR SELECT
USING (auth.uid() IN (
  SELECT parent_id FROM children 
  WHERE id = requester_child_id OR id = recipient_child_id
));

CREATE POLICY "Parents can approve collaboration requests"
ON collaboration_requests FOR UPDATE
USING (auth.uid() IN (
  SELECT parent_id FROM children WHERE id = recipient_child_id
));

-- Create parent_weekly_reports table
CREATE TABLE IF NOT EXISTS parent_weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  week_start_date date NOT NULL,
  lessons_completed integer DEFAULT 0,
  total_points_earned integer DEFAULT 0,
  strongest_subject text,
  growth_area text,
  conversation_starter text,
  top_achievement text,
  report_data jsonb DEFAULT '{}'::jsonb,
  sent_at timestamptz DEFAULT now(),
  UNIQUE(child_id, week_start_date)
);

-- Enable RLS on parent_weekly_reports
ALTER TABLE parent_weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own weekly reports"
ON parent_weekly_reports FOR SELECT
USING (auth.uid() = parent_id);

-- Add comments for documentation
COMMENT ON TABLE lesson_notes IS 'Stores student notes taken during lessons (digital notebook feature)';
COMMENT ON TABLE collaboration_requests IS 'Manages parent-approved peer collaboration requests';
COMMENT ON TABLE parent_weekly_reports IS 'Auto-generated weekly learning summaries for parents';
COMMENT ON COLUMN children.challenge_mode_enabled IS 'Whether student has opted into harder challenge mode for bonus points';
COMMENT ON COLUMN children.weekly_report_enabled IS 'Whether parent wants to receive automated weekly email reports';