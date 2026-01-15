/**
 * React Hook for Video Messages
 * 
 * Provides easy integration of video messaging in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VideoMessageService, VideoMessage, RecordingState } from '@/lib/messaging/videoMessage';

interface UseVideoMessagesOptions {
  childId?: string;
  parentId?: string;
  includeRead?: boolean;
  enableRealtime?: boolean;
}

export function useVideoMessages(options: UseVideoMessagesOptions = {}) {
  const queryClient = useQueryClient();
  const serviceRef = useRef<VideoMessageService | null>(null);

  // Initialize service
  useEffect(() => {
    serviceRef.current = new VideoMessageService();
    return () => {
      serviceRef.current?.cleanup();
    };
  }, []);

  // Fetch messages for a child
  const messagesQuery = useQuery({
    queryKey: ['video-messages', options.childId, options.includeRead],
    queryFn: async () => {
      if (!options.childId || !serviceRef.current) return [];
      return serviceRef.current.getMessagesForChild(options.childId, options.includeRead ?? true);
    },
    enabled: !!options.childId,
    staleTime: 30000,
  });

  // Fetch messages sent by parent
  const sentMessagesQuery = useQuery({
    queryKey: ['sent-video-messages', options.parentId],
    queryFn: async () => {
      if (!options.parentId || !serviceRef.current) return [];
      return serviceRef.current.getMessagesByParent(options.parentId);
    },
    enabled: !!options.parentId,
    staleTime: 30000,
  });

  // Unread count
  const unreadCountQuery = useQuery({
    queryKey: ['video-messages-unread', options.childId],
    queryFn: async () => {
      if (!options.childId || !serviceRef.current) return 0;
      return serviceRef.current.getUnreadCount(options.childId);
    },
    enabled: !!options.childId,
    staleTime: 10000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!serviceRef.current) throw new Error('Service not initialized');
      await serviceRef.current.markAsRead(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-messages'] });
      queryClient.invalidateQueries({ queryKey: ['video-messages-unread'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!serviceRef.current) throw new Error('Service not initialized');
      await serviceRef.current.deleteMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sent-video-messages'] });
    },
  });

  // Get video URL
  const getVideoUrl = useCallback(async (videoPath: string) => {
    if (!serviceRef.current) throw new Error('Service not initialized');
    return serviceRef.current.getVideoUrl(videoPath);
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!options.enableRealtime || !options.childId) return;

    const channel = supabase
      .channel(`video-messages:${options.childId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_messages',
          filter: `child_id=eq.${options.childId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['video-messages'] });
          queryClient.invalidateQueries({ queryKey: ['video-messages-unread'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.childId, options.enableRealtime, queryClient]);

  return {
    // Child messages
    messages: messagesQuery.data || [],
    isLoadingMessages: messagesQuery.isLoading,
    messagesError: messagesQuery.error,
    refetchMessages: messagesQuery.refetch,

    // Parent's sent messages
    sentMessages: sentMessagesQuery.data || [],
    isLoadingSentMessages: sentMessagesQuery.isLoading,

    // Unread count
    unreadCount: unreadCountQuery.data || 0,

    // Actions
    markAsRead: markAsReadMutation.mutateAsync,
    deleteMessage: deleteMutation.mutateAsync,
    getVideoUrl,

    // Loading states
    isMarkingRead: markAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for video recording
 */
export function useVideoRecorder() {
  const serviceRef = useRef<VideoMessageService | null>(null);
  const queryClient = useQueryClient();

  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPreviewing: false,
    duration: 0,
    blob: null,
    previewUrl: null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize service
  useEffect(() => {
    serviceRef.current = new VideoMessageService();
    serviceRef.current.onStateChangeCallback((newState) => {
      setState(prev => ({ ...prev, ...newState }));
    });

    return () => {
      serviceRef.current?.cleanup();
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      await serviceRef.current?.startRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(() => {
    serviceRef.current?.stopRecording();
  }, []);

  const discardRecording = useCallback(() => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    serviceRef.current?.discardRecording();
    setState({
      isRecording: false,
      isPreviewing: false,
      duration: 0,
      blob: null,
      previewUrl: null,
    });
  }, [state.previewUrl]);

  const uploadRecording = useCallback(async (
    parentId: string,
    childId: string,
    title?: string,
    messageText?: string
  ) => {
    if (!state.blob) {
      throw new Error('No recording to upload');
    }

    setIsUploading(true);
    setError(null);

    try {
      const message = await serviceRef.current?.uploadMessage(
        state.blob,
        parentId,
        childId,
        title,
        messageText
      );

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['video-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sent-video-messages'] });

      // Clear state
      discardRecording();

      return message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [state.blob, queryClient, discardRecording]);

  const getStream = useCallback(() => {
    return serviceRef.current?.getStream() || null;
  }, []);

  return {
    ...state,
    isUploading,
    error,
    isSupported: VideoMessageService.isSupported(),
    startRecording,
    stopRecording,
    discardRecording,
    uploadRecording,
    getStream,
  };
}
