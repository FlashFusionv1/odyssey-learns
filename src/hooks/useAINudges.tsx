/**
 * @fileoverview AI Nudges Hook
 * Fetches and manages personalized AI-driven nudges with caching and optimistic updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { AINudge, NudgeType, NudgeDisplayLocation } from '@/types/onboarding';

interface UseAINudgesOptions {
  childId?: string;
  location?: NudgeDisplayLocation;
  autoFetch?: boolean;
  maxNudges?: number;
  refreshInterval?: number; // in milliseconds
}

interface NudgeRow {
  id: string;
  nudge_type: string;
  trigger_reason: string;
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
  icon: string | null;
  priority: number | null;
  display_location: string | null;
  display_after: string | null;
  expires_at: string | null;
  max_impressions: number | null;
  impressions_count: number | null;
  confidence_score: number | null;
  context_data: Record<string, unknown> | null;
}

function mapRowToNudge(row: NudgeRow): AINudge {
  return {
    id: row.id,
    nudgeType: row.nudge_type as NudgeType,
    triggerReason: row.trigger_reason,
    title: row.title,
    message: row.message,
    actionUrl: row.action_url || undefined,
    actionLabel: row.action_label || undefined,
    icon: row.icon || 'Lightbulb',
    priority: row.priority || 5,
    displayLocation: (row.display_location as NudgeDisplayLocation) || 'dashboard',
    displayAfter: row.display_after || new Date().toISOString(),
    expiresAt: row.expires_at || undefined,
    maxImpressions: row.max_impressions || 3,
    impressionsCount: row.impressions_count || 0,
    confidenceScore: row.confidence_score || 0.5,
    contextData: (row.context_data as Record<string, any>) || {},
  };
}

export function useAINudges(options: UseAINudgesOptions = {}) {
  const { 
    childId, 
    location, 
    autoFetch = true, 
    maxNudges = 3,
    refreshInterval,
  } = options;
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [nudges, setNudges] = useState<AINudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

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
      
      // Filter out expired nudges and those over impression limit
      const now = new Date();
      const activeNudges = (data || [])
        .filter((n) => {
          if (n.expires_at && new Date(n.expires_at) < now) return false;
          if ((n.impressions_count || 0) >= (n.max_impressions || 3)) return false;
          return true;
        })
        .map((row): AINudge => ({
          id: row.id,
          nudgeType: row.nudge_type as NudgeType,
          triggerReason: row.trigger_reason,
          title: row.title,
          message: row.message,
          actionUrl: row.action_url || undefined,
          actionLabel: row.action_label || undefined,
          icon: row.icon || 'Lightbulb',
          priority: row.priority || 5,
          displayLocation: (row.display_location as NudgeDisplayLocation) || 'dashboard',
          displayAfter: row.display_after || new Date().toISOString(),
          expiresAt: row.expires_at || undefined,
          maxImpressions: row.max_impressions || 3,
          impressionsCount: row.impressions_count || 0,
          confidenceScore: row.confidence_score || 0.5,
          contextData: (row.context_data as Record<string, any>) || {},
        }));
      
      setNudges(activeNudges);
    } catch (err) {
      console.error('Error fetching nudges:', err);
      setError('Failed to load suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [user, childId, location, maxNudges]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && user && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchNudges();
    }
  }, [autoFetch, user, fetchNudges]);

  // Optional refresh interval
  useEffect(() => {
    if (!refreshInterval || !user) return;
    
    const interval = setInterval(fetchNudges, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, user, fetchNudges]);

  const recordImpression = useCallback(async (nudgeId: string) => {
    if (!user) return;
    
    try {
      // Optimistic update
      setNudges(prev => prev.map(n => 
        n.id === nudgeId 
          ? { ...n, impressionsCount: n.impressionsCount + 1 }
          : n
      ));
      
      const nudge = nudges.find(n => n.id === nudgeId);
      if (nudge) {
        await supabase
          .from('ai_nudges')
          .update({ impressions_count: nudge.impressionsCount + 1 })
          .eq('id', nudgeId);
      }
    } catch (error) {
      console.error('Error recording impression:', error);
    }
  }, [user, nudges]);

  const dismissNudge = useCallback(async (nudgeId: string) => {
    if (!user) return;
    
    // Optimistic removal
    setNudges(prev => prev.filter(n => n.id !== nudgeId));
    
    try {
      const { error: updateError } = await supabase
        .from('ai_nudges')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', nudgeId);
      
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error dismissing nudge:', error);
      // Revert optimistic update on error
      fetchNudges();
    }
  }, [user, fetchNudges]);

  const completeNudge = useCallback(async (nudgeId: string) => {
    if (!user) return;
    
    // Optimistic removal
    setNudges(prev => prev.filter(n => n.id !== nudgeId));
    
    try {
      const { error: updateError } = await supabase
        .from('ai_nudges')
        .update({ 
          completed_at: new Date().toISOString(),
          clicked_at: new Date().toISOString(),
        })
        .eq('id', nudgeId);
      
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error completing nudge:', error);
      fetchNudges();
    }
  }, [user, fetchNudges]);

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
