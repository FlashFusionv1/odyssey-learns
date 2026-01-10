/**
 * @fileoverview Onboarding State Management Hook
 * Manages onboarding status for parents and children with persistent storage.
 * Supports multi-step tutorials with progress tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserType = 'parent' | 'child';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  targetElement?: string; // CSS selector for spotlight
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  showTutorial: boolean;
  hasSeenFeatureTour: boolean;
}

interface UseOnboardingOptions {
  userType: UserType;
  childId?: string;
  autoShow?: boolean;
}

/**
 * Custom hook for managing user onboarding state
 * @param options - Configuration options for the onboarding flow
 * @returns Onboarding state and control functions
 */
export function useOnboarding(options: UseOnboardingOptions) {
  const { userType, childId, autoShow = true } = options;
  const { user } = useAuth();
  
  const [state, setState] = useState<OnboardingState>({
    isCompleted: true, // Default to true to prevent flash
    currentStep: 0,
    totalSteps: 0,
    showTutorial: false,
    hasSeenFeatureTour: false,
  });
  const [loading, setLoading] = useState(true);

  /**
   * Load onboarding status from database
   */
  const loadOnboardingStatus = useCallback(async () => {
    if (!user && userType === 'parent') {
      setLoading(false);
      return;
    }

    try {
      if (userType === 'parent') {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user!.id)
          .single();

        if (data) {
          const shouldShow = autoShow && !data.onboarding_completed;
          setState(prev => ({
            ...prev,
            isCompleted: data.onboarding_completed ?? false,
            currentStep: data.onboarding_step ?? 0,
            showTutorial: shouldShow,
          }));
        }
      } else if (userType === 'child' && childId) {
        // For children, check localStorage as they don't have auth accounts
        const storageKey = `child_onboarding_${childId}`;
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setState(prev => ({
            ...prev,
            isCompleted: parsed.isCompleted ?? false,
            currentStep: parsed.currentStep ?? 0,
            showTutorial: autoShow && !parsed.isCompleted,
          }));
        } else {
          // First time for this child
          setState(prev => ({
            ...prev,
            isCompleted: false,
            currentStep: 0,
            showTutorial: autoShow,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    } finally {
      setLoading(false);
    }
  }, [user, userType, childId, autoShow]);

  useEffect(() => {
    loadOnboardingStatus();
  }, [loadOnboardingStatus]);

  /**
   * Mark the current step as complete and advance
   */
  const nextStep = useCallback(async (totalSteps: number) => {
    const newStep = state.currentStep + 1;
    const isComplete = newStep >= totalSteps;

    setState(prev => ({
      ...prev,
      currentStep: newStep,
      isCompleted: isComplete,
      showTutorial: !isComplete,
      totalSteps,
    }));

    // Persist progress
    if (userType === 'parent' && user) {
      await supabase
        .from('profiles')
        .update({
          onboarding_step: newStep,
          onboarding_completed: isComplete,
        })
        .eq('id', user.id);
    } else if (userType === 'child' && childId) {
      const storageKey = `child_onboarding_${childId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        currentStep: newStep,
        isCompleted: isComplete,
      }));
    }
  }, [state.currentStep, user, userType, childId]);

  /**
   * Go back to previous step
   */
  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  }, [state.currentStep]);

  /**
   * Skip the tutorial entirely
   */
  const skipTutorial = useCallback(async (dontShowAgain: boolean = false) => {
    setState(prev => ({
      ...prev,
      showTutorial: false,
      isCompleted: dontShowAgain,
    }));

    if (dontShowAgain) {
      if (userType === 'parent' && user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      } else if (userType === 'child' && childId) {
        const storageKey = `child_onboarding_${childId}`;
        localStorage.setItem(storageKey, JSON.stringify({
          currentStep: 0,
          isCompleted: true,
        }));
      }
    }
  }, [user, userType, childId]);

  /**
   * Reset onboarding (for testing or user request)
   */
  const resetOnboarding = useCallback(async () => {
    setState({
      isCompleted: false,
      currentStep: 0,
      totalSteps: 0,
      showTutorial: true,
      hasSeenFeatureTour: false,
    });

    if (userType === 'parent' && user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: false, onboarding_step: 0 })
        .eq('id', user.id);
    } else if (userType === 'child' && childId) {
      const storageKey = `child_onboarding_${childId}`;
      localStorage.removeItem(storageKey);
    }
  }, [user, userType, childId]);

  /**
   * Manually show the tutorial
   */
  const showTutorial = useCallback(() => {
    setState(prev => ({ ...prev, showTutorial: true }));
  }, []);

  /**
   * Manually hide the tutorial
   */
  const hideTutorial = useCallback(() => {
    setState(prev => ({ ...prev, showTutorial: false }));
  }, []);

  return {
    ...state,
    loading,
    nextStep,
    prevStep,
    skipTutorial,
    resetOnboarding,
    showTutorial,
    hideTutorial,
  };
}

export default useOnboarding;
