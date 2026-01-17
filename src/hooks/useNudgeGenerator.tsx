/**
 * @fileoverview Nudge Generator Hook
 * Triggers AI nudge generation based on user context.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UseNudgeGeneratorOptions {
  childId?: string;
  autoGenerate?: boolean;
  regenerateInterval?: number; // in milliseconds
}

export function useNudgeGenerator(options: UseNudgeGeneratorOptions = {}) {
  const { childId, autoGenerate = true, regenerateInterval = 24 * 60 * 60 * 1000 } = options;
  const { user } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateNudges = useCallback(async (forceRegenerate = false) => {
    if (!user) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-nudges', {
        body: { childId, forceRegenerate },
      });
      
      if (fnError) throw fnError;
      
      setLastGenerated(new Date());
      return data;
    } catch (err) {
      console.error('Error generating nudges:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate nudges');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, childId]);

  // Auto-generate on mount and at intervals
  useEffect(() => {
    if (!autoGenerate || !user) return;

    // Check last generation time from local storage
    const storageKey = `nudge_last_generated_${user.id}`;
    const stored = localStorage.getItem(storageKey);
    const lastGen = stored ? new Date(stored) : null;
    
    const shouldGenerate = !lastGen || 
      (Date.now() - lastGen.getTime() > regenerateInterval);

    if (shouldGenerate) {
      generateNudges().then(() => {
        localStorage.setItem(storageKey, new Date().toISOString());
      });
    }
  }, [autoGenerate, user, regenerateInterval, generateNudges]);

  return {
    generateNudges,
    isGenerating,
    lastGenerated,
    error,
  };
}

export default useNudgeGenerator;
