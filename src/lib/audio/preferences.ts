/**
 * Narration Preferences Service
 * 
 * Manages user preferences for text-to-speech narration.
 * Stores preferences in localStorage and provides hooks for React components.
 */

export interface NarrationPreferences {
  autoPlay: boolean;
  rate: number; // 0.5 - 2.0
  volume: number; // 0 - 1
  voiceName: string | null;
  enabled: boolean;
}

const STORAGE_KEY = 'odyssey_narration_preferences';

const DEFAULT_PREFERENCES: NarrationPreferences = {
  autoPlay: false,
  rate: 1.0,
  volume: 1.0,
  voiceName: null,
  enabled: true,
};

/**
 * Load narration preferences from localStorage
 */
export function loadNarrationPreferences(childId?: string): NarrationPreferences {
  try {
    const key = childId ? `${STORAGE_KEY}_${childId}` : STORAGE_KEY;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load narration preferences:', error);
  }
  
  return DEFAULT_PREFERENCES;
}

/**
 * Save narration preferences to localStorage
 */
export function saveNarrationPreferences(
  preferences: Partial<NarrationPreferences>,
  childId?: string
): void {
  try {
    const key = childId ? `${STORAGE_KEY}_${childId}` : STORAGE_KEY;
    const current = loadNarrationPreferences(childId);
    const updated = { ...current, ...preferences };
    
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save narration preferences:', error);
  }
}

/**
 * Reset narration preferences to defaults
 */
export function resetNarrationPreferences(childId?: string): void {
  try {
    const key = childId ? `${STORAGE_KEY}_${childId}` : STORAGE_KEY;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to reset narration preferences:', error);
  }
}

/**
 * Check if narration feature is enabled
 */
export function isNarrationEnabled(childId?: string): boolean {
  const preferences = loadNarrationPreferences(childId);
  return preferences.enabled;
}

/**
 * Toggle narration feature on/off
 */
export function toggleNarration(childId?: string): boolean {
  const preferences = loadNarrationPreferences(childId);
  const newEnabled = !preferences.enabled;
  
  saveNarrationPreferences({ enabled: newEnabled }, childId);
  
  return newEnabled;
}
