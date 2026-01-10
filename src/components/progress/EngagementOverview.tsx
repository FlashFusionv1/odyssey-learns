import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Flame, 
  Target, 
  Calendar,
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EngagementOverviewProps {
  /** Total lessons completed */
  totalLessons: number;
  /** Total time spent in minutes */
  totalMinutes: number;
  /** Average score percentage */
  averageScore: number;
  /** Current learning streak in days */
  currentStreak: number;
  /** Longest streak achieved */
  longestStreak: number;
  /** Engagement score (0-100) */
  engagementScore: number;
  /** Consistency rate (0-100) */
  consistencyRate: number;
}

interface StatCardProps {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

function StatCard({ icon: Icon, label, value, subValue, color = 'text-primary' }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className={cn('p-2 rounded-lg bg-background', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Displays an overview of engagement metrics with visual indicators
 * Includes engagement score ring, key stats, and streak information
 */
export function EngagementOverview({
  totalLessons,
  totalMinutes,
  averageScore,
  currentStreak,
  longestStreak,
  engagementScore,
  consistencyRate,
}: EngagementOverviewProps) {
  // Format time display
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Determine engagement level
  const engagementLevel = 
    engagementScore >= 80 ? 'Excellent' :
    engagementScore >= 60 ? 'Good' :
    engagementScore >= 40 ? 'Fair' : 'Needs Work';

  const engagementColor = 
    engagementScore >= 80 ? 'text-green-500' :
    engagementScore >= 60 ? 'text-blue-500' :
    engagementScore >= 40 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success" />
          Learning Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Engagement Score Ring */}
          <div className="flex flex-col items-center justify-center lg:w-48 shrink-0">
            <ProgressRing 
              value={engagementScore} 
              size="lg"
            />
            <p className={cn('mt-2 text-lg font-bold', engagementColor)}>
              {engagementLevel}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Engagement Score
            </p>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            <StatCard 
              icon={BookOpen}
              label="Lessons Completed"
              value={totalLessons}
              color="text-primary"
            />
            <StatCard 
              icon={Clock}
              label="Time Learning"
              value={timeDisplay}
              color="text-info"
            />
            <StatCard 
              icon={Trophy}
              label="Average Score"
              value={`${averageScore}%`}
              color="text-success"
            />
            <StatCard 
              icon={Flame}
              label="Current Streak"
              value={`${currentStreak} days`}
              subValue={`Best: ${longestStreak} days`}
              color="text-accent"
            />
            <StatCard 
              icon={Target}
              label="Accuracy Rate"
              value={`${averageScore}%`}
              color="text-secondary"
            />
            <StatCard 
              icon={Calendar}
              label="Consistency"
              value={`${consistencyRate}%`}
              subValue="Last 30 days"
              color="text-warning"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
