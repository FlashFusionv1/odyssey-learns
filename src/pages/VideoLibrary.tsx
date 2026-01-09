import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { VideoLessonCard } from '@/components/video/VideoLessonCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Search, Filter, Play, Clock, Star, TrendingUp } from 'lucide-react';

interface VideoLesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  subject: string;
  grade_level: number;
  difficulty: string | null;
  view_count: number | null;
  is_active: boolean | null;
}

interface WatchProgress {
  video_id: string;
  completion_percentage: number;
}

const SUBJECTS = [
  { value: 'all', label: 'All Subjects' },
  { value: 'Math', label: 'Math' },
  { value: 'Reading', label: 'Reading' },
  { value: 'Science', label: 'Science' },
  { value: 'Social Studies', label: 'Social Studies' },
  { value: 'Emotional Intelligence', label: 'Emotional Intelligence' },
  { value: 'Life Skills', label: 'Life Skills' },
];

const GRADE_LEVELS = [
  { value: 'all', label: 'All Grades' },
  { value: '0', label: 'Kindergarten' },
  { value: '1', label: 'Grade 1' },
  { value: '2', label: 'Grade 2' },
  { value: '3', label: 'Grade 3' },
  { value: '4', label: 'Grade 4' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
];

export default function VideoLibrary() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [watchProgress, setWatchProgress] = useState<Map<string, number>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [childId, setChildId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    loadChildAndVideos();
  }, [user, authLoading]);

  const loadChildAndVideos = async () => {
    if (!user) return;

    try {
      // Get current child ID from session storage
      const storedChildId = sessionStorage.getItem('currentChildId');
      if (storedChildId) {
        setChildId(storedChildId);
      }

      // Load video lessons
      const { data: videosData, error: videosError } = await supabase
        .from('video_lessons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;
      setVideos((videosData as unknown as VideoLesson[]) || []);

      // Load watch progress if we have a child ID
      if (storedChildId) {
        const { data: progressData } = await supabase
          .from('video_watch_progress')
          .select('video_id, completion_percentage')
          .eq('child_id', storedChildId);

        if (progressData) {
          const progressMap = new Map<string, number>();
          (progressData as WatchProgress[]).forEach(p => {
            progressMap.set(p.video_id, p.completion_percentage);
          });
          setWatchProgress(progressMap);
        }
      }
    } catch (err) {
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || video.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'all' || video.grade_level.toString() === selectedGrade;

    if (activeTab === 'in-progress') {
      const progress = watchProgress.get(video.id) || 0;
      return matchesSearch && matchesSubject && matchesGrade && progress > 0 && progress < 100;
    }
    if (activeTab === 'completed') {
      const progress = watchProgress.get(video.id) || 0;
      return matchesSearch && matchesSubject && matchesGrade && progress >= 100;
    }

    return matchesSearch && matchesSubject && matchesGrade;
  });

  const stats = {
    total: videos.length,
    inProgress: videos.filter(v => {
      const p = watchProgress.get(v.id) || 0;
      return p > 0 && p < 100;
    }).length,
    completed: videos.filter(v => (watchProgress.get(v.id) || 0) >= 100).length,
    totalWatchTime: Math.round(
      videos.reduce((acc, v) => {
        const progress = watchProgress.get(v.id) || 0;
        return acc + ((v.duration_seconds || 0) * progress / 100);
      }, 0) / 60
    ),
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Video Library</h1>
              <p className="text-muted-foreground mt-1">
                Watch educational videos and track your progress
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Videos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalWatchTime}</p>
                  <p className="text-sm text-muted-foreground">Min Watched</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_LEVELS.map(g => (
                <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Videos</TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress
              {stats.inProgress > 0 && (
                <Badge variant="secondary" className="ml-2">{stats.inProgress}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {stats.completed > 0 && (
                <Badge variant="secondary" className="ml-2">{stats.completed}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Video Grid */}
        {filteredVideos.length === 0 ? (
          <Card className="p-12 text-center">
            <Play className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedSubject !== 'all' || selectedGrade !== 'all'
                ? 'Try adjusting your filters'
                : 'Check back soon for new video content!'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map(video => (
              <VideoLessonCard
                key={video.id}
                id={video.id}
                title={video.title}
                description={video.description || undefined}
                thumbnailUrl={video.thumbnail_url || undefined}
                duration={video.duration_seconds || 0}
                subject={video.subject}
                gradeLevel={video.grade_level}
                viewCount={video.view_count || 0}
                watchProgress={watchProgress.get(video.id) || 0}
                isCompleted={(watchProgress.get(video.id) || 0) >= 100}
                onPlay={() => navigate(`/video/${video.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
