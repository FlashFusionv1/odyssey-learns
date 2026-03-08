/**
 * Auto-generated TypeScript types for Inner Odyssey Edge Functions API
 * Generated from OpenAPI specification
 * @see /public/api/openapi.json
 */

// ============================================
// Common Types
// ============================================

export interface ErrorResponse {
  error: string;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

// ============================================
// Health Check
// ============================================

export interface HealthCheckResponse {
  db: 'ok' | 'error';
  gemini: 'ok' | 'error';
  config: {
    safe_mode: boolean;
    kill_switch: boolean;
    has_gemini_key: boolean;
  };
  version: string;
  time: string;
  latency_ms: {
    db?: number;
    gemini?: number;
    total: number;
  };
}

// ============================================
// AI Insights
// ============================================

export interface AiInsightsRequest {
  /** UUID of the child to generate insights for */
  childId: string;
}

export interface AiInsightsResponse {
  /** List of identified learning strengths */
  strengths: string[];
  /** Actionable recommendations for parents */
  recommendations: string[];
  /** Concerns that need attention */
  alerts: string[];
  /** Suggested next actions */
  nextSteps: string[];
}

// ============================================
// AI Tutor
// ============================================

export interface AiTutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiTutorRequest {
  messages: AiTutorMessage[];
  childName: string;
  /** Grade level (0 = Kindergarten, 1-12 for grades) */
  gradeLevel: number;
  subject?: string;
}

// ============================================
// Custom Lesson Generation
// ============================================

export type LessonSubject =
  | 'Mathematics'
  | 'Science'
  | 'Reading'
  | 'Writing'
  | 'Social Studies'
  | 'Art'
  | 'Music'
  | 'Life Skills'
  | 'Emotional Intelligence';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade_level: number;
  description: string;
  content_markdown: string;
  quiz_questions: QuizQuestion[];
  estimated_minutes: number;
  points_value: number;
}

export interface GenerateCustomLessonRequest {
  childId: string;
  /** Topic to generate lesson about (max 200 chars) */
  topic: string;
  subject: LessonSubject;
  /** Grade level (0 = Kindergarten) */
  gradeLevel: number;
}

export interface GenerateCustomLessonResponse {
  success: boolean;
  lesson: Lesson;
  /** Remaining daily quota for this child */
  quota_remaining: number;
}

export interface QuotaExceededResponse {
  error: string;
  limit: number;
  generated: number;
  retry_after: string;
}

// ============================================
// AI Nudges
// ============================================

export interface Nudge {
  nudge_type: string;
  trigger_reason: string;
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  icon: string;
  priority: number;
  display_location: string;
  confidence_score: number;
  context_data?: Record<string, unknown>;
}

export interface GenerateNudgesRequest {
  childId?: string;
  forceRegenerate?: boolean;
}

export interface GenerateNudgesResponse {
  generated: number;
  nudges: Nudge[];
}

// ============================================
// reCAPTCHA Verification
// ============================================

export interface VerifyRecaptchaRequest {
  /** reCAPTCHA v3 response token */
  token: string;
  /** Action name (e.g., 'signup', 'login') */
  action: string;
}

export interface VerifyRecaptchaResponse {
  valid: boolean;
  /** Bot likelihood score (0-1, higher = more human) */
  score: number;
  action: string;
  reason: string | null;
}

// ============================================
// Child Data Export (COPPA/GDPR)
// ============================================

export type ExportFormat = 'json' | 'csv';

export interface ExportChildDataRequest {
  child_id: string;
  format?: ExportFormat;
}

export interface ExportChildDataResponse {
  export_date: string;
  child_profile: Record<string, unknown>;
  learning_progress: unknown[];
  emotion_logs: unknown[];
  screen_time_history: unknown[];
  activity_events: unknown[];
  messages: unknown[];
  created_lessons: unknown[];
}

// ============================================
// Child Account Deletion
// ============================================

export type DeletionAction = 'schedule' | 'cancel' | 'execute';

export interface DeleteChildAccountRequest {
  child_id: string;
  /** schedule = start 7-day grace period, cancel = abort, execute = permanent */
  action: DeletionAction;
}

export interface DeleteChildAccountResponse {
  message: string;
  deletion_date?: string;
}

// ============================================
// Analytics Tracking
// ============================================

export type LessonEventType = 'view' | 'save' | 'share';

export interface TrackLessonAnalyticsRequest {
  lessonId: string;
  childId: string;
  eventType: LessonEventType;
}

export interface TrackVideoAnalyticsRequest {
  videoId: string;
  childId: string;
  eventType: string;
  watchDuration?: number;
}

// ============================================
// Survey Analytics
// ============================================

export interface SurveyAnalyticsResponse {
  success: boolean;
  analytics: {
    by_score: {
      promoters: number;
      passives: number;
      detractors: number;
    };
    total_responses: number;
    nps_score: number;
    common_themes: string[];
  };
}

// ============================================
// Performance Alerts
// ============================================

export interface PerformanceAlertsResponse {
  success: boolean;
  alerts: string[];
  metrics_checked: number;
  timestamp: string;
}

