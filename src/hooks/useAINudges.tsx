/**
 * @fileoverview AI Nudges Hook
 * Fetches and manages personalized AI-driven nudges.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { AINudge, NudgeType } from '@/types/onboarding';

interface UseAINudgesOptions {
  childId?: string;
  location?: 'dashboard' | 'banner' | 'modal' | 'sidebar' | 'toast';
  autoFetch?: boolean;
  maxNudges?: number;
}

export function useAINudges(options: UseAINudgesOptions = {}) {
  const { childId, location, autoFetch = true, maxNudges = 3 } = options;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [nudges, setNudges] = useState<AINudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNudges = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('ai_nudges')
        .select('*')
        .eq('user_id', user.id)
        .is('dismissed_at', null)
        .is('completed_at', null)
        .lte('display_after', new Date().toISOString())
        .order('priority', { ascending: false })
        .limit(maxNudges);
      
      if (childId) {
        query = query.eq('child_id', childId);
      }
      
      if (location) {
        query = query.eq('display_location', location);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Filter out expired nudges
      const activeNudges = (data || []).filter(n => {
        if (n.expires_at && new Date(n.expires_at) < new Date()) return false;
        if (n.impressions_count >= n.max_impressions) return false;
        return true;
      });
      
      setNudges(activeNudges.map(n => ({
        id: n.id,
        nudgeType: n.nudge_type as NudgeType,
        triggerReason: n.trigger_reason,
        title: n.title,
        message: n.message,
        actionUrl: n.action_url,
        actionLabel: n.action_label,
        icon: n.icon,
        priority: n.priority,
        displayLocation: n.display_location as any,
        displayAfter: n.display_after,
        expiresAt: n.expires_at,
        maxImpressions: n.max_impressions,
        impressionsCount: n.impressions_count,
        confidenceScore: n.confidence_score,
        contextData: n.context_data as Record<string, any>,
      })));
    } catch (err) {
      console.error('Error fetching nudges:', err);
      setError('Failed to load suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [user, childId, location, maxNudges]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && user) {
      fetchNudges();
    }
  }, [autoFetch, user, fetchNudges]);

  const recordImpression = useCallback(async (nudgeId: string) => {
    if (!user) return;
    
    try {
      // Increment impressions count
      const nudge = nudges.find(n => n.id === nudgeId);
      if (nudge) {
        await supabase
          .from('ai_nudges')
          .update({
            impressions_count: nudge.impressionsCount + 1,
          })
          .eq('id', nudgeId);
      }
    } catch (error) {
      console.error('Error recording impression:', error);
    }
  }, [user]);

  const dismissNudge = useCallback(async (nudgeId: string) => {
    if (!user) return;
    
    try {
      const { error: updateError } = await supabase
        .from('ai_nudges')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', nudgeId);
      
      if (updateError) throw updateError;
      
      setNudges(prev => prev.filter(n => n.id !== nudgeId));
    } catch (error) {
      console.error('Error dismissing nudge:', error);
    }
  }, [user]);

  const completeNudge = useCallback(async (nudgeId: string) => {
    if (!user) return;
    
    try {
      const { error: updateError } = await supabase
        .from('ai_nudges')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', nudgeId);
      
      if (updateError) throw updateError;
      
      setNudges(prev => prev.filter(n => n.id !== nudgeId));
    } catch (error) {
      console.error('Error completing nudge:', error);
    }
  }, [user]);

  const rateNudge = useCallback(async (nudgeId: string, rating: number) => {
    if (!user) return;
    
    try {
      await supabase
        .from('ai_nudges')
        .update({ feedback_rating: rating })
        .eq('id', nudgeId);
      
      toast({
        title: 'Thanks for your feedback!',
        description: 'This helps us improve your experience.',
      });
    } catch (error) {
      console.error('Error rating nudge:', error);
    }
  }, [user, toast]);

  return {
    nudges,
    isLoading,
    error,
    fetchNudges,
    recordImpression,
    dismissNudge,
    completeNudge,
    rateNudge,
  };
}

export default useAINudges;
