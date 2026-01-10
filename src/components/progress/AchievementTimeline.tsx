import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Medal, Trophy, Crown, Star } from 'lucide-react';
import { AchievementTimeline as AchievementTimelineData } from '@/hooks/useChildProgressAnalytics';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AchievementTimelineProps {
  /** Recent achievements data from analytics hook */
  achievements: AchievementTimelineData[];
  /** Total number of badges earned */
  totalBadges: number;
}

const TIER_CONFIG: Record<string, { icon: typeof Award; color: string; bgColor: string }> = {
  bronze: {
    icon: Award,
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  silver: {
    icon: Medal,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
  gold: {
    icon: Trophy,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  platinum: {
    icon: Crown,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
};

/**
 * Displays a timeline of recent achievements with tier indicators
 * Shows icons based on achievement tier (bronze, silver, gold, platinum)
 */
export function AchievementTimeline({ achievements, totalBadges }: AchievementTimelineProps) {
  if (achievements.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Complete lessons to earn achievements!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            Recent Achievements
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Trophy className="h-3 w-3" />
            {totalBadges} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {achievements.map((achievement, index) => {
              const tier = achievement.tier.toLowerCase();
              const config = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
              const TierIcon = config.icon;

              return (
                <div key={achievement.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div 
                    className={cn(
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      config.bgColor
                    )}
                  >
                    <TierIcon className={cn('h-5 w-5', config.color)} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {achievement.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(achievement.earnedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
