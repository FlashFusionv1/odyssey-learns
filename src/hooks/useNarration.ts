/**
 * React Hook for Lesson Narration
 * 
 * Provides easy integration of text-to-speech narration in React components
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { LessonNarrator } from '@/lib/audio/narrator';
import { loadNarrationPreferences, saveNarrationPreferences } from '@/lib/audio/preferences';

interface NarrationState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
  currentPosition: number;
  totalLength: number;
  isSupported: boolean;
}

interface NarrationControls {
  start: (text: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

interface UseNarrationOptions {
  rate?: number;
  volume?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  childId?: string; // For storing per-child preferences
}

export function useNarration(
  options: UseNarrationOptions = {}
): [NarrationState, NarrationControls] {
  const narratorRef = useRef<LessonNarrator | null>(null);
  const [state, setState] = useState<NarrationState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    error: null,
    currentPosition: 0,
    totalLength: 0,
    isSupported: LessonNarrator.isSupported(),
  });

  // Initialize narrator
  useEffect(() => {
    if (!LessonNarrator.isSupported()) {
      setState(prev => ({
        ...prev,
        error: 'Text-to-speech is not supported in this browser',
      }));
      return;
    }

    // Load user preferences
    const preferences = loadNarrationPreferences(options.childId);

    // Initialize narrator with best voice and preferences
    const initNarrator = async () => {
      const voice = await LessonNarrator.getBestVoice('en-US');
      narratorRef.current = new LessonNarrator({
        rate: options.rate ?? preferences.rate,
        volume: options.volume ?? preferences.volume,
        voice,
      });

      // Set up state change callback
      narratorRef.current.onStateChangeCallback((narratorState) => {
        setState(prev => ({
          ...prev,
          isPlaying: narratorState.isPlaying,
          isPaused: narratorState.isPaused,
          currentPosition: narratorState.currentPosition,
          totalLength: narratorState.totalLength,
        }));

        // Call onComplete callback when done
        if (!narratorState.isPlaying && !narratorState.isPaused && 
            narratorState.currentPosition === narratorState.totalLength &&
            options.onComplete) {
          options.onComplete();
        }
      });
    };

    initNarrator();

    // Cleanup on unmount
    return () => {
      if (narratorRef.current) {
        narratorRef.current.stop();
      }
    };
  }, []);

  // Start narration
  const start = useCallback(async (text: string) => {
    if (!narratorRef.current) {
      setState(prev => ({
        ...prev,
        error: 'Narrator not initialized',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      await narratorRef.current.start(text);
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start narration',
      }));
    }
  }, []);

  // Pause narration
  const pause = useCallback(() => {
    if (narratorRef.current) {
      narratorRef.current.pause();
    }
  }, []);

  // Resume narration
  const resume = useCallback(() => {
    if (narratorRef.current) {
      narratorRef.current.resume();
    }
  }, []);

  // Stop narration
  const stop = useCallback(() => {
    if (narratorRef.current) {
      narratorRef.current.stop();
    }
  }, []);

  // Set playback rate
  const setRate = useCallback((rate: number) => {
    if (narratorRef.current) {
      narratorRef.current.setRate(rate);
      // Save preference
      if (options.childId) {
        saveNarrationPreferences({ rate }, options.childId);
      }
    }
  }, [options.childId]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (narratorRef.current) {
      narratorRef.current.setVolume(volume);
      // Save preference
      if (options.childId) {
        saveNarrationPreferences({ volume }, options.childId);
      }
    }
  }, [options.childId]);

  // Set voice
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    if (narratorRef.current) {
      narratorRef.current.setVoice(voice);
      // Save preference
      if (options.childId) {
        saveNarrationPreferences({ voiceName: voice.name }, options.childId);
      }
    }
  }, [options.childId]);

  const controls: NarrationControls = {
    start,
    pause,
    resume,
    stop,
    setRate,
    setVolume,
    setVoice,
  };

  return [state, controls];
}

/**
 * Hook to get available voices
 */
export function useAvailableVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVoices = async () => {
      setLoading(true);
      const availableVoices = await LessonNarrator.getAvailableVoices();
      setVoices(availableVoices);
      setLoading(false);
    };

    loadVoices();
  }, []);

  return { voices, loading };
}
