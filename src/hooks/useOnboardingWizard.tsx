/**
 * @fileoverview Onboarding Wizard Hook
 * Manages the multi-step onboarding wizard state and persistence.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import {
  WizardState,
  WizardStep,
  FULL_WIZARD_STEPS,
  QUICK_START_STEPS,
  LearningPreferences,
  LearningGoals,
  CommunitySettings,
} from '@/types/onboarding';

interface UseOnboardingWizardOptions {
  mode: 'full' | 'quick_start';
  onComplete?: (data: WizardFormData) => void;
  onSkip?: () => void;
}

export interface WizardFormData {
  // Learning Preferences
  preferredSubjects: string[];
  difficultyPreference: string;
  sessionLengthMinutes: number;
  learningStyle: string;
  
  // Goals
  primaryGoal: string;
  targetLessonsPerWeek: number;
  focusAreas: string[];
  
  // Community
  communityInterest: string;
  shareProgressPublicly: boolean;
  notificationFrequency: string;
}

const DEFAULT_FORM_DATA: WizardFormData = {
  preferredSubjects: [],
  difficultyPreference: 'adaptive',
  sessionLengthMinutes: 30,
  learningStyle: 'balanced',
  primaryGoal: 'balanced_development',
  targetLessonsPerWeek: 5,
  focusAreas: [],
  communityInterest: 'moderate',
  shareProgressPublicly: false,
  notificationFrequency: 'daily',
};

export function useOnboardingWizard(options: UseOnboardingWizardOptions) {
  const { mode, onComplete, onSkip } = options;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const steps = mode === 'full' ? FULL_WIZARD_STEPS : QUICK_START_STEPS;
  
  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    totalSteps: steps.length,
    completedSteps: [],
    formData: DEFAULT_FORM_DATA as Record<string, any>,
    isValid: true,
    canProceed: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing preferences if any
  useEffect(() => {
    if (!user) return;
    
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('onboarding_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error loading preferences:', error);
        }
        
        if (data) {
          setState(prev => ({
            ...prev,
            formData: {
              preferredSubjects: data.preferred_subjects || [],
              difficultyPreference: data.difficulty_preference || 'adaptive',
              sessionLengthMinutes: data.session_length_minutes || 30,
              learningStyle: data.learning_style || 'balanced',
              primaryGoal: data.primary_goal || 'balanced_development',
              targetLessonsPerWeek: data.target_lessons_per_week || 5,
              focusAreas: data.focus_areas || [],
              communityInterest: data.community_interest || 'moderate',
              shareProgressPublicly: data.share_progress_publicly || false,
              notificationFrequency: data.notification_frequency || 'daily',
            },
          }));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [user]);

  const currentStepData = steps[state.currentStep];
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === steps.length - 1;
  const progress = ((state.currentStep + 1) / steps.length) * 100;

  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
    }));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setState(prev => ({
        ...prev,
        currentStep: stepIndex,
      }));
    }
  }, [steps.length]);

  const nextStep = useCallback(() => {
    if (state.currentStep < steps.length - 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: [...prev.completedSteps, steps[prev.currentStep].id],
      }));
    }
  }, [state.currentStep, steps]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  }, [state.currentStep]);

  const savePreferences = useCallback(async () => {
    if (!user) return false;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('onboarding_preferences')
        .upsert({
          user_id: user.id,
          onboarding_mode: mode,
          preferred_subjects: state.formData.preferredSubjects,
          difficulty_preference: state.formData.difficultyPreference,
          session_length_minutes: state.formData.sessionLengthMinutes,
          learning_style: state.formData.learningStyle,
          primary_goal: state.formData.primaryGoal,
          target_lessons_per_week: state.formData.targetLessonsPerWeek,
          focus_areas: state.formData.focusAreas,
          community_interest: state.formData.communityInterest,
          share_progress_publicly: state.formData.shareProgressPublicly,
          notification_frequency: state.formData.notificationFrequency,
          wizard_completed: true,
          wizard_completed_at: new Date().toISOString(),
          quick_start_completed: mode === 'quick_start',
        }, {
          onConflict: 'user_id',
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, mode, state.formData, toast]);

  const completeWizard = useCallback(async () => {
    const success = await savePreferences();
    if (success) {
      toast({
        title: mode === 'quick_start' ? 'Quick Start Complete!' : 'Setup Complete!',
        description: 'Your preferences have been saved. Let\'s start learning!',
      });
      onComplete?.(state.formData as WizardFormData);
    }
  }, [savePreferences, mode, state.formData, onComplete, toast]);

  const skipWizard = useCallback(async () => {
    if (!user) {
      onSkip?.();
      return;
    }
    
    // Save with deferred items - cast formData properly
    try {
      await supabase
        .from('onboarding_preferences')
        .upsert({
          user_id: user.id,
          onboarding_mode: mode,
          wizard_completed: false,
          quick_start_completed: mode === 'quick_start',
          deferred_setup_items: steps
            .slice(state.currentStep)
            .map(s => s.id),
        }, {
          onConflict: 'user_id',
        });
    } catch (error) {
      console.error('Error saving skip state:', error);
    }
    
    onSkip?.();
  }, [user, mode, steps, state.currentStep, onSkip]);

  return {
    // State
    state,
    steps,
    currentStepData,
    isFirstStep,
    isLastStep,
    progress,
    isLoading,
    isSaving,
    
    // Actions
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    completeWizard,
    skipWizard,
    savePreferences,
  };
}

export default useOnboardingWizard;
