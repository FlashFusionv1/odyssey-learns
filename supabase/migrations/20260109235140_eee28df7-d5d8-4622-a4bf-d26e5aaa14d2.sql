-- Create activity_sessions table for engagement tracking
CREATE TABLE IF NOT EXISTS public.activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('lesson', 'quiz', 'video', 'game', 'reading', 'practice')),
  activity_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  score NUMERIC(5,2),
  max_score NUMERIC(5,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can view their children's activity sessions"
ON public.activity_sessions FOR SELECT
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can insert activity sessions for their children"
ON public.activity_sessions FOR INSERT
WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can update their children's activity sessions"
ON public.activity_sessions FOR UPDATE
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Admins can manage all activity sessions"
ON public.activity_sessions FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX idx_activity_sessions_child_id ON public.activity_sessions(child_id);
CREATE INDEX idx_activity_sessions_started_at ON public.activity_sessions(started_at);

-- Seed sample video lessons for the Video Library
INSERT INTO public.video_lessons (title, description, video_url, video_provider, video_id, thumbnail_url, subject, grade_level, difficulty, duration_seconds, is_active) VALUES
-- Math Videos
('Counting Fun with Animals', 'Learn to count from 1 to 20 with friendly farm animals!', 'https://www.youtube.com/watch?v=DR-cfDsHCGA', 'youtube', 'DR-cfDsHCGA', 'https://img.youtube.com/vi/DR-cfDsHCGA/maxresdefault.jpg', 'Math', 0, 'easy', 180, true),
('Addition Adventures: Single Digits', 'Master single digit addition with fun visual examples.', 'https://www.youtube.com/watch?v=Y0Fup-l_VCM', 'youtube', 'Y0Fup-l_VCM', 'https://img.youtube.com/vi/Y0Fup-l_VCM/maxresdefault.jpg', 'Math', 1, 'easy', 300, true),
('Multiplication Tables Made Easy', 'Learn your times tables through catchy songs and patterns.', 'https://www.youtube.com/watch?v=0OxCLMLz5pU', 'youtube', '0OxCLMLz5pU', 'https://img.youtube.com/vi/0OxCLMLz5pU/maxresdefault.jpg', 'Math', 3, 'medium', 420, true),
('Fractions for Beginners', 'Understanding fractions using pizza and pie examples.', 'https://www.youtube.com/watch?v=kZm5IrTL1f0', 'youtube', 'kZm5IrTL1f0', 'https://img.youtube.com/vi/kZm5IrTL1f0/maxresdefault.jpg', 'Math', 4, 'medium', 480, true),

-- Reading Videos
('Phonics Fun: Letter Sounds', 'Learn the sounds of the alphabet with engaging animations.', 'https://www.youtube.com/watch?v=BELlZKpi1Zs', 'youtube', 'BELlZKpi1Zs', 'https://img.youtube.com/vi/BELlZKpi1Zs/maxresdefault.jpg', 'Reading', 0, 'easy', 240, true),
('Sight Words Song', 'Learn 100 sight words through repetition and music.', 'https://www.youtube.com/watch?v=HvKTLOzpjxc', 'youtube', 'HvKTLOzpjxc', 'https://img.youtube.com/vi/HvKTLOzpjxc/maxresdefault.jpg', 'Reading', 1, 'easy', 360, true),
('Reading Comprehension Strategies', 'Learn how to understand what you read better.', 'https://www.youtube.com/watch?v=E0I3e0r4RLY', 'youtube', 'E0I3e0r4RLY', 'https://img.youtube.com/vi/E0I3e0r4RLY/maxresdefault.jpg', 'Reading', 3, 'medium', 420, true),

-- Science Videos
('The Water Cycle Explained', 'Discover how water moves through our planet!', 'https://www.youtube.com/watch?v=al2GqKG8f0Q', 'youtube', 'al2GqKG8f0Q', 'https://img.youtube.com/vi/al2GqKG8f0Q/maxresdefault.jpg', 'Science', 2, 'medium', 300, true),
('Our Solar System Adventure', 'Take a journey through all the planets in our solar system.', 'https://www.youtube.com/watch?v=mQrlgH97v94', 'youtube', 'mQrlgH97v94', 'https://img.youtube.com/vi/mQrlgH97v94/maxresdefault.jpg', 'Science', 4, 'medium', 540, true),
('Animal Habitats Explored', 'Learn about where different animals live and why.', 'https://www.youtube.com/watch?v=P8_xz8cKz5o', 'youtube', 'P8_xz8cKz5o', 'https://img.youtube.com/vi/P8_xz8cKz5o/maxresdefault.jpg', 'Science', 2, 'easy', 360, true),

-- Emotional Intelligence Videos
('Understanding Your Emotions', 'Learn to identify and name your feelings.', 'https://www.youtube.com/watch?v=QT6FdhKriB8', 'youtube', 'QT6FdhKriB8', 'https://img.youtube.com/vi/QT6FdhKriB8/maxresdefault.jpg', 'Emotional Intelligence', 1, 'easy', 240, true),
('Deep Breathing for Kids', 'Calming techniques when you feel overwhelmed.', 'https://www.youtube.com/watch?v=_mZbzDOpylA', 'youtube', '_mZbzDOpylA', 'https://img.youtube.com/vi/_mZbzDOpylA/maxresdefault.jpg', 'Emotional Intelligence', 0, 'easy', 180, true),
('Being a Good Friend', 'Learn about kindness, sharing, and friendship.', 'https://www.youtube.com/watch?v=xn48ycUGRME', 'youtube', 'xn48ycUGRME', 'https://img.youtube.com/vi/xn48ycUGRME/maxresdefault.jpg', 'Emotional Intelligence', 2, 'easy', 300, true),

-- Life Skills Videos
('Money Basics: Coins and Bills', 'Learn to identify different types of money.', 'https://www.youtube.com/watch?v=qOSWQvRXAYY', 'youtube', 'qOSWQvRXAYY', 'https://img.youtube.com/vi/qOSWQvRXAYY/maxresdefault.jpg', 'Life Skills', 2, 'easy', 300, true),
('Telling Time: Hours and Minutes', 'Master reading analog and digital clocks.', 'https://www.youtube.com/watch?v=HrxZWNu72WI', 'youtube', 'HrxZWNu72WI', 'https://img.youtube.com/vi/HrxZWNu72WI/maxresdefault.jpg', 'Life Skills', 1, 'medium', 360, true)
ON CONFLICT DO NOTHING;