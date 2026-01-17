/**
 * @fileoverview Onboarding System Type Definitions
 * Types for the comprehensive onboarding wizard, tutorials, and nudges.
 */

// ==================== USER PROFILE SCHEMA ====================

export interface OnboardingUserProfile {
  // Basic Info
  userId: string;
  onboardingMode: 'full' | 'quick_start';
  
  // Preferences
  preferences: LearningPreferences;
  goals: LearningGoals;
  communitySettings: CommunitySettings;
  
  // Completion Status
  completionStatus: OnboardingCompletionStatus;
  
  // Tutorial Progress
  tutorialProgress: TutorialProgressRecord[];
  
  // Nudge History
  nudgeHistory: NudgeHistoryItem[];
}

export interface LearningPreferences {
  preferredSubjects: Subject[];
  difficultyPreference: 'easy' | 'moderate' | 'challenging' | 'adaptive';
  sessionLengthMinutes: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'balanced';
}

export interface LearningGoals {
  primaryGoal: 'academic_growth' | 'emotional_intelligence' | 'life_skills' | 'balanced_development';
  targetLessonsPerWeek: number;
  focusAreas: string[];
}

export interface CommunitySettings {
  communityInterest: 'networking' | 'learning' | 'both' | 'minimal' | 'moderate';
  shareProgressPublicly: boolean;
  notificationFrequency: 'realtime' | 'daily' | 'weekly' | 'minimal';
}

export interface OnboardingCompletionStatus {
  wizardCompleted: boolean;
  wizardCompletedAt?: string;
  quickStartCompleted: boolean;
  deferredSetupItems: string[];
}

// ==================== WIZARD TYPES ====================

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: string;
  validationFn?: (data: any) => boolean;
  helpText?: string;
  estimatedMinutes?: number;
}

export interface WizardConfig {
  mode: 'full' | 'quick_start';
  steps: WizardStep[];
  canSkip: boolean;
  showProgress: boolean;
}

export interface WizardState {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  formData: Record<string, any>;
  isValid: boolean;
  canProceed: boolean;
}

// Full wizard steps (7+ steps)
export const FULL_WIZARD_STEPS: WizardStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Inner Odyssey',
    description: 'Your family\'s personalized learning adventure starts here!',
    icon: 'Sparkles',
    component: 'WelcomeStep',
    estimatedMinutes: 1,
  },
  {
    id: 'learning_preferences',
    title: 'Learning Preferences',
    description: 'Tell us about your child\'s learning style',
    icon: 'BookOpen',
    component: 'LearningPreferencesStep',
    estimatedMinutes: 2,
    helpText: 'These preferences help us personalize the learning experience',
  },
  {
    id: 'subjects',
    title: 'Subject Interests',
    description: 'Select the subjects your child is excited about',
    icon: 'Palette',
    component: 'SubjectsStep',
    estimatedMinutes: 1,
  },
  {
    id: 'goals',
    title: 'Learning Goals',
    description: 'What do you hope to achieve together?',
    icon: 'Target',
    component: 'GoalsStep',
    estimatedMinutes: 2,
    helpText: 'Goals help us track progress and celebrate achievements',
  },
  {
    id: 'schedule',
    title: 'Learning Schedule',
    description: 'Set up your weekly learning routine',
    icon: 'Calendar',
    component: 'ScheduleStep',
    estimatedMinutes: 1,
  },
  {
    id: 'community',
    title: 'Community & Sharing',
    description: 'Connect with other learning families',
    icon: 'Users',
    component: 'CommunityStep',
    estimatedMinutes: 1,
  },
  {
    id: 'review',
    title: 'Review & Confirm',
    description: 'Review your settings before getting started',
    icon: 'CheckCircle',
    component: 'ReviewStep',
    estimatedMinutes: 1,
  },
];

// Quick start steps (3-5 essential questions)
export const QUICK_START_STEPS: WizardStep[] = [
  {
    id: 'quick_welcome',
    title: 'Quick Start',
    description: 'Let\'s get you started in just a minute!',
    icon: 'Zap',
    component: 'QuickWelcomeStep',
    estimatedMinutes: 0.5,
  },
  {
    id: 'quick_child',
    title: 'Your Child',
    description: 'Tell us a bit about your child',
    icon: 'User',
    component: 'QuickChildStep',
    estimatedMinutes: 1,
  },
  {
    id: 'quick_goal',
    title: 'Primary Goal',
    description: 'What\'s most important for your family?',
    icon: 'Target',
    component: 'QuickGoalStep',
    estimatedMinutes: 0.5,
  },
  {
    id: 'quick_ready',
    title: 'You\'re Ready!',
    description: 'Start exploring immediately',
    icon: 'Rocket',
    component: 'QuickReadyStep',
    estimatedMinutes: 0.5,
  },
];

// ==================== TUTORIAL TYPES ====================

export interface TutorialStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: TutorialAction;
  highlightPadding?: number;
}

export interface TutorialAction {
  type: 'click' | 'input' | 'hover' | 'scroll';
  target?: string;
  value?: string;
}

export interface TutorialConfig {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  triggerCondition: TutorialTrigger;
  isSkippable: boolean;
  canResumeLater: boolean;
  category: 'feature' | 'workflow' | 'navigation';
}

export interface TutorialTrigger {
  type: 'first_visit' | 'feature_access' | 'manual' | 'inactivity' | 'milestone';
  route?: string;
  featureId?: string;
  delayMs?: number;
}

