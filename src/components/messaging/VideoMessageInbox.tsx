/**
 * Video Message Inbox Component
 * 
 * Displays video messages for children to watch
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVideoMessages } from '@/hooks/useVideoMessages';
import { VideoMessage } from '@/lib/messaging/videoMessage';
import { formatDistanceToNow } from 'date-fns';
import {
  Video,
  Play,
  Mail,
  MailOpen,
  Trash2,
  Loader2,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoMessageInboxProps {
  childId: string;
  className?: string;
  compact?: boolean;
}

export function VideoMessageInbox({
  childId,
  className,
  compact = false,
}: VideoMessageInboxProps) {
  const {
    messages,
    isLoadingMessages,
    unreadCount,
    markAsRead,
    deleteMessage,
    getVideoUrl,
    isMarkingRead,
    isDeleting,
  } = useVideoMessages({ childId, enableRealtime: true });

  const [selectedMessage, setSelectedMessage] = useState<VideoMessage | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const handlePlayMessage = async (message: VideoMessage) => {
    setSelectedMessage(message);
    setIsLoadingVideo(true);

    try {
      const url = await getVideoUrl(message.videoUrl);
      setVideoUrl(url);

      // Mark as read if unread
      if (message.status === 'unread') {
        await markAsRead(message.id);
      }
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleClosePlayer = () => {
    setSelectedMessage(null);
    setVideoUrl(null);
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoadingMessages) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex flex-col items-center gap-4 text-center py-8">
          <Heart className="w-16 h-16 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-lg">No Messages Yet</h3>
            <p className="text-sm text-muted-foreground">
              When your parents send you video messages, they'll appear here!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Compact view for dashboard widgets
  if (compact) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Messages from Parents
            </span>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-primary">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {messages.slice(0, 3).map((message) => (
              <button
                key={message.id}
                onClick={() => handlePlayMessage(message)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                  message.status === 'unread'
                    ? 'bg-primary/10 hover:bg-primary/20'
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-medium truncate',
                    message.status === 'unread' && 'text-primary'
                  )}>
                    {message.title || 'Video Message'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {message.status === 'unread' && (
                  <Badge variant="secondary" className="shrink-0">New</Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full inbox view
  return (
    <>
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Video Messages
            </span>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-primary">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border transition-colors',
                    message.status === 'unread'
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-card'
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                    message.status === 'unread' ? 'bg-primary/20' : 'bg-muted'
                  )}>
                    {message.status === 'unread' ? (
                      <Mail className="w-6 h-6 text-primary" />
                    ) : (
                      <MailOpen className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={cn(
                          'font-medium',
                          message.status === 'unread' && 'text-primary'
                        )}>
                          {message.title || 'Video Message'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          {message.durationSeconds && (
                            <span> • {formatDuration(message.durationSeconds)}</span>
                          )}
                        </p>
                      </div>
                      {message.status === 'unread' && (
                        <Badge>New</Badge>
                      )}
                    </div>

                    {message.messageText && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {message.messageText}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handlePlayMessage(message)}
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Watch
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(message.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={handleClosePlayer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              {selectedMessage?.title || 'Message from Parent'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isLoadingVideo ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : null}
            </div>

            {/* Message text */}
            {selectedMessage?.messageText && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{selectedMessage.messageText}</p>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground text-center">
              Sent {selectedMessage && formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
