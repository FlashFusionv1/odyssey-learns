// Lesson Types for Inner Odyssey

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  grade_level: number;
  difficulty: LessonDifficulty | null;
  content_markdown: string;
  quiz_questions: QuizQuestion[] | null;
  estimated_minutes: number | null;
  points_value: number | null;
  thumbnail_url: string | null;
  is_active: boolean | null;
  is_premium: boolean | null;
  review_status: LessonReviewStatus | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type LessonReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  points?: number;
}

export interface LessonProgress {
  id: string;
  child_id: string;
  lesson_id: string;
  started_at: string;
  completed_at: string | null;
  quiz_score: number | null;
  quiz_answers: QuizAnswer[] | null;
  time_spent_seconds: number;
  attempts: number;
  is_completed: boolean;
}

export interface QuizAnswer {
  question_index: number;
  selected_answer: number;
  is_correct: boolean;
}

export interface LessonCompletion {
  lessonId: string;
  childId: string;
  score: number;
  timeSpentSeconds: number;
  quizAnswers: QuizAnswer[];
  completedAt: string;
}

export interface LessonFilter {
  subject?: string;
  gradeLevel?: number;
  difficulty?: LessonDifficulty;
  isActive?: boolean;
  searchQuery?: string;
}

export interface LessonRecommendation {
  lessonId: string;
  title: string;
  subject: string;
  difficulty: string;
  reason: RecommendationReason;
  matchScore: number;
  estimatedMinutes: number;
}

export type RecommendationReason = 
  | 'remediation' 
  | 'challenge' 
  | 'interest' 
  | 'next_step' 
  | 'review' 
  | 'exploration';

export interface ChildGeneratedLesson {
  id: string;
  child_id: string;
  parent_id: string;
  creator_child_id: string | null;
  title: string;
  description: string | null;
  subject: string;
  grade_level: number;
  difficulty: LessonDifficulty | null;
  content_markdown: string;
  quiz_questions: QuizQuestion[] | null;
  estimated_minutes: number | null;
  points_value: number | null;
  generation_prompt: string | null;
  is_active: boolean | null;
  share_status: ShareStatus | null;
  parent_approved_at: string | null;
  parent_approved_by: string | null;
  rejection_reason: string | null;
  times_used: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export type ShareStatus = 'private' | 'pending_approval' | 'shared' | 'rejected';

// Subject definitions
export const LESSON_SUBJECTS = [
  'Math',
  'Reading',
  'Science',
  'Social Studies',
  'Emotional Intelligence',
  'Life Skills',
  'Art',
  'Music',
  'Physical Education',
  'Technology',
] as const;

export type LessonSubject = typeof LESSON_SUBJECTS[number];

// High School Subjects (Grades 9-12)
export const HIGH_SCHOOL_SUBJECTS = [
  'Pre-Algebra',
  'Algebra',
  'Geometry',
  'Algebra II',
  'Pre-Calculus',
  'Biology',
  'Chemistry',
  'Physics',
  'English',
  'US History',
  'World History',
  'Government',
  'Economics',
  'College Prep',
  'Life Skills',
] as const;

export type HighSchoolSubject = typeof HIGH_SCHOOL_SUBJECTS[number];

// Difficulty labels
export const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

// Subject colors
export const SUBJECT_COLORS: Record<string, string> = {
  Math: 'bg-blue-500',
  Reading: 'bg-green-500',
  Science: 'bg-purple-500',
  'Social Studies': 'bg-amber-500',
  'Emotional Intelligence': 'bg-pink-500',
  'Life Skills': 'bg-teal-500',
  Art: 'bg-orange-500',
  Music: 'bg-indigo-500',
  'Physical Education': 'bg-red-500',
  Technology: 'bg-cyan-500',
  'Pre-Algebra': 'bg-blue-400',
  Algebra: 'bg-blue-500',
  Geometry: 'bg-blue-600',
  'Algebra II': 'bg-blue-700',
  'Pre-Calculus': 'bg-blue-800',
  Biology: 'bg-green-600',
  Chemistry: 'bg-purple-600',
  Physics: 'bg-violet-600',
  English: 'bg-emerald-500',
  'US History': 'bg-amber-600',
  'World History': 'bg-amber-700',
  Government: 'bg-slate-600',
  Economics: 'bg-yellow-600',
  'College Prep': 'bg-indigo-600',
};

// Helper functions
export function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] || 'bg-gray-500';
}

export function getDifficultyColor(difficulty: LessonDifficulty): string {
  const colors: Record<LessonDifficulty, string> = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-orange-500',
    expert: 'bg-red-500',
  };
  return colors[difficulty] || 'bg-gray-500';
}

export function estimateReadingTime(contentMarkdown: string): number {
  const wordsPerMinute = 200;
  const wordCount = contentMarkdown.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
