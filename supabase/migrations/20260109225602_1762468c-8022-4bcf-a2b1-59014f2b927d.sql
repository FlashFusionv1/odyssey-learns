-- =============================================
-- FEATURE 1: AI Content Studio Enhancement
-- =============================================

-- Lesson templates table for reusable content structures
CREATE TABLE public.lesson_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level_min INTEGER NOT NULL DEFAULT 0,
  grade_level_max INTEGER NOT NULL DEFAULT 12,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'advanced')),
  content_structure JSONB NOT NULL DEFAULT '{}',
  learning_objectives TEXT[],
  standards_alignment TEXT[],
  estimated_minutes INTEGER DEFAULT 15,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curriculum standards table for alignment
CREATE TABLE public.curriculum_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_code TEXT NOT NULL UNIQUE,
  standard_name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  category TEXT,
  framework TEXT DEFAULT 'Common Core',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch generation jobs tracking
CREATE TABLE public.batch_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  job_type TEXT NOT NULL DEFAULT 'lessons' CHECK (job_type IN ('lessons', 'templates', 'curriculum')),
  config JSONB NOT NULL DEFAULT '{}',
  grade_levels INTEGER[] NOT NULL,
  subjects TEXT[] NOT NULL,
  difficulty_levels TEXT[] DEFAULT ARRAY['easy', 'medium', 'hard'],
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FEATURE 2: Teacher Integration Platform
-- =============================================

-- Schools table
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  contact_email TEXT,
  contact_phone TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher profiles table
CREATE TABLE public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  school_id UUID REFERENCES public.schools(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subjects TEXT[],
  grade_levels INTEGER[],
  department TEXT,
  employee_id TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes/Classrooms table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teacher_profiles(id) NOT NULL,
  school_id UUID REFERENCES public.schools(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  description TEXT,
  class_code TEXT UNIQUE,
  academic_year TEXT,
  semester TEXT,
  max_students INTEGER DEFAULT 35,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class roster (students enrolled in classes)
CREATE TABLE public.class_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  enrolled_by UUID REFERENCES auth.users(id),
  enrollment_status TEXT DEFAULT 'active' CHECK (enrollment_status IN ('active', 'inactive', 'pending', 'withdrawn')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(class_id, child_id)
);

-- Class assignments
CREATE TABLE public.class_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.teacher_profiles(id) NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id),
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT DEFAULT 'lesson' CHECK (assignment_type IN ('lesson', 'quiz', 'project', 'homework', 'reading')),
  due_date TIMESTAMPTZ,
  available_from TIMESTAMPTZ DEFAULT NOW(),
  points_possible INTEGER DEFAULT 100,
  is_graded BOOLEAN DEFAULT true,
  allow_late_submission BOOLEAN DEFAULT true,
  late_penalty_percent INTEGER DEFAULT 10,
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student assignment submissions
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.class_assignments(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'graded', 'returned')),
  submitted_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  points_earned INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  quiz_answers JSONB,
  teacher_feedback TEXT,
  graded_by UUID REFERENCES public.teacher_profiles(id),
  graded_at TIMESTAMPTZ,
  is_late BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, child_id)
);

-- Class analytics aggregates
CREATE TABLE public.class_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_students INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  assignments_completed INTEGER DEFAULT 0,
  avg_score NUMERIC(5,2),
  avg_time_spent_minutes INTEGER DEFAULT 0,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  top_performing_subjects TEXT[],
  struggling_areas TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, analytics_date)
);

-- =============================================
-- FEATURE 3: Video Lesson Support
-- =============================================

-- Video lessons table
CREATE TABLE public.video_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  video_provider TEXT DEFAULT 'youtube' CHECK (video_provider IN ('youtube', 'vimeo', 'bunny', 'cloudflare', 'custom')),
  video_id TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  transcript TEXT,
  captions_url TEXT,
  chapter_markers JSONB DEFAULT '[]',
  quiz_timestamps JSONB DEFAULT '[]',
  grade_level INTEGER NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video watch progress
CREATE TABLE public.video_watch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.video_lessons(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  watch_position_seconds INTEGER DEFAULT 0,
  total_watch_time_seconds INTEGER DEFAULT 0,
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  interaction_events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, child_id)
);

-- Video analytics
CREATE TABLE public.video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.video_lessons(id) ON DELETE CASCADE NOT NULL,
  analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  avg_watch_time_seconds INTEGER DEFAULT 0,
  avg_completion_rate NUMERIC(5,2) DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  drop_off_points JSONB DEFAULT '[]',
  popular_segments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, analytics_date)
);

-- =============================================
-- Enable RLS on all new tables
-- =============================================

ALTER TABLE public.lesson_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Lesson templates (admins can manage, authenticated can read)
CREATE POLICY "Admins can manage lesson templates" ON public.lesson_templates
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Authenticated can read active templates" ON public.lesson_templates
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Curriculum standards (read-only for authenticated)
CREATE POLICY "Authenticated can read curriculum standards" ON public.curriculum_standards
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage curriculum standards" ON public.curriculum_standards
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Batch generation jobs (admins only)
CREATE POLICY "Admins can manage batch jobs" ON public.batch_generation_jobs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Schools (admins and teachers can read their school)
CREATE POLICY "Admins can manage schools" ON public.schools
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Teachers can read their school" ON public.schools
  FOR SELECT TO authenticated
  USING (id IN (SELECT school_id FROM public.teacher_profiles WHERE user_id = auth.uid()));

