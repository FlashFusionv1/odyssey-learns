import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LearningProfile, 
  LearningPattern, 
  SkillMastery,
  SubjectArea,
  DifficultyLevel,
  LearningSpeed,
  SubjectStrength,
  SubjectWeakness,
} from '@/types/adaptive';
import { toast } from 'sonner';

interface UseLearningProfileOptions {
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

interface ProfileAnalysisResult {
  profile: LearningProfile;
  patterns: LearningPattern[];
  skills: SkillMastery[];
}

export function useLearningProfile(
  childId: string | null,
  options: UseLearningProfileOptions = {}
) {
  const { autoRefresh = false, refreshIntervalMs = 300000 } = options; // 5 min default
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch existing profile
  const profileQuery = useQuery({
    queryKey: ['learning-profile', childId],
    queryFn: async (): Promise<LearningProfile | null> => {
      if (!childId) return null;
      
      const { data, error } = await supabase
        .from('learning_profiles')
        .select('*')
        .eq('child_id', childId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform DB row to LearningProfile type
      return {
        id: data.id,
        childId: data.child_id,
        strengths: (Array.isArray(data.strengths) ? data.strengths : []) as unknown as SubjectStrength[],
        weaknesses: (Array.isArray(data.weaknesses) ? data.weaknesses : []) as unknown as SubjectWeakness[],
        learningSpeed: data.learning_speed as LearningSpeed,
        preferredSubjects: (data.preferred_subjects || []) as SubjectArea[],
        avoidedSubjects: (data.avoided_subjects || []) as SubjectArea[],
        overallCompletionRate: Number(data.overall_completion_rate) || 0,
        averageQuizScore: Number(data.average_quiz_score) || 0,
        averageSessionMinutes: Number(data.average_session_minutes) || 0,
        totalLessonsCompleted: data.total_lessons_completed || 0,
        currentStreak: data.current_streak || 0,
        optimalSessionLength: data.optimal_session_length || 20,
        bestTimeOfDay: data.best_time_of_day as LearningProfile['bestTimeOfDay'],
        preferredDifficulty: data.preferred_difficulty as DifficultyLevel,
        helpSeekingFrequency: data.help_seeking_frequency as LearningProfile['helpSeekingFrequency'],
        weeklyLessonVelocity: Number(data.weekly_lesson_velocity) || 0,
        skillAcquisitionRate: Number(data.skill_acquisition_rate) || 0,
        improvementTrend: data.improvement_trend as LearningProfile['improvementTrend'],
        profileVersion: data.profile_version || 1,
        lastAnalyzedAt: data.last_analyzed_at,
        dataPointsAnalyzed: data.data_points_analyzed || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    enabled: !!childId,
    staleTime: 60000, // 1 minute
    refetchInterval: autoRefresh ? refreshIntervalMs : false,
  });

  // Fetch patterns
  const patternsQuery = useQuery({
    queryKey: ['learning-patterns', childId],
    queryFn: async (): Promise<LearningPattern[]> => {
      if (!childId) return [];
      
      const { data, error } = await supabase
        .from('learning_patterns')
        .select('*')
        .eq('child_id', childId)
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        childId: row.child_id,
        patternType: row.pattern_type as LearningPattern['patternType'],
        subject: row.subject as SubjectArea | null,
        topic: row.topic,
        confidenceScore: Number(row.confidence_score),
        data: row.data as Record<string, unknown>,
        detectedAt: row.detected_at,
      }));
    },
    enabled: !!childId,
    staleTime: 60000,
  });

  // Fetch skill mastery
  const skillsQuery = useQuery({
    queryKey: ['skill-mastery', childId],
    queryFn: async (): Promise<SkillMastery[]> => {
      if (!childId) return [];
      
      const { data, error } = await supabase
        .from('skill_mastery')
        .select('*')
        .eq('child_id', childId)
        .order('mastery_percentage', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        childId: row.child_id,
        subject: row.subject as SubjectArea,
        skillName: row.skill_name,
        skillCategory: row.skill_category || '',
        currentLevel: row.current_level as DifficultyLevel,
        masteryPercentage: Number(row.mastery_percentage),
        practiceCount: row.practice_count,
        successRate: Number(row.success_rate),
        totalTimeSpentMinutes: row.total_time_spent_minutes,
        avgSessionMinutes: Number(row.avg_session_minutes),
        lastPracticedAt: row.last_practiced_at,
        improvementRate: Number(row.improvement_rate),
        projectedMasteryDate: row.projected_mastery_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    },
    enabled: !!childId,
    staleTime: 60000,
  });

  // Trigger AI analysis
  const analyzeProfile = useMutation({
    mutationFn: async (forceRefresh: boolean = false) => {
      if (!childId) throw new Error('No child selected');
      
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-learning-profile', {
        body: { childId, forceRefresh },
      });

      if (error) throw error;
      return data as ProfileAnalysisResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-profile', childId] });
      queryClient.invalidateQueries({ queryKey: ['learning-patterns', childId] });
      queryClient.invalidateQueries({ queryKey: ['skill-mastery', childId] });
      toast.success('Learning profile updated!');
    },
    onError: (error) => {
      console.error('Profile analysis failed:', error);
      toast.error('Failed to analyze learning profile');
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  // Check if profile needs refresh (>24 hours since last analysis)
  const needsRefresh = useCallback(() => {
    if (!profileQuery.data?.lastAnalyzedAt) return true;
    
    const lastAnalysis = new Date(profileQuery.data.lastAnalyzedAt);
    const hoursSinceAnalysis = (Date.now() - lastAnalysis.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceAnalysis > 24;
  }, [profileQuery.data?.lastAnalyzedAt]);

  // Auto-analyze if profile is stale
  useEffect(() => {
    if (childId && profileQuery.data === null && !profileQuery.isLoading && !isAnalyzing) {
      analyzeProfile.mutate(false);
    }
  }, [childId, profileQuery.data, profileQuery.isLoading, isAnalyzing]);

  // Computed values
  const topStrengths = useMemo(() => 
    profileQuery.data?.strengths?.slice(0, 3) || [], 
    [profileQuery.data?.strengths]
  );
  
  const topWeaknesses = useMemo(() => 
    profileQuery.data?.weaknesses?.slice(0, 3) || [], 
    [profileQuery.data?.weaknesses]
  );
  
  const subjectProgress = useMemo(() => 
    skillsQuery.data?.reduce((acc, skill) => {
      if (!acc[skill.subject]) {
        acc[skill.subject] = { total: 0, mastered: 0, avgMastery: 0 };
      }
      acc[skill.subject].total += 1;
      if (skill.masteryPercentage >= 80) {
        acc[skill.subject].mastered += 1;
      }
      acc[skill.subject].avgMastery = 
        (acc[skill.subject].avgMastery * (acc[skill.subject].total - 1) + skill.masteryPercentage) / 
        acc[skill.subject].total;
      return acc;
    }, {} as Record<SubjectArea, { total: number; mastered: number; avgMastery: number }>),
    [skillsQuery.data]
  );

  // Calculate overall mastery percentage
  const overallMastery = useMemo(() => {
    if (!skillsQuery.data?.length) return 0;
    const total = skillsQuery.data.reduce((sum, skill) => sum + skill.masteryPercentage, 0);
    return Math.round(total / skillsQuery.data.length);
  }, [skillsQuery.data]);

  return {
    // Data
    profile: profileQuery.data,
    patterns: patternsQuery.data || [],
    skills: skillsQuery.data || [],
    
    // Computed
    topStrengths,
    topWeaknesses,
    subjectProgress,
    overallMastery,
    
    // State
    isLoading: profileQuery.isLoading || patternsQuery.isLoading || skillsQuery.isLoading,
    isAnalyzing,
    needsRefresh: needsRefresh(),
    error: profileQuery.error || patternsQuery.error || skillsQuery.error,
    
    // Actions
    refreshProfile: () => analyzeProfile.mutate(true),
    analyzeProfile: (forceRefresh?: boolean) => analyzeProfile.mutate(forceRefresh ?? false),
  };
}
