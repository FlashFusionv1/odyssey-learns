import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LessonRecommendationFull, 
  RecommendationCardData,
  SubjectArea, 
  DifficultyLevel,
  RecommendationReason,
  FeedbackType,
  DismissalReason,
} from '@/types/adaptive';
import { toast } from 'sonner';

interface UseRecommendationsOptions {
  count?: number;
  filterSubjects?: SubjectArea[];
  autoRefresh?: boolean;
}

export function useRecommendations(
  childId: string | null,
  options: UseRecommendationsOptions = {}
) {
  const { count = 5, filterSubjects, autoRefresh = false } = options;
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch active recommendations using the database function
  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', childId, count],
    queryFn: async (): Promise<RecommendationCardData[]> => {
      if (!childId) return [];
      
      const { data, error } = await supabase.rpc('get_active_recommendations', {
        p_child_id: childId,
        p_limit: count
      });

      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        lessonId: row.lesson_id,
        title: row.lesson_title,
        subject: row.lesson_subject as SubjectArea,
        difficulty: 'intermediate' as DifficultyLevel, // Default, will be enriched
        reason: row.reason as RecommendationReason,
        reasonText: row.reason_explanation || getDefaultReasonText(row.reason as RecommendationReason),
        priority: row.priority,
        predictedTimeMinutes: row.predicted_time_minutes || 15,
        predictedEngagement: 'medium' as const,
        thumbnailUrl: undefined,
      }));
    },
    enabled: !!childId,
    staleTime: 120000, // 2 minutes
    refetchInterval: autoRefresh ? 300000 : false, // 5 min if auto-refresh
  });

  // Generate new recommendations
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      if (!childId) throw new Error('No child selected');
      
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { 
          childId, 
          count,
          filterSubjects 
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', childId] });
      toast.success('New recommendations generated!');
    },
    onError: (error) => {
      console.error('Failed to generate recommendations:', error);
      toast.error('Failed to generate recommendations');
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // Dismiss a recommendation
  const dismissRecommendation = useMutation({
    mutationFn: async ({ 
      recommendationId, 
      reason 
    }: { 
      recommendationId: string; 
      reason?: DismissalReason;
    }) => {
      // Update the recommendation
      const { error: updateError } = await supabase
        .from('lesson_recommendations')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', recommendationId);

      if (updateError) throw updateError;

      // Log feedback if reason provided
      if (reason && childId) {
        const { error: feedbackError } = await supabase
          .from('recommendation_feedback')
          .insert({
            recommendation_id: recommendationId,
            child_id: childId,
            feedback_type: 'dismissed' as FeedbackType,
            dismissal_reason: reason,
          });

        if (feedbackError) console.error('Failed to log feedback:', feedbackError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', childId] });
    },
    onError: (error) => {
      console.error('Failed to dismiss recommendation:', error);
      toast.error('Failed to dismiss recommendation');
    },
  });

  // Mark recommendation as completed
  const completeRecommendation = useMutation({
    mutationFn: async ({ 
      recommendationId, 
      wasHelpful,
      actualScore,
      actualTimeMinutes,
      difficultyRating,
      enjoymentRating,
    }: { 
      recommendationId: string; 
      wasHelpful?: boolean;
      actualScore?: number;
      actualTimeMinutes?: number;
      difficultyRating?: 1 | 2 | 3 | 4 | 5;
      enjoymentRating?: 1 | 2 | 3 | 4 | 5;
    }) => {
      // Update the recommendation
      const { error: updateError } = await supabase
        .from('lesson_recommendations')
        .update({ 
          completed_at: new Date().toISOString(),
          was_helpful: wasHelpful,
          actual_score: actualScore,
          actual_time_minutes: actualTimeMinutes,
        })
        .eq('id', recommendationId);

      if (updateError) throw updateError;

      // Log completion feedback
      if (childId) {
        const { error: feedbackError } = await supabase
          .from('recommendation_feedback')
          .insert({
            recommendation_id: recommendationId,
            child_id: childId,
            feedback_type: 'completed' as FeedbackType,
            was_helpful: wasHelpful,
            difficulty_rating: difficultyRating,
            enjoyment_rating: enjoymentRating,
          });

        if (feedbackError) console.error('Failed to log feedback:', feedbackError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', childId] });
      queryClient.invalidateQueries({ queryKey: ['learning-profile', childId] });
    },
    onError: (error) => {
      console.error('Failed to complete recommendation:', error);
    },
  });

  // Get recommendation by lesson ID (to check if lesson is recommended)
  const getRecommendationForLesson = (lessonId: string): RecommendationCardData | undefined => {
    return recommendationsQuery.data?.find(r => r.lessonId === lessonId);
  };

  return {
    // Data
    recommendations: recommendationsQuery.data || [],
    
    // State
    isLoading: recommendationsQuery.isLoading,
    isGenerating,
    error: recommendationsQuery.error,
    
    // Actions
    generateRecommendations: () => generateRecommendations.mutate(),
    dismissRecommendation: (id: string, reason?: DismissalReason) => 
      dismissRecommendation.mutate({ recommendationId: id, reason }),
    completeRecommendation: (params: Parameters<typeof completeRecommendation.mutate>[0]) => 
      completeRecommendation.mutate(params),
    
    // Helpers
    getRecommendationForLesson,
    hasRecommendations: (recommendationsQuery.data?.length || 0) > 0,
  };
}

// Helper to generate default reason text
function getDefaultReasonText(reason: RecommendationReason): string {
  const reasonTexts: Record<RecommendationReason, string> = {
    remediation: 'This will help strengthen skills you\'re still learning.',
    challenge: 'Ready for a new challenge? Try this one!',
    interest: 'Based on topics you enjoy!',
    next_step: 'The next step in your learning journey.',
    review: 'A quick review to keep skills fresh.',
    exploration: 'Explore something new and exciting!',
  };
  return reasonTexts[reason] || 'Recommended for you!';
}
