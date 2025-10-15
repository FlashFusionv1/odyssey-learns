import { supabase } from '@/integrations/supabase/client';

export interface DailyQuest {
  lesson_id: string;
  lesson_title: string;
  lesson_subject: string;
  bonus_points: number;
}

/**
 * Generates a daily quest for a child by selecting an incomplete lesson
 * from their grade level that they haven't completed yet.
 */
export const generateDailyQuest = async (
  childId: string,
  gradeLevel: number
): Promise<DailyQuest | null> => {
  try {
    // Get completed lesson IDs for this child
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('child_id', childId)
      .eq('status', 'completed');

    const completedLessonIds = progressData?.map(p => p.lesson_id) || [];

    // Find an incomplete lesson from their grade level
    let query = supabase
      .from('lessons')
      .select('id, title, subject, points_value')
      .eq('grade_level', gradeLevel)
      .eq('is_active', true);

    // Exclude completed lessons if any exist
    if (completedLessonIds.length > 0) {
      query = query.not('id', 'in', `(${completedLessonIds.join(',')})`);
    }

    const { data: lessons, error } = await query.limit(10);

    if (error) throw error;
    if (!lessons || lessons.length === 0) return null;

    // Randomly select one lesson
    const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];

    // Calculate bonus points (25% bonus)
    const bonusPoints = Math.round(randomLesson.points_value * 0.25);

    return {
      lesson_id: randomLesson.id,
      lesson_title: randomLesson.title,
      lesson_subject: randomLesson.subject,
      bonus_points: bonusPoints,
    };
  } catch (error) {
    console.error('Error generating daily quest:', error);
    return null;
  }
};

/**
 * Checks if the current daily quest is stale (completed or date has changed)
 */
export const isQuestStale = (questCompletedAt: string | null): boolean => {
  if (!questCompletedAt) return false;

  const completedDate = new Date(questCompletedAt);
  const today = new Date();

  // Check if the quest was completed on a different day
  return (
    completedDate.getDate() !== today.getDate() ||
    completedDate.getMonth() !== today.getMonth() ||
    completedDate.getFullYear() !== today.getFullYear()
  );
};
