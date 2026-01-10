// Video Types for Enhanced Video Library

export interface ChapterMarker {
  time: number;
  title: string;
  description?: string;
}

export interface QuizTimestamp {
  time: number;
  question: string;
  options: string[];
  correct_index: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface VideoLesson {
  id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  video_url: string;
  video_provider: string | null;
  video_id: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  captions_url: string | null;
  chapter_markers: ChapterMarker[];
  quiz_timestamps: QuizTimestamp[];
  quiz_questions: QuizQuestion[];
  grade_level: number;
  subject: string;
  difficulty: string | null;
  is_active: boolean | null;
  view_count: number | null;
  points_value: number;
  learning_objectives: string[];
  age_min: number;
  age_max: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoWatchProgress {
  id: string;
  video_id: string;
  child_id: string;
  watch_position_seconds: number;
  total_watch_time_seconds: number;
  completion_percentage: number;
  quiz_score: number | null;
  quiz_answers: QuizAnswer[];
  completed_at: string | null;
  last_watched_at: string;
  interaction_events: VideoInteractionEvent[];
  created_at: string;
  updated_at: string;
}

export interface QuizAnswer {
  question_index: number;
  selected_answer: number;
  is_correct: boolean;
  time_to_answer_seconds?: number;
}

export interface VideoInteractionEvent {
  event_type: 'play' | 'pause' | 'seek' | 'speed_change' | 'fullscreen' | 'chapter_click';
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface VideoQuizResponse {
  id: string;
  video_id: string;
  child_id: string;
  question_index: number;
  selected_answer: number;
  is_correct: boolean;
  time_to_answer_seconds: number | null;
  answered_at: string;
}

export interface VideoAnalytics {
  id: string;
  video_id: string;
  child_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface VideoPlayerProps {
  videoId: string;
  childId: string;
  videoUrl: string;
  title: string;
  duration: number;
  transcript?: string;
  chapters?: ChapterMarker[];
  quizTimestamps?: QuizTimestamp[];
  onComplete?: () => void;
  autoPlay?: boolean;
}

export interface VideoCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration: number;
  subject: string;
  gradeLevel: number;
  viewCount: number;
  watchProgress: number;
  isCompleted: boolean;
  onPlay: () => void;
}

// Video Subject Categories
export const VIDEO_SUBJECTS = [
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

export type VideoSubject = typeof VIDEO_SUBJECTS[number];

// Video Difficulty Levels
export const VIDEO_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type VideoDifficulty = typeof VIDEO_DIFFICULTIES[number];

// Grade Level Helpers
export const GRADE_LEVEL_LABELS: Record<number, string> = {
  0: 'Kindergarten',
  1: 'Grade 1',
  2: 'Grade 2',
  3: 'Grade 3',
  4: 'Grade 4',
  5: 'Grade 5',
  6: 'Grade 6',
  7: 'Grade 7',
  8: 'Grade 8',
  9: 'Grade 9',
  10: 'Grade 10',
  11: 'Grade 11',
  12: 'Grade 12',
};

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getAgeTier(gradeLevel: number): 'K-2' | '3-5' | '6-8' | '9-12' {
  if (gradeLevel <= 2) return 'K-2';
  if (gradeLevel <= 5) return '3-5';
  if (gradeLevel <= 8) return '6-8';
  return '9-12';
}