export interface TutorialProgressRecord {
  tutorialId: string;
  tutorialType: 'onboarding_wizard' | 'feature_spotlight' | 'contextual_walkthrough' | 'quick_tour';
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'deferred';
  startedAt?: string;
  completedAt?: string;
  lastInteractionAt?: string;
  timeSpentSeconds: number;
  stepsSkipped: number;
}

// ==================== NUDGE TYPES ====================

export interface AINudge {
  id: string;
  nudgeType: NudgeType;
  triggerReason: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  icon: string;
  priority: number;
  displayLocation: NudgeDisplayLocation;
  displayAfter: string;
  expiresAt?: string;
  maxImpressions: number;
  impressionsCount: number;
  confidenceScore: number;
  contextData: Record<string, any>;
}

export type NudgeType = 
  | 'preference_based'
  | 'activity_based'
  | 'incomplete_setup'
  | 'feature_discovery'
  | 'celebration'
  | 'reminder';

export type NudgeDisplayLocation = 
  | 'dashboard'
  | 'banner'
  | 'modal'
  | 'sidebar'
  | 'toast';

export interface NudgeHistoryItem {
  nudgeId: string;
  nudgeType: NudgeType;
  shownAt: string;
  action: 'dismissed' | 'clicked' | 'completed' | 'expired';
  feedbackRating?: number;
}

// ==================== TUTORIAL DEFINITIONS ====================

export const PARENT_DASHBOARD_TUTORIAL: TutorialConfig = {
  id: 'parent_dashboard_tour',
  name: 'Parent Dashboard Tour',
  description: 'Learn how to monitor your child\'s progress',
  isSkippable: true,
  canResumeLater: true,
  category: 'feature',
  triggerCondition: {
    type: 'first_visit',
    route: '/parent',
  },
  steps: [
    {
      id: 'child_selector',
      targetSelector: '[data-tutorial="child-selector"]',
      title: 'Switch Between Children',
      description: 'If you have multiple children, you can switch between them here to view their individual progress.',
      placement: 'bottom',
    },
    {
      id: 'progress_overview',
      targetSelector: '[data-tutorial="progress-overview"]',
      title: 'Progress at a Glance',
      description: 'See your child\'s recent activity, lessons completed, and points earned.',
      placement: 'bottom',
    },
    {
      id: 'weekly_goals',
      targetSelector: '[data-tutorial="weekly-goals"]',
      title: 'Weekly Goals',
      description: 'Track progress toward weekly learning goals you\'ve set together.',
      placement: 'right',
    },
    {
      id: 'rewards_section',
      targetSelector: '[data-tutorial="rewards"]',
      title: 'Manage Rewards',
      description: 'Create custom rewards your child can earn with their points!',
      placement: 'left',
    },
  ],
};

export const CHILD_LESSONS_TUTORIAL: TutorialConfig = {
  id: 'child_lessons_tour',
  name: 'Exploring Lessons',
  description: 'Learn how to find and start lessons',
  isSkippable: true,
  canResumeLater: true,
  category: 'workflow',
  triggerCondition: {
    type: 'first_visit',
    route: '/lessons',
  },
  steps: [
    {
      id: 'lesson_cards',
      targetSelector: '[data-tutorial="lesson-cards"]',
      title: 'Choose a Lesson',
      description: 'Tap any colorful card to start a fun learning adventure!',
      placement: 'bottom',
    },
    {
      id: 'subject_filter',
      targetSelector: '[data-tutorial="subject-filter"]',
      title: 'Filter by Subject',
      description: 'Find lessons in your favorite subjects like Math, Reading, or Science.',
      placement: 'bottom',
    },
    {
      id: 'daily_quest',
      targetSelector: '[data-tutorial="daily-quest"]',
      title: 'Daily Quest',
      description: 'Complete your daily quest to earn bonus stars!',
      placement: 'top',
    },
  ],
};

// ==================== SUBJECT TYPES ====================

export type Subject = 
  | 'math'
  | 'reading'
  | 'science'
  | 'social_studies'
  | 'art'
  | 'music'
  | 'physical_education'
  | 'emotional_intelligence'
  | 'life_skills'
  | 'language'
  | 'technology';

export const SUBJECT_OPTIONS: { value: Subject; label: string; icon: string; color: string }[] = [
  { value: 'math', label: 'Math', icon: 'Calculator', color: 'blue' },
  { value: 'reading', label: 'Reading', icon: 'BookOpen', color: 'green' },
  { value: 'science', label: 'Science', icon: 'Flask', color: 'purple' },
  { value: 'social_studies', label: 'Social Studies', icon: 'Globe', color: 'orange' },
  { value: 'art', label: 'Art', icon: 'Palette', color: 'pink' },
  { value: 'music', label: 'Music', icon: 'Music', color: 'yellow' },
  { value: 'physical_education', label: 'PE', icon: 'Activity', color: 'red' },
  { value: 'emotional_intelligence', label: 'Emotions', icon: 'Heart', color: 'rose' },
  { value: 'life_skills', label: 'Life Skills', icon: 'Lightbulb', color: 'amber' },
  { value: 'language', label: 'Language', icon: 'Languages', color: 'cyan' },
  { value: 'technology', label: 'Technology', icon: 'Monitor', color: 'slate' },
];
