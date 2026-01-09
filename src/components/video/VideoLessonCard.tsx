import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, Eye, BookmarkPlus, Share2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VideoLessonCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration: number;
  subject: string;
  gradeLevel: number;
  viewCount: number;
  watchProgress?: number;
  isCompleted?: boolean;
  onPlay?: () => void;
}

export function VideoLessonCard({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  subject,
  gradeLevel,
  viewCount,
  watchProgress = 0,
  isCompleted = false,
  onPlay,
}: VideoLessonCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (onPlay) {
      onPlay();
    } else {
      navigate(`/video/${id}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden group cursor-pointer transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Play className="w-12 h-12 text-primary/50" />
          </div>
        )}

        {/* Play overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-7 h-7 text-primary ml-1" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-white text-xs font-medium">
          {formatDuration(duration)}
        </div>

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-success text-success-foreground">
              <CheckCircle className="w-3 h-3 mr-1" /> Completed
            </Badge>
          </div>
        )}

        {/* Progress bar */}
        {watchProgress > 0 && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={watchProgress} className="h-1 rounded-none" />
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            {subject}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Grade {gradeLevel === 0 ? 'K' : gradeLevel}
          </Badge>
        </div>
        <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(duration)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); }}>
              <BookmarkPlus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); }}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}