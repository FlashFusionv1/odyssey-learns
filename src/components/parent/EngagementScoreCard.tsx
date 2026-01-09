import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Activity, BookOpen, Brain, Clock, Users } from 'lucide-react';
import { useEngagementScore } from '@/hooks/useEngagementScore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EngagementScoreCardProps {
  childId: string;
  childName: string;
}

export function EngagementScoreCard({ childId, childName }: EngagementScoreCardProps) {
  const { metrics, loading } = useEngagementScore(childId);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No engagement data yet</p>
        </CardContent>
      </Card>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-success text-success-foreground';
      case 'high': return 'bg-primary text-primary-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const factors = [
    { key: 'lessonsCompleted', label: 'Lessons', icon: BookOpen, value: metrics.factors.lessonsCompleted },
    { key: 'quizPerformance', label: 'Quiz Scores', icon: Brain, value: metrics.factors.quizPerformance },
    { key: 'consistency', label: 'Consistency', icon: Activity, value: metrics.factors.consistency },
    { key: 'timeSpent', label: 'Time Spent', icon: Clock, value: metrics.factors.timeSpent },
    { key: 'socialActivity', label: 'Social', icon: Users, value: metrics.factors.socialActivity },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{childName}'s Engagement</CardTitle>
            <CardDescription>30-day learning activity score</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(metrics.trend)}
            <Badge className={getLevelColor(metrics.level)}>
              {metrics.level.charAt(0).toUpperCase() + metrics.level.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${metrics.score * 2.2} 220`}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{metrics.score}</span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm text-muted-foreground">
              {metrics.score >= 80 ? 'Excellent engagement! Keep it up! 🌟' :
               metrics.score >= 60 ? 'Great progress! Almost there! 💪' :
               metrics.score >= 40 ? 'Good start! Keep learning! 📚' :
               'Let\'s get more active! 🚀'}
            </p>
          </div>
        </div>

        {/* Factor Breakdown */}
        <div className="space-y-2">
          {factors.map(factor => (
            <div key={factor.key} className="flex items-center gap-3">
              <factor.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground w-24">{factor.label}</span>
              <Progress value={factor.value} className="flex-1 h-2" />
              <span className="text-sm font-medium w-10 text-right">{factor.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
