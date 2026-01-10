-- Phase 1: Video Library Enhancement - Final

-- Add quiz_score and quiz_answers to video_watch_progress
ALTER TABLE public.video_watch_progress 
ADD COLUMN IF NOT EXISTS quiz_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS quiz_answers JSONB DEFAULT '[]';

-- Add learning_objectives and points_value to video_lessons
ALTER TABLE public.video_lessons 
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS points_value INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS age_min INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS age_max INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS quiz_questions JSONB DEFAULT '[]';

-- Create video_quiz_responses table for detailed tracking
CREATE TABLE IF NOT EXISTS public.video_quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES video_lessons(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_to_answer_seconds INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new table
ALTER TABLE public.video_quiz_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_quiz_responses
CREATE POLICY "quiz_responses_select_own" ON public.video_quiz_responses
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "quiz_responses_insert_own" ON public.video_quiz_responses
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Create trigger for updated_at on video_watch_progress
CREATE OR REPLACE FUNCTION update_video_watch_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_video_watch_progress_updated_at ON video_watch_progress;
CREATE TRIGGER trigger_video_watch_progress_updated_at
  BEFORE UPDATE ON video_watch_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_video_watch_progress_updated_at();