// ============================================
// Security Alerts
// ============================================

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityAlertRequest {
  severity: SecuritySeverity;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Backup Verification
// ============================================

export interface VerifyBackupsResponse {
  timestamp: string;
  status: 'success' | 'error';
  database_accessible: boolean;
  record_counts: Record<string, number>;
  total_records: number;
  rls_active: boolean;
  checks_passed: boolean;
}

// ============================================
// Analyze Learning Profile
// ============================================

export interface AnalyzeLearningProfileRequest {
  childId: string;
  forceRefresh?: boolean;
}

export interface AnalyzeLearningProfileResponse {
  profile: {
    strengths: Array<{ subject: string; avg_score: number }>;
    weaknesses: Array<{ subject: string; avg_score: number }>;
    preferred_subjects: string[];
    average_quiz_score: number;
    preferred_difficulty: string;
  };
  cached: boolean;
  processing_time_ms: number;
}

// ============================================
// Generate Lesson Content
// ============================================

export interface GenerateLessonContentRequest {
  grade_level: number;
  subject: string;
  topic: string;
}

export interface GenerateLessonContentResponse {
  title: string;
  description: string;
  content_markdown: string;
  quiz_questions: Array<{
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
  }>;
  estimated_minutes: number;
  points_value: number;
  difficulty: string;
}

// ============================================
// Generate Recommendations
// ============================================

export interface GenerateRecommendationsRequest {
  childId: string;
  count?: number;
  filterSubjects?: string[];
}

export interface GenerateRecommendationsResponse {
  recommendations: Array<{
    id: string;
    title: string;
    subject: string;
    reason: string;
  }>;
  profile_summary: {
    strengths: string[];
    weaknesses: string[];
  };
}

// ============================================
// Generate Weekly Reports
// ============================================

export interface GenerateWeeklyReportsRequest {
  weekStartDate?: string;
}

// ============================================
// Generate Platform Images
// ============================================

export type ImageType = 'dashboard' | 'subject' | 'badge' | 'mascot' | 'illustration' | 'ui';

export interface GeneratePlatformImagesRequest {
  imageType: ImageType;
  imageCategory?: string;
  title: string;
  prompt: string;
  saveToStorage?: boolean;
}

export interface BatchImageGenerationRequest {
  images: GeneratePlatformImagesRequest[];
}

// ============================================
// Batch Lesson Generation
// ============================================

export interface BatchLessonGenerationRequest {
  gradeLevel: number;
  subjects: string[];
  count?: number;
  topics?: string[];
}

// ============================================
// Request Lesson Share
// ============================================

export interface RequestLessonShareRequest {
  lessonId: string;
  childId: string;
}

// ============================================
// API Client Helper Types
// ============================================

/** Edge function endpoint names */
export type EdgeFunctionName =
  | 'health-check'
  | 'ai-insights'
  | 'ai-tutor'
  | 'analyze-learning-profile'
  | 'generate-custom-lesson'
  | 'generate-lesson-content'
  | 'generate-nudges'
  | 'generate-recommendations'
  | 'generate-weekly-reports'
  | 'generate-platform-images'
  | 'batch-lesson-generation'
  | 'request-lesson-share'
  | 'verify-recaptcha'
  | 'export-child-data'
  | 'delete-child-account'
  | 'track-lesson-analytics'
  | 'track-video-analytics'
  | 'survey-analytics'
  | 'performance-alerts'
  | 'security-alert'
  | 'seed-lessons'
  | 'seed-kindergarten-lessons'
  | 'seed-grade-2-lessons'
  | 'seed-videos'
  | 'verify-backups';

/** Map of function names to their request/response types */
export interface EdgeFunctionMap {
  'health-check': { request: void; response: HealthCheckResponse };
  'ai-insights': { request: AiInsightsRequest; response: AiInsightsResponse };
  'ai-tutor': { request: AiTutorRequest; response: ReadableStream };
  'analyze-learning-profile': { request: AnalyzeLearningProfileRequest; response: AnalyzeLearningProfileResponse };
  'generate-custom-lesson': { request: GenerateCustomLessonRequest; response: GenerateCustomLessonResponse };
  'generate-lesson-content': { request: GenerateLessonContentRequest; response: GenerateLessonContentResponse };
  'generate-nudges': { request: GenerateNudgesRequest; response: GenerateNudgesResponse };
  'generate-recommendations': { request: GenerateRecommendationsRequest; response: GenerateRecommendationsResponse };
  'generate-weekly-reports': { request: GenerateWeeklyReportsRequest; response: SuccessResponse };
  'generate-platform-images': { request: GeneratePlatformImagesRequest; response: SuccessResponse };
  'batch-lesson-generation': { request: BatchLessonGenerationRequest; response: SuccessResponse };
  'request-lesson-share': { request: RequestLessonShareRequest; response: SuccessResponse };
  'verify-recaptcha': { request: VerifyRecaptchaRequest; response: VerifyRecaptchaResponse };
  'export-child-data': { request: ExportChildDataRequest; response: ExportChildDataResponse };
  'delete-child-account': { request: DeleteChildAccountRequest; response: DeleteChildAccountResponse };
  'track-lesson-analytics': { request: TrackLessonAnalyticsRequest; response: SuccessResponse };
  'track-video-analytics': { request: TrackVideoAnalyticsRequest; response: SuccessResponse };
  'survey-analytics': { request: void; response: SurveyAnalyticsResponse };
  'performance-alerts': { request: void; response: PerformanceAlertsResponse };
  'security-alert': { request: SecurityAlertRequest; response: SuccessResponse };
  'seed-lessons': { request: Record<string, unknown>; response: SuccessResponse };
  'seed-kindergarten-lessons': { request: Record<string, unknown>; response: SuccessResponse };
  'seed-grade-2-lessons': { request: Record<string, unknown>; response: SuccessResponse };
  'seed-videos': { request: void; response: SuccessResponse };
  'verify-backups': { request: void; response: VerifyBackupsResponse };
}
