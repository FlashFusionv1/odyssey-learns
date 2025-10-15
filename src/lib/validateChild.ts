import { supabase } from "@/integrations/supabase/client";

/**
 * Validates that a child ID belongs to the currently authenticated user
 * This prevents localStorage spoofing attacks
 */
export const validateChildOwnership = async (childId: string | null): Promise<string | null> => {
  if (!childId) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Verify the child exists and belongs to the authenticated user
  const { data, error } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('parent_id', user.id)
    .single();

  if (error || !data) {
    console.warn('Child validation failed:', error?.message || 'Child not found');
    return null;
  }

  return data.id;
};

/**
 * Get the first child for the authenticated user
 * Used as fallback when localStorage is invalid
 */
export const getFirstChild = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('children')
    .select('id')
    .eq('parent_id', user.id)
    .limit(1)
    .single();

  return data?.id || null;
};

/**
 * Safe child selector that validates ownership
 */
export const getSafeChildId = async (): Promise<string | null> => {
  const storedId = localStorage.getItem('selectedChildId');
  
  // First try to validate the stored ID
  const validatedId = await validateChildOwnership(storedId);
  if (validatedId) return validatedId;

  // If invalid, get first child
  const firstChildId = await getFirstChild();
  
  // Update localStorage with valid ID
  if (firstChildId) {
    localStorage.setItem('selectedChildId', firstChildId);
  } else {
    localStorage.removeItem('selectedChildId');
  }

  return firstChildId;
};
