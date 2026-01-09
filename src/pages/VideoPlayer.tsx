import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { VideoPlayer as VideoPlayerComponent } from '@/components/video/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BookOpen, Clock, Eye, ThumbsUp, Share2, BookmarkPlus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VideoLesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_provider: string | null;
  video_id: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  subject: string;
  grade_level: number;
  difficulty: string | null;
  view_count: number | null;
  chapter_markers: any[];
  quiz_timestamps: any[];
  transcript: string | null;
  lesson_id: string | null;
}

interface RelatedVideo {
  id: string;
  title: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  subject: string;
}

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<VideoLesson | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [childId, setChildId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (id) {
      loadVideo();
    }
  }, [id, user, authLoading]);

  const loadVideo = async () => {
    if (!id) return;

    try {
      // Get current child ID
      const storedChildId = sessionStorage.getItem('currentChildId');
      if (storedChildId) {
        setChildId(storedChildId);
      }

      // Load video details
      const { data: videoData, error: videoError } = await supabase
        .from('video_lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (videoError) throw videoError;
      setVideo(videoData as unknown as VideoLesson);

      // Increment view count directly
      await supabase
        .from('video_lessons')
        .update({ view_count: ((videoData as any).view_count || 0) + 1 })
        .eq('id', id);

      // Load related videos (same subject or grade)
      if (videoData) {
        const { data: relatedData } = await supabase
          .from('video_lessons')
          .select('id, title, thumbnail_url, duration_seconds, subject')
          .neq('id', id)
          .or(`subject.eq.${videoData.subject},grade_level.eq.${videoData.grade_level}`)
          .eq('is_active', true)
          .limit(4);

        if (relatedData) {
          setRelatedVideos(relatedData as unknown as RelatedVideo[]);
        }
      }

      // Check completion status
      if (storedChildId) {
        const { data: progressData } = await supabase
          .from('video_watch_progress')
          .select('completion_percentage')
          .eq('video_id', id)
          .eq('child_id', storedChildId)
          .single();

        if (progressData && (progressData as any).completion_percentage >= 90) {
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.error('Error loading video:', err);
      toast.error('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = async () => {
    setIsCompleted(true);
    toast.success('Video completed! 🎉 Great job!');

    // Award points if linked to a lesson
    if (video?.lesson_id && childId) {
      try {
        // Get current points first
        const { data: childData } = await supabase
          .from('children')
          .select('total_points')
          .eq('id', childId)
          .single();

        const currentPoints = (childData as any)?.total_points || 0;
        
        await supabase
          .from('children')
          .update({ total_points: currentPoints + 25 })
          .eq('id', childId);
      } catch (err) {
        console.error('Error awarding points:', err);
      }
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Video not found</h2>
        <Button onClick={() => navigate('/videos')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Video Library
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/videos')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <VideoPlayerComponent
              videoId={video.id}
              childId={childId || ''}
              videoUrl={video.video_url}
              title={video.title}
              duration={video.duration_seconds || 0}
              chapters={video.chapter_markers || []}
              quizTimestamps={video.quiz_timestamps || []}
              onComplete={handleVideoComplete}
            />

            {/* Video Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{video.subject}</Badge>
                      <Badge variant="outline">
                        Grade {video.grade_level === 0 ? 'K' : video.grade_level}
                      </Badge>
                      {video.difficulty && (
                        <Badge variant="outline">{video.difficulty}</Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" /> Completed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{video.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {(video.view_count || 0).toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(video.duration_seconds)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <BookmarkPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {video.description && (
                <CardContent>
                  <Separator className="mb-4" />
                  <p className="text-muted-foreground">{video.description}</p>
                </CardContent>
              )}
            </Card>

            {/* Transcript (if available) */}
            {video.transcript && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {video.transcript}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Lesson */}
            {video.lesson_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Related Lesson
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/lessons/${video.lesson_id}`)}
                  >
                    View Lesson Content
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Videos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedVideos.map(related => (
                    <div
                      key={related.id}
                      className="flex gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors -mx-2"
                      onClick={() => navigate(`/video/${related.id}`)}
                    >
                      <div className="w-32 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                        {related.thumbnail_url ? (
                          <img
                            src={related.thumbnail_url}
                            alt={related.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <BookOpen className="w-6 h-6 text-primary/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{related.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {related.subject}
                          </Badge>
                          <span>{formatDuration(related.duration_seconds)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
