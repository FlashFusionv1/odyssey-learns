import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Zap, RefreshCw, Loader2, Target, BookOpen } from 'lucide-react';
import { useLearningProfile } from '@/hooks/useLearningProfile';
import { 
  SUBJECT_LABELS, 
  LEARNING_SPEED_LABELS, 
  IMPROVEMENT_TREND_LABELS,
  SubjectArea 
} from '@/types/adaptive';
import { cn } from '@/lib/utils';

interface LearningProfileCardProps {
  childId: string;
  childName?: string;
  compact?: boolean;
  className?: string;
}

const trendColors = {
  declining: 'text-destructive',
  stable: 'text-muted-foreground',
  improving: 'text-success',
  accelerating: 'text-primary',
};

const trendIcons = {
  declining: '📉',
  stable: '➡️',
  improving: '📈',
  accelerating: '🚀',
};

export function LearningProfileCard({ childId, childName, compact = false, className }: LearningProfileCardProps) {
  const { 
    profile, 
    topStrengths, 
    topWeaknesses, 
    overallMastery,
    isLoading, 
    isAnalyzing,
    needsRefresh,
    refreshProfile 
  } = useLearningProfile(childId);

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Learning Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Learning Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {childName ? `${childName}'s` : 'Your'} learning profile is being created...
            </p>
            <Button onClick={refreshProfile} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" /> Create Profile</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-semibold">Learning Profile</span>
            </div>
            <Badge variant="outline" className={cn(trendColors[profile.improvementTrend])}>
              {trendIcons[profile.improvementTrend]} {IMPROVEMENT_TREND_LABELS[profile.improvementTrend]}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Overall Mastery</span>
                <span className="font-medium">{overallMastery}%</span>
              </div>
              <Progress value={overallMastery} className="h-2" />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Learning Speed</span>
              <span className="font-medium">{LEARNING_SPEED_LABELS[profile.learningSpeed]}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weekly Lessons</span>
              <span className="font-medium">{profile.weeklyLessonVelocity.toFixed(1)}/week</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            {childName ? `${childName}'s Learning Profile` : 'Learning Profile'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {needsRefresh && (
              <Badge variant="outline" className="text-xs">Needs Update</Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={refreshProfile}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{profile.totalLessonsCompleted}</p>
            <p className="text-xs text-muted-foreground">Lessons Done</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Target className="w-5 h-5 mx-auto mb-1 text-secondary" />
            <p className="text-2xl font-bold">{Math.round(profile.averageQuizScore)}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Zap className="w-5 h-5 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold">{profile.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <TrendingUp className={cn("w-5 h-5 mx-auto mb-1", trendColors[profile.improvementTrend])} />
            <p className="text-lg font-bold">{trendIcons[profile.improvementTrend]}</p>
            <p className="text-xs text-muted-foreground">{IMPROVEMENT_TREND_LABELS[profile.improvementTrend]}</p>
          </div>
        </div>

        {/* Strengths */}
        {topStrengths.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <span className="text-success">💪</span> Strengths
            </h4>
            <div className="flex flex-wrap gap-2">
              {topStrengths.map((strength, idx) => (
                <Badge key={idx} variant="secondary" className="bg-success/10 text-success">
                  {SUBJECT_LABELS[strength.subject as SubjectArea] || strength.subject}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Areas to Improve */}
        {topWeaknesses.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <span className="text-warning">🎯</span> Focus Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {topWeaknesses.map((weakness, idx) => (
                <Badge key={idx} variant="secondary" className="bg-warning/10 text-warning">
                  {SUBJECT_LABELS[weakness.subject as SubjectArea] || weakness.subject}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Subjects */}
        {profile.preferredSubjects.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <span>⭐</span> Favorite Subjects
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.preferredSubjects.map((subject, idx) => (
                <Badge key={idx} variant="outline">
                  {SUBJECT_LABELS[subject as SubjectArea] || subject}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
