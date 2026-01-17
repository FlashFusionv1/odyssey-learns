/**
 * @fileoverview Tutorial Progress Hook
 * Manages tutorial state, progress persistence, and contextual triggers.
 * Phase 5: Tutorial Trigger System for Inner Odyssey K-12
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { 
  TutorialConfig, 
  TutorialProgressRecord, 
  TutorialTrigger,
} from '@/types/onboarding';

interface UseTutorialProgressOptions {
  childId?: string;
  autoTrigger?: boolean;
  onTutorialStart?: (tutorialId: string) => void;
  onTutorialComplete?: (tutorialId: string) => void;
}

interface TutorialState {
  activeTutorial: TutorialConfig | null;
  currentStep: number;
  isActive: boolean;
  progress: TutorialProgressRecord[];
  startedAt: Date | null;
}

// Tutorial registry - add new tutorials here
const TUTORIAL_REGISTRY: Map<string, TutorialConfig> = new Map();

export function registerTutorial(config: TutorialConfig) {
  TUTORIAL_REGISTRY.set(config.id, config);
}

export function useTutorialProgress(options: UseTutorialProgressOptions = {}) {
  const { childId, autoTrigger = true, onTutorialStart, onTutorialComplete } = options;
  
  const { user } = useAuth();
  const location = useLocation();
  
  const [state, setState] = useState<TutorialState>({
    activeTutorial: null,
    currentStep: 0,
    isActive: false,
    progress: [],
    startedAt: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const triggeredTutorials = useRef<Set<string>>(new Set());
  const sessionStartTime = useRef<Date | null>(null);

  // Fetch all tutorial progress for user
  const fetchProgress = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (childId) {
        query = query.eq('child_id', childId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const progressRecords: TutorialProgressRecord[] = (data || []).map(row => ({
        tutorialId: row.tutorial_id,
        tutorialType: row.tutorial_type as TutorialProgressRecord['tutorialType'],
        currentStep: row.current_step || 0,
        totalSteps: row.total_steps || 0,
        completionPercentage: row.total_steps 
          ? ((row.current_step || 0) / row.total_steps) * 100 
          : 0,
        status: row.status as TutorialProgressRecord['status'],
        startedAt: row.started_at || undefined,
        completedAt: row.completed_at || undefined,
        lastInteractionAt: row.updated_at || undefined,
        timeSpentSeconds: row.time_spent_seconds || 0,
        stepsSkipped: row.steps_skipped || 0,
      }));
      
      setState(prev => ({ ...prev, progress: progressRecords }));
    } catch (error) {
      console.error('Error fetching tutorial progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, childId]);

  // Check if tutorial has been completed or skipped
  const isTutorialCompleted = useCallback((tutorialId: string): boolean => {
    const record = state.progress.find(p => p.tutorialId === tutorialId);
    return record?.status === 'completed' || record?.status === 'skipped';
  }, [state.progress]);

  // Check trigger conditions
  const shouldTriggerTutorial = useCallback((config: TutorialConfig): boolean => {
    const { triggerCondition } = config;
    
    // Already completed?
    if (isTutorialCompleted(config.id)) return false;
    
    // Already triggered this session?
    if (triggeredTutorials.current.has(config.id)) return false;
    
    switch (triggerCondition.type) {
      case 'first_visit':
        return triggerCondition.route === location.pathname;
      
      case 'feature_access':
        // This would be called programmatically via triggerFeatureTutorial
        return false;
      
      case 'manual':
        return false;
      
      case 'inactivity':
        // Would need idle detection
        return false;
      
      case 'milestone':
        // Would be triggered by achievement system
        return false;
      
      default:
        return false;
    }
  }, [isTutorialCompleted, location.pathname]);

  // Start a tutorial
  const startTutorial = useCallback(async (tutorialId: string) => {
    const config = TUTORIAL_REGISTRY.get(tutorialId);
    if (!config) {
      console.warn(`Tutorial not found: ${tutorialId}`);
      return;
    }
    
    triggeredTutorials.current.add(tutorialId);
    sessionStartTime.current = new Date();
    
    setState(prev => ({
      ...prev,
      activeTutorial: config,
      currentStep: 0,
      isActive: true,
      startedAt: new Date(),
    }));
    
    // Save progress to database
    if (user) {
      try {
        await supabase.from('tutorial_progress').upsert({
          user_id: user.id,
          child_id: childId || null,
          tutorial_id: tutorialId,
          tutorial_type: config.category === 'feature' ? 'feature_spotlight' : 'contextual_walkthrough',
          current_step: 0,
          total_steps: config.steps.length,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,tutorial_id',
        });
      } catch (error) {
        console.error('Error saving tutorial start:', error);
      }
    }
    
    onTutorialStart?.(tutorialId);
  }, [user, childId, onTutorialStart]);

  // Advance to next step
  const nextStep = useCallback(async () => {
    if (!state.activeTutorial) return;
    
    const newStep = state.currentStep + 1;
    const totalSteps = state.activeTutorial.steps.length;
    
    if (newStep >= totalSteps) {
      // Tutorial complete
      await completeTutorial();
    } else {
      setState(prev => ({ ...prev, currentStep: newStep }));
      
      // Update progress in database
      if (user) {
        try {
          await supabase.from('tutorial_progress').update({
            current_step: newStep,
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id).eq('tutorial_id', state.activeTutorial.id);
        } catch (error) {
          console.error('Error updating tutorial step:', error);
        }
      }
    }
  }, [state.activeTutorial, state.currentStep, user]);

  // Go to previous step
  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [state.currentStep]);

  // Complete the tutorial
  const completeTutorial = useCallback(async () => {
    if (!state.activeTutorial) return;
    
    const tutorialId = state.activeTutorial.id;
    const timeSpent = sessionStartTime.current 
      ? Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000)
      : 0;
    
    // Update database
    if (user) {
      try {
        await supabase.from('tutorial_progress').update({
          status: 'completed',
          current_step: state.activeTutorial.steps.length,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
        }).eq('user_id', user.id).eq('tutorial_id', tutorialId);
        
        // Log feature discovery
        await supabase.from('feature_discovery_log').insert({
          user_id: user.id,
          child_id: childId || null,
          feature_id: tutorialId,
          feature_category: state.activeTutorial.category,
          tutorial_triggered: true,
          tutorial_completed: true,
        });
      } catch (error) {
        console.error('Error completing tutorial:', error);
      }
    }
    
    setState(prev => ({
      ...prev,
      activeTutorial: null,
      currentStep: 0,
      isActive: false,
      startedAt: null,
    }));
    
    onTutorialComplete?.(tutorialId);
  }, [state.activeTutorial, user, childId, onTutorialComplete]);

  // Skip the tutorial
  const skipTutorial = useCallback(async () => {
    if (!state.activeTutorial) return;
    
    const tutorialId = state.activeTutorial.id;
    const timeSpent = sessionStartTime.current 
      ? Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000)
      : 0;
    
    if (user) {
      try {
        await supabase.from('tutorial_progress').update({
          status: 'skipped',
          steps_skipped: state.activeTutorial.steps.length - state.currentStep,
          time_spent_seconds: timeSpent,
        }).eq('user_id', user.id).eq('tutorial_id', tutorialId);
      } catch (error) {
        console.error('Error skipping tutorial:', error);
      }
    }
    
    setState(prev => ({
      ...prev,
      activeTutorial: null,
      currentStep: 0,
      isActive: false,
      startedAt: null,
    }));
  }, [state.activeTutorial, state.currentStep, user]);

  // Defer tutorial for later
  const deferTutorial = useCallback(async () => {
    if (!state.activeTutorial) return;
    
    if (user) {
      try {
        await supabase.from('tutorial_progress').update({
          status: 'deferred',
        }).eq('user_id', user.id).eq('tutorial_id', state.activeTutorial.id);
      } catch (error) {
        console.error('Error deferring tutorial:', error);
      }
    }
    
    setState(prev => ({
      ...prev,
      activeTutorial: null,
      currentStep: 0,
      isActive: false,
      startedAt: null,
    }));
  }, [state.activeTutorial, user]);

  // Trigger a specific feature tutorial programmatically
  const triggerFeatureTutorial = useCallback(async (featureId: string) => {
    const config = Array.from(TUTORIAL_REGISTRY.values()).find(
      c => c.triggerCondition.featureId === featureId
    );
    
    if (config && !isTutorialCompleted(config.id)) {
      await startTutorial(config.id);
    }
  }, [isTutorialCompleted, startTutorial]);

  // Get available tutorials for current context
  const getAvailableTutorials = useCallback((): TutorialConfig[] => {
    return Array.from(TUTORIAL_REGISTRY.values()).filter(
      config => !isTutorialCompleted(config.id)
    );
  }, [isTutorialCompleted]);

  // Resume a deferred tutorial
  const resumeTutorial = useCallback(async (tutorialId: string) => {
    const config = TUTORIAL_REGISTRY.get(tutorialId);
    if (!config) return;
    
    const progressRecord = state.progress.find(p => p.tutorialId === tutorialId);
    const startStep = progressRecord?.currentStep || 0;
    
    triggeredTutorials.current.add(tutorialId);
    sessionStartTime.current = new Date();
    
    setState(prev => ({
      ...prev,
      activeTutorial: config,
      currentStep: startStep,
      isActive: true,
      startedAt: new Date(),
    }));
    
    if (user) {
      try {
        await supabase.from('tutorial_progress').update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id).eq('tutorial_id', tutorialId);
      } catch (error) {
        console.error('Error resuming tutorial:', error);
      }
    }
  }, [state.progress, user]);

  // Auto-fetch progress on mount
  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, fetchProgress]);

  // Auto-trigger tutorials based on route
  useEffect(() => {
    if (!autoTrigger || !user || isLoading) return;
    
    // Check all registered tutorials for trigger conditions
    for (const config of TUTORIAL_REGISTRY.values()) {
      if (shouldTriggerTutorial(config)) {
        // Delay trigger slightly to allow page to render
        const delay = config.triggerCondition.delayMs || 1000;
        const timeoutId = setTimeout(() => {
          startTutorial(config.id);
        }, delay);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [autoTrigger, user, isLoading, location.pathname, shouldTriggerTutorial, startTutorial]);

  return {
    // State
    activeTutorial: state.activeTutorial,
    currentStep: state.currentStep,
    isActive: state.isActive,
    progress: state.progress,
    isLoading,
    
    // Current step info
    currentStepData: state.activeTutorial?.steps[state.currentStep] || null,
    totalSteps: state.activeTutorial?.steps.length || 0,
    progressPercentage: state.activeTutorial 
      ? ((state.currentStep + 1) / state.activeTutorial.steps.length) * 100 
      : 0,
    
    // Actions
    startTutorial,
    nextStep,
    prevStep,
    completeTutorial,
    skipTutorial,
    deferTutorial,
    resumeTutorial,
    triggerFeatureTutorial,
    
    // Utilities
    isTutorialCompleted,
    getAvailableTutorials,
    fetchProgress,
  };
}

export default useTutorialProgress;
