import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, X, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useNavigate } from 'react-router-dom';
import { SUBJECT_LABELS, RECOMMENDATION_REASON_LABELS, SubjectArea, RecommendationReason } from '@/types/adaptive';
import { cn } from '@/lib/utils';

interface RecommendedLessonsProps {
  childId: string;
  gradeLevel?: number;
  compact?: boolean;
  className?: string;
}

const subjectColors: Record<string, string> = {
  math: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  reading: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  science: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  social_studies: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  emotional_intelligence: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  life_skills: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  art: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  music: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

export function RecommendedLessons({ childId, gradeLevel, compact = false, className }: RecommendedLessonsProps) {
  const navigate = useNavigate();
  const { 
    recommendations, 
    isLoading, 
    isGenerating,
    generateRecommendations,
    dismissRecommendation,
    hasRecommendations 
  } = useRecommendations(childId, { count: compact ? 3 : 5 });

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasRecommendations) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              No recommendations yet. Complete some lessons to get personalized suggestions!
            </p>
            <Button 
              onClick={generateRecommendations} 
              disabled={isGenerating}
              variant="outline"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" /> Generate Recommendations</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended For You
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={generateRecommendations}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/lesson/${rec.lessonId}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", subjectColors[rec.subject] || '')}
                  >
                    {SUBJECT_LABELS[rec.subject as SubjectArea] || rec.subject}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {rec.predictedTimeMinutes} min
                  </span>
                </div>
                <h4 className="font-medium truncate">{rec.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {rec.reasonText || RECOMMENDATION_REASON_LABELS[rec.reason as RecommendationReason]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissRecommendation(rec.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
