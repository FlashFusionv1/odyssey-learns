/**
 * Video Message Service
 * 
 * Handles video recording, upload, and playback for parent-child messaging
 */

import { supabase } from '@/integrations/supabase/client';

export interface VideoMessage {
  id: string;
  parentId: string;
  childId: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  title: string | null;
  messageText: string | null;
  status: 'unread' | 'read' | 'deleted';
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPreviewing: boolean;
  duration: number;
  blob: Blob | null;
  previewUrl: string | null;
}

const MAX_RECORDING_SECONDS = 60;
const MAX_FILE_SIZE_MB = 50;

export class VideoMessageService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private onStateChange?: (state: Partial<RecordingState>) => void;

  /**
   * Check if video recording is supported
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && MediaRecorder);
  }

  /**
   * Start video recording
   */
  async startRecording(): Promise<void> {
    if (!VideoMessageService.isSupported()) {
      throw new Error('Video recording is not supported in this browser');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: true,
      });

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.chunks = [];
      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const previewUrl = URL.createObjectURL(blob);
        const duration = Math.round((Date.now() - this.recordingStartTime) / 1000);

        this.onStateChange?.({
          isRecording: false,
          isPreviewing: true,
          blob,
          previewUrl,
          duration,
        });
      };

      this.mediaRecorder.start(1000); // Collect data every second

      this.onStateChange?.({
        isRecording: true,
        isPreviewing: false,
        blob: null,
        previewUrl: null,
      });

      // Auto-stop after max duration
      setTimeout(() => {
        if (this.mediaRecorder?.state === 'recording') {
          this.stopRecording();
        }
      }, MAX_RECORDING_SECONDS * 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.stopStream();
  }

  /**
   * Discard the current recording
   */
  discardRecording(): void {
    this.chunks = [];
    this.onStateChange?.({
      isRecording: false,
      isPreviewing: false,
      blob: null,
      previewUrl: null,
      duration: 0,
    });
  }

  /**
   * Stop the media stream
   */
  private stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Upload video message
   */
  async uploadMessage(
    blob: Blob,
    parentId: string,
    childId: string,
    title?: string,
    messageText?: string
  ): Promise<VideoMessage> {
    // Check file size
    const fileSizeMB = blob.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      throw new Error(`Video exceeds maximum size of ${MAX_FILE_SIZE_MB}MB`);
    }

    const fileName = `${parentId}/${crypto.randomUUID()}.webm`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('video-messages')
      .upload(fileName, blob, {
        contentType: 'video/webm',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload video');
    }

    // Get duration from the blob
    const duration = await this.getVideoDuration(blob);

    // Create message record
    const { data, error } = await supabase
      .from('video_messages')
      .insert({
        parent_id: parentId,
        child_id: childId,
        video_url: fileName,
        title: title || null,
        message_text: messageText || null,
        duration_seconds: duration,
        status: 'unread',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save message');
    }

    return this.mapFromDb(data);
  }

  /**
   * Get video duration from blob
   */
  private async getVideoDuration(blob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Get messages for a child
   */
  async getMessagesForChild(childId: string, includeRead = true): Promise<VideoMessage[]> {
    let query = supabase
      .from('video_messages')
      .select('*')
      .eq('child_id', childId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (!includeRead) {
      query = query.eq('status', 'unread');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Get messages sent by a parent
   */
  async getMessagesByParent(parentId: string): Promise<VideoMessage[]> {
    const { data, error } = await supabase
      .from('video_messages')
      .select('*')
      .eq('parent_id', parentId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDb);
  }

  /**
   * Get unread message count for a child
   */
  async getUnreadCount(childId: string): Promise<number> {
    const { count, error } = await supabase
      .from('video_messages')
      .select('*', { count: 'exact', head: true })
      .eq('child_id', childId)
      .eq('status', 'unread');

    if (error) {
      console.error('Error fetching count:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('video_messages')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('video_messages')
      .update({ status: 'deleted' })
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for video playback
   */
  async getVideoUrl(videoPath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('video-messages')
      .createSignedUrl(videoPath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }

    return data.signedUrl;
  }

  /**
   * Set state change callback
   */
  onStateChangeCallback(callback: (state: Partial<RecordingState>) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Get current stream for preview
   */
  getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopRecording();
    this.discardRecording();
  }

  /**
   * Map database row to VideoMessage
   */
  private mapFromDb(row: Record<string, unknown>): VideoMessage {
    return {
      id: row.id as string,
      parentId: row.parent_id as string,
      childId: row.child_id as string,
      videoUrl: row.video_url as string,
      thumbnailUrl: row.thumbnail_url as string | null,
      durationSeconds: row.duration_seconds as number | null,
      title: row.title as string | null,
      messageText: row.message_text as string | null,
      status: row.status as 'unread' | 'read' | 'deleted',
      readAt: row.read_at as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
