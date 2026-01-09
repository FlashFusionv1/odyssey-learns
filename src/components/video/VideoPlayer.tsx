import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Subtitles, 
  ThumbsUp, BookmarkPlus, Share2, RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChapterMarker {
  time: number;
  title: string;
  description?: string;
}

interface QuizTimestamp {
  time: number;
  question: string;
  options: string[];
  correct_index: number;
}

interface VideoPlayerProps {
  videoId: string;
  childId: string;
  videoUrl: string;
  title: string;
  duration: number;
  chapters?: ChapterMarker[];
  quizTimestamps?: QuizTimestamp[];
  onComplete?: () => void;
  autoPlay?: boolean;
}

export function VideoPlayer({
  videoId,
  childId,
  videoUrl,
  title,
  duration,
  chapters = [],
  quizTimestamps = [],
  onComplete,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [watchedTime, setWatchedTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizTimestamp | null>(null);
  const [answeredQuizzes, setAnsweredQuizzes] = useState<Set<number>>(new Set());
  const [playbackRate, setPlaybackRate] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate completion percentage
  const completionPercentage = duration > 0 ? (watchedTime / duration) * 100 : 0;

  // Save progress to database
  const saveProgress = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const progress = {
        video_id: videoId,
        child_id: childId,
        watch_position_seconds: Math.floor(currentTime),
        total_watch_time_seconds: Math.floor(watchedTime),
        completion_percentage: Math.min(completionPercentage, 100),
        last_watched_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('video_watch_progress')
        .upsert(progress, { onConflict: 'video_id,child_id' });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [videoId, childId, currentTime, watchedTime, completionPercentage]);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle seek
  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle playback rate
  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  // Check for quiz timestamps
  const checkQuizTimestamps = useCallback((time: number) => {
    for (const quiz of quizTimestamps) {
      if (
        Math.abs(time - quiz.time) < 0.5 &&
        !answeredQuizzes.has(quiz.time)
      ) {
        setCurrentQuiz(quiz);
        setShowQuiz(true);
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
        break;
      }
    }
  }, [quizTimestamps, answeredQuizzes]);

  // Handle quiz answer
  const handleQuizAnswer = (answerIndex: number) => {
    if (!currentQuiz) return;

    const isCorrect = answerIndex === currentQuiz.correct_index;
    if (isCorrect) {
      toast.success('Correct! Great job! 🎉');
    } else {
      toast.error('Not quite. Keep watching to learn more!');
    }

    setAnsweredQuizzes(prev => new Set([...prev, currentQuiz.time]));
    setShowQuiz(false);
    setCurrentQuiz(null);

    // Resume video
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      checkQuizTimestamps(video.currentTime);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      saveProgress();
      if (completionPercentage >= 90 && onComplete) {
        onComplete();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('ended', handleEnded);
    };
  }, [checkQuizTimestamps, completionPercentage, onComplete, saveProgress]);

  // Track watched time
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setWatchedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Save progress periodically
  useEffect(() => {
    const saveInterval = setInterval(saveProgress, 30000);
    return () => clearInterval(saveInterval);
  }, [saveProgress]);

  // Hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Get current chapter
  const getCurrentChapter = () => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].time) {
        return chapters[i];
      }
    }
    return null;
  };

  const currentChapter = getCurrentChapter();

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        autoPlay={autoPlay}
        onClick={togglePlay}
      />

      {/* Quiz Overlay */}
      {showQuiz && currentQuiz && (
        <div className="absolute inset-0 bg-background/95 flex items-center justify-center p-6 z-20">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <Badge className="mb-2">Quick Check!</Badge>
                <h3 className="text-lg font-semibold">{currentQuiz.question}</h3>
              </div>
              <div className="space-y-2">
                {currentQuiz.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleQuizAnswer(index)}
                  >
                    <span className="mr-3 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white">
          <div>
            <h3 className="font-semibold">{title}</h3>
            {currentChapter && (
              <p className="text-sm text-white/70">{currentChapter.title}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20">
              {Math.round(completionPercentage)}% watched
            </Badge>
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play className="w-10 h-10 text-white ml-1" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <div className="relative h-1 bg-white/30 rounded-full cursor-pointer group/progress">
            {/* Buffered */}
            <div
              className="absolute h-full bg-white/50 rounded-full"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            {/* Progress */}
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="absolute inset-0"
            />
            {/* Chapter Markers */}
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className="absolute top-0 w-1 h-full bg-primary"
                style={{ left: `${(chapter.time / duration) * 100}%` }}
                title={chapter.title}
              />
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => skip(-10)}>
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => skip(10)}>
                <SkipForward className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2 ml-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <span className="text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={changePlaybackRate}
              >
                {playbackRate}x
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Subtitles className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}