import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Rate limiting constants
const VALIDATION_COOLDOWN_MS = 5000; // 5 seconds between validations
const MAX_VALIDATIONS_PER_MINUTE = 12;

/**
 * Secure hook for child selection that validates ownership server-side.
 * NEVER trust localStorage for authorization - this validates against the database.
 * 
 * Includes client-side rate limiting to prevent query spam from localStorage manipulation.
 */
export const useValidatedChild = () => {
  const [childId, setChildId] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Rate limiting refs (persist across renders)
  const lastValidationTime = useRef<number>(0);
  const validationCount = useRef<number>(0);
  const validationWindowStart = useRef<number>(Date.now());
  const cachedValidChild = useRef<string | null>(null);

  /**
   * Rate limit check - returns true if validation should be skipped
   */
  const isRateLimited = useCallback((): boolean => {
    const now = Date.now();

    // Reset window if a minute has passed
    if (now - validationWindowStart.current > 60000) {
      validationCount.current = 0;
      validationWindowStart.current = now;
    }

    // Check cooldown
    if (now - lastValidationTime.current < VALIDATION_COOLDOWN_MS) {
      console.debug('[useValidatedChild] Rate limited: within cooldown period');
      return true;
    }

    // Check max validations per minute
    if (validationCount.current >= MAX_VALIDATIONS_PER_MINUTE) {
      console.warn('[useValidatedChild] Rate limited: too many validations');
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    const validateChild = async () => {
      if (!user) {
        setChildId(null);
        setIsValidating(false);
        cachedValidChild.current = null;
        return;
      }

      const storedChildId = localStorage.getItem('selectedChildId');
      
      if (!storedChildId) {
        setChildId(null);
        setIsValidating(false);
        cachedValidChild.current = null;
        return;
      }

      // If stored ID matches cached valid child and within cooldown, skip validation
      if (storedChildId === cachedValidChild.current && isRateLimited()) {
        setChildId(cachedValidChild.current);
        setIsValidating(false);
        return;
      }

      // Rate limit check for new validations
      if (storedChildId !== cachedValidChild.current && isRateLimited()) {
        // Different ID but rate limited - use cached if available, otherwise reject
        if (cachedValidChild.current) {
          setChildId(cachedValidChild.current);
        } else {
          setChildId(null);
          localStorage.removeItem('selectedChildId');
        }
        setIsValidating(false);
        return;
      }

      // Update rate limit tracking
      lastValidationTime.current = Date.now();
      validationCount.current++;

      // Validate ownership server-side via RLS
      const { data, error } = await supabase
        .from('children')
        .select('id')
        .eq('id', storedChildId)
        .eq('parent_id', user.id)
        .single();

      if (error || !data) {
        // Invalid child ID - clear it
        localStorage.removeItem('selectedChildId');
        setChildId(null);
        cachedValidChild.current = null;
        navigate('/');
      } else {
        setChildId(data.id);
        cachedValidChild.current = data.id;
      }
      
      setIsValidating(false);
    };

    validateChild();
  }, [user, navigate, isRateLimited]);

  /**
   * Select a child with ownership validation
   */
  const selectChild = useCallback(async (newChildId: string): Promise<boolean> => {
    if (!user) return false;

    // Rate limit check
    if (isRateLimited()) {
      console.warn('[useValidatedChild] selectChild rate limited');
      return false;
    }

    // Update rate limit tracking
    lastValidationTime.current = Date.now();
    validationCount.current++;

    // Validate ownership before storing
    const { data, error } = await supabase
      .from('children')
      .select('id')
      .eq('id', newChildId)
      .eq('parent_id', user.id)
      .single();

    if (error || !data) {
      return false;
    }

    localStorage.setItem('selectedChildId', newChildId);
    setChildId(newChildId);
    cachedValidChild.current = newChildId;
    return true;
  }, [user, isRateLimited]);

  /**
   * Clear child selection (logout/switch user)
   */
  const clearChild = useCallback(() => {
    localStorage.removeItem('selectedChildId');
    setChildId(null);
    cachedValidChild.current = null;
  }, []);

  return { childId, isValidating, selectChild, clearChild };
};
