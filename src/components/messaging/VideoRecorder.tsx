/**
 * Video Recorder Component
 * 
 * Allows parents to record and send video messages to their children
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useVideoRecorder } from '@/hooks/useVideoMessages';
import { useToast } from '@/hooks/use-toast';
import {
  Video,
  VideoOff,
  Square,
  Send,
  Trash2,
  RefreshCw,
  Camera,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoRecorderProps {
  parentId: string;
  childId: string;
  childName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const MAX_DURATION = 60;

export function VideoRecorder({
  parentId,
  childId,
  childName,
  onSuccess,
  onCancel,
  className,
}: VideoRecorderProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const {
    isRecording,
    isPreviewing,
    duration,
    blob,
    previewUrl,
    isUploading,
    error,
    isSupported,
    startRecording,
    stopRecording,
    discardRecording,
    uploadRecording,
    getStream,
  } = useVideoRecorder();

  // Show live preview while recording
  useEffect(() => {
    if (isRecording && videoRef.current) {
      const stream = getStream();
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(console.error);
      }
    } else if (isPreviewing && videoRef.current && previewUrl) {
      videoRef.current.srcObject = null;
      videoRef.current.src = previewUrl;
      videoRef.current.muted = false;
    }
  }, [isRecording, isPreviewing, previewUrl, getStream]);

  // Track elapsed time during recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime(prev => Math.min(prev + 1, MAX_DURATION));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: 'Recording Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSend = async () => {
    try {
      await uploadRecording(parentId, childId, title || undefined, messageText || undefined);
      toast({
        title: 'Message Sent! 🎉',
        description: `Your video message has been sent to ${childName}`,
      });
      onSuccess?.();
    } catch {
      // Error is handled in the hook
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <VideoOff className="w-12 h-12 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-lg">Video Not Supported</h3>
            <p className="text-sm text-muted-foreground">
              Your browser doesn't support video recording. Please try a different browser.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Record a Message for {childName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Preview */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {!isRecording && !isPreviewing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Camera className="w-16 h-16 text-muted-foreground" />
              <p className="text-muted-foreground">Press record to start</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              controls={isPreviewing}
            />
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}

          {/* Timer */}
          {isRecording && (
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded">
              {formatTime(elapsedTime)} / {formatTime(MAX_DURATION)}
            </div>
          )}
        </div>

        {/* Progress bar during recording */}
        {isRecording && (
          <Progress value={(elapsedTime / MAX_DURATION) * 100} className="h-2" />
        )}

        {/* Recording Controls */}
        <div className="flex justify-center gap-3">
          {!isRecording && !isPreviewing && (
            <Button size="lg" onClick={startRecording} className="gap-2">
              <Video className="w-5 h-5" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopRecording}
              className="gap-2"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </Button>
          )}

          {isPreviewing && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={discardRecording}
                className="gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Re-record
              </Button>
            </>
          )}
        </div>

        {/* Message Details (shown after recording) */}
        {isPreviewing && blob && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="Add a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a text message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  discardRecording();
                  onCancel?.();
                }}
              >
                <Trash2 className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleSend}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send to {childName}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        {!isRecording && !isPreviewing && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Record up to 60 seconds of encouragement for your child.</p>
            <p className="text-xs mt-1">
              Tip: Good lighting and a quiet environment help!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