-- Teacher profiles
CREATE POLICY "Teachers can manage own profile" ON public.teacher_profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all teacher profiles" ON public.teacher_profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Parents can view teachers of enrolled children" ON public.teacher_profiles
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT c.teacher_id FROM public.classes c
      JOIN public.class_roster cr ON c.id = cr.class_id
      JOIN public.children ch ON cr.child_id = ch.id
      WHERE ch.parent_id = auth.uid()
    )
  );

-- Classes
CREATE POLICY "Teachers can manage own classes" ON public.classes
  FOR ALL TO authenticated
  USING (teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Parents can view children's classes" ON public.classes
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT cr.class_id FROM public.class_roster cr
      JOIN public.children ch ON cr.child_id = ch.id
      WHERE ch.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all classes" ON public.classes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Class roster
CREATE POLICY "Teachers can manage roster for own classes" ON public.class_roster
  FOR ALL TO authenticated
  USING (
    class_id IN (
      SELECT id FROM public.classes 
      WHERE teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Parents can view children's enrollment" ON public.class_roster
  FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

-- Class assignments
CREATE POLICY "Teachers can manage assignments" ON public.class_assignments
  FOR ALL TO authenticated
  USING (teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view published assignments" ON public.class_assignments
  FOR SELECT TO authenticated
  USING (
    status = 'published' AND
    class_id IN (
      SELECT class_id FROM public.class_roster 
      WHERE child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
      AND enrollment_status = 'active'
    )
  );

-- Assignment submissions
CREATE POLICY "Teachers can view submissions for their assignments" ON public.assignment_submissions
  FOR SELECT TO authenticated
  USING (
    assignment_id IN (
      SELECT id FROM public.class_assignments 
      WHERE teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can grade submissions" ON public.assignment_submissions
  FOR UPDATE TO authenticated
  USING (
    assignment_id IN (
      SELECT id FROM public.class_assignments 
      WHERE teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Parents can view children's submissions" ON public.assignment_submissions
  FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

CREATE POLICY "Children can manage own submissions" ON public.assignment_submissions
  FOR ALL TO authenticated
  USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

-- Class analytics
CREATE POLICY "Teachers can view own class analytics" ON public.class_analytics
  FOR SELECT TO authenticated
  USING (
    class_id IN (
      SELECT id FROM public.classes 
      WHERE teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all class analytics" ON public.class_analytics
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Video lessons
CREATE POLICY "Authenticated can read active videos" ON public.video_lessons
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage videos" ON public.video_lessons
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Video watch progress
CREATE POLICY "Users can manage own watch progress" ON public.video_watch_progress
  FOR ALL TO authenticated
  USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can view children's watch progress" ON public.video_watch_progress
  FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

-- Video analytics
CREATE POLICY "Admins can view video analytics" ON public.video_analytics
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- =============================================
-- Add teacher role to user_roles enum if not exists
-- =============================================

-- Check and add 'teacher' role value
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'teacher' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'teacher';
  END IF;
END
$$;

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX idx_lesson_templates_subject ON public.lesson_templates(subject);
CREATE INDEX idx_lesson_templates_grade ON public.lesson_templates(grade_level_min, grade_level_max);
CREATE INDEX idx_curriculum_standards_subject_grade ON public.curriculum_standards(subject, grade_level);
CREATE INDEX idx_batch_generation_jobs_status ON public.batch_generation_jobs(status);
CREATE INDEX idx_teacher_profiles_school ON public.teacher_profiles(school_id);
CREATE INDEX idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX idx_class_roster_class ON public.class_roster(class_id);
CREATE INDEX idx_class_roster_child ON public.class_roster(child_id);
CREATE INDEX idx_class_assignments_class ON public.class_assignments(class_id);
CREATE INDEX idx_class_assignments_due ON public.class_assignments(due_date);
CREATE INDEX idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_child ON public.assignment_submissions(child_id);
CREATE INDEX idx_video_lessons_subject_grade ON public.video_lessons(subject, grade_level);
CREATE INDEX idx_video_watch_progress_child ON public.video_watch_progress(child_id);
CREATE INDEX idx_video_analytics_date ON public.video_analytics(analytics_date);

-- =============================================
-- Helper functions
-- =============================================

-- Generate unique class code
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate class code on insert
CREATE OR REPLACE FUNCTION public.set_class_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.class_code IS NULL THEN
    NEW.class_code := public.generate_class_code();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.classes WHERE class_code = NEW.class_code) LOOP
      NEW.class_code := public.generate_class_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_class_code_trigger
  BEFORE INSERT ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_class_code();

-- Update video view count
CREATE OR REPLACE FUNCTION public.increment_video_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.video_lessons 
  SET view_count = view_count + 1 
  WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_video_view_trigger
  AFTER INSERT ON public.video_watch_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_video_view();

-- Update timestamps trigger for new tables
CREATE TRIGGER update_lesson_templates_updated_at
  BEFORE UPDATE ON public.lesson_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at
  BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_assignments_updated_at
  BEFORE UPDATE ON public.class_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at
  BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_lessons_updated_at
  BEFORE UPDATE ON public.video_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_watch_progress_updated_at
  BEFORE UPDATE ON public.video_watch_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();