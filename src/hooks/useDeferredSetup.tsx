/**
 * @fileoverview Deferred Setup Hook
 * Manages tracking and prompting for incomplete onboarding items.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DeferredSetupState {
  hasDeferredItems: boolean;
  deferredItems: string[];
  isQuickStartUser: boolean;
  wizardCompleted: boolean;
  dismissCount: number;
  lastDismissedAt: string | null;
}

interface UseDeferredSetupReturn {
  state: DeferredSetupState;
  isLoading: boolean;
  shouldShowBanner: boolean;
  dismissBanner: () => Promise<void>;
  markItemComplete: (itemId: string) => Promise<void>;
  resetDeferredItems: () => Promise<void>;
}

const DISMISS_COOLDOWN_HOURS = 24;
const MAX_BANNER_DISMISSALS = 5;

export function useDeferredSetup(): UseDeferredSetupReturn {
  const { user } = useAuth();
  
  const [state, setState] = useState<DeferredSetupState>({
    hasDeferredItems: false,
    deferredItems: [],
    isQuickStartUser: false,
    wizardCompleted: false,
    dismissCount: 0,
    lastDismissedAt: null,
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Load deferred setup state
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadDeferredState = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('onboarding_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading deferred setup:', error);
        }

        if (data) {
          const deferredItems = (data.deferred_setup_items as string[]) || [];
          setState({
            hasDeferredItems: deferredItems.length > 0,
            deferredItems,
            isQuickStartUser: data.quick_start_completed === true && !data.wizard_completed,
            wizardCompleted: data.wizard_completed === true,
            dismissCount: 0, // Could persist this in DB if needed
            lastDismissedAt: null,
          });
        }
      } catch (error) {
        console.error('Error loading deferred setup:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeferredState();
  }, [user]);

  // Calculate if banner should show
  const shouldShowBanner = useCallback(() => {
    // Don't show if wizard is completed
    if (state.wizardCompleted) return false;
    
    // Don't show if no deferred items
    if (!state.hasDeferredItems) return false;
    
    // Don't show if dismissed too many times
    if (state.dismissCount >= MAX_BANNER_DISMISSALS) return false;
    
    // Don't show if recently dismissed
    if (state.lastDismissedAt) {
      const lastDismissed = new Date(state.lastDismissedAt);
      const cooldownEnd = new Date(lastDismissed.getTime() + DISMISS_COOLDOWN_HOURS * 60 * 60 * 1000);
      if (new Date() < cooldownEnd) return false;
    }
    
    return true;
  }, [state]);

  const dismissBanner = useCallback(async () => {
    setState(prev => ({
      ...prev,
      dismissCount: prev.dismissCount + 1,
      lastDismissedAt: new Date().toISOString(),
    }));
    
    // Optionally persist dismiss to localStorage
    localStorage.setItem('deferred_setup_dismissed', new Date().toISOString());
  }, []);

  const markItemComplete = useCallback(async (itemId: string) => {
    if (!user) return;

    const updatedItems = state.deferredItems.filter(item => item !== itemId);
    
    try {
      await supabase
        .from('onboarding_preferences')
        .update({
          deferred_setup_items: updatedItems,
          wizard_completed: updatedItems.length === 0,
          wizard_completed_at: updatedItems.length === 0 ? new Date().toISOString() : null,
        })
        .eq('user_id', user.id);

      setState(prev => ({
        ...prev,
        deferredItems: updatedItems,
        hasDeferredItems: updatedItems.length > 0,
        wizardCompleted: updatedItems.length === 0,
      }));
    } catch (error) {
      console.error('Error marking item complete:', error);
    }
  }, [user, state.deferredItems]);

  const resetDeferredItems = useCallback(async () => {
    if (!user) return;

    // Reset to all items (for testing or restart)
    const allItems = ['learning_preferences', 'subjects', 'goals', 'schedule', 'community'];
    
    try {
      await supabase
        .from('onboarding_preferences')
        .update({
          deferred_setup_items: allItems,
          wizard_completed: false,
          wizard_completed_at: null,
        })
        .eq('user_id', user.id);

      setState(prev => ({
        ...prev,
        deferredItems: allItems,
        hasDeferredItems: true,
        wizardCompleted: false,
      }));
    } catch (error) {
      console.error('Error resetting deferred items:', error);
    }
  }, [user]);

  return {
    state,
    isLoading,
    shouldShowBanner: shouldShowBanner(),
    dismissBanner,
    markItemComplete,
    resetDeferredItems,
  };
}

export default useDeferredSetup;
