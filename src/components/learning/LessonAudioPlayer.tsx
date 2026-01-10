/**
 * Lesson Audio Player Component
 * 
 * Provides a user-friendly interface for text-to-speech narration
 * with playback controls, speed adjustment, and visual feedback.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNarration, useAvailableVoices } from '@/hooks/useNarration';
import { useToast } from '@/hooks/use-toast';
import { loadNarrationPreferences } from '@/lib/audio/preferences';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Gauge,
  Mic2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonAudioPlayerProps {
  text: string;
  className?: string;
  onComplete?: () => void;
  compact?: boolean;
  childId?: string; // For storing per-child preferences
}

export function LessonAudioPlayer({
  text,
  className,
  onComplete,
  compact = false,
  childId,
}: LessonAudioPlayerProps) {
  const { toast } = useToast();
  const [state, controls] = useNarration({ onComplete, childId });
  const { voices, loading: voicesLoading } = useAvailableVoices();
  
  // Load preferences
  const preferences = loadNarrationPreferences(childId);
  
  const [rate, setRate] = useState(preferences.rate);
  const [volume, setVolume] = useState(preferences.volume);
  const [muted, setMuted] = useState(false);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Show error toast if narration fails
  useEffect(() => {
    if (state.error) {
      toast({
        title: 'Narration Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state.error, toast]);

  // Initialize narration when voices are loaded
  useEffect(() => {
    if (voices.length > 0 && !isInitialized) {
      // Try to find the saved voice preference
      let voiceIndex = 0;
      if (preferences.voiceName) {
        const savedVoiceIndex = voices.findIndex(
          v => v.name === preferences.voiceName
        );
        if (savedVoiceIndex !== -1) {
          voiceIndex = savedVoiceIndex;
        }
      } else {
        // Find a good English voice
        const englishVoiceIndex = voices.findIndex(
          v => v.lang.startsWith('en') && v.localService
        );
        if (englishVoiceIndex !== -1) {
          voiceIndex = englishVoiceIndex;
        }
      }
      
      setSelectedVoiceIndex(voiceIndex);
      controls.setVoice(voices[voiceIndex]);
      setIsInitialized(true);
    }
  }, [voices, isInitialized, controls, preferences.voiceName]);

  // Handle play/pause toggle
  const handlePlayPause = async () => {
    if (state.isPlaying) {
      controls.pause();
    } else if (state.isPaused) {
      controls.resume();
    } else {
      await controls.start(text);
    }
  };

  // Handle stop
  const handleStop = () => {
    controls.stop();
  };

  // Handle rate change
  const handleRateChange = (value: number[]) => {
    const newRate = value[0];
    setRate(newRate);
    controls.setRate(newRate);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    controls.setVolume(newVolume);
    if (newVolume > 0) {
      setMuted(false);
    }
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (muted) {
      setMuted(false);
      controls.setVolume(volume);
    } else {
      setMuted(true);
      controls.setVolume(0);
    }
  };

  // Handle voice change
  const handleVoiceChange = (value: string) => {
    const index = parseInt(value);
    setSelectedVoiceIndex(index);
    controls.setVoice(voices[index]);
  };

  // Don't show if not supported
  if (!state.isSupported) {
    return null;
  }

  // Compact view for mobile or space-constrained areas
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayPause}
          disabled={state.isLoading || voicesLoading}
          aria-label={state.isPlaying ? 'Pause narration' : 'Play narration'}
        >
          {state.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : state.isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        {state.isPlaying && (
          <span className="text-sm text-muted-foreground">
            Narrating...
          </span>
        )}
      </div>
    );
  }

  // Full player view
  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <Mic2 className="w-4 h-4 text-primary" />
          <span>Lesson Narration</span>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="lg"
            onClick={handlePlayPause}
            disabled={state.isLoading || voicesLoading}
            aria-label={state.isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {state.isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : state.isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                {state.isPaused ? 'Resume' : 'Play'}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleStop}
            disabled={!state.isPlaying && !state.isPaused}
            aria-label="Stop narration"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop
          </Button>

          {/* Progress indicator */}
          {state.totalLength > 0 && (
            <div className="flex-1 ml-4">
              <div className="text-xs text-muted-foreground mb-1">
                Section {state.currentPosition} of {state.totalLength}
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{
                    width: `${(state.currentPosition / state.totalLength) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Advanced Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Speed: {rate.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[rate]}
              onValueChange={handleRateChange}
              min={0.5}
              max={2.0}
              step={0.1}
              disabled={state.isLoading}
              aria-label="Playback speed"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMuteToggle}
                className="h-auto p-0"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                Volume: {Math.round(volume * 100)}%
              </span>
            </div>
            <Slider
              value={[muted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.05}
              disabled={state.isLoading}
              aria-label="Volume"
            />
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Voice</div>
            <Select
              value={selectedVoiceIndex.toString()}
              onValueChange={handleVoiceChange}
              disabled={voicesLoading || state.isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voices
                  .filter(v => v.lang.startsWith('en'))
                  .map((voice, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground">
          Listen to the lesson being read aloud. Adjust speed and voice to your
          preference.
        </p>
      </div>
    </Card>
  );
}
