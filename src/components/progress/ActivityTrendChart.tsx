import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DailyActivity } from '@/hooks/useChildProgressAnalytics';

interface ActivityTrendChartProps {
  /** Daily activity data from analytics hook */
  data: DailyActivity[];
  /** Weekly trend indicator */
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Displays an area chart showing daily learning activity over time
 * Includes trend indicator and summary statistics
 */
export function ActivityTrendChart({ data, trend }: ActivityTrendChartProps) {
  const chartData = useMemo(() => 
    data.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      lessons: d.lessonsCompleted,
      minutes: d.timeSpentMinutes,
      score: d.averageScore,
    })),
  [data]);

  const trendConfig = {
    improving: {
      icon: TrendingUp,
      label: 'Improving',
      variant: 'default' as const,
      color: 'text-green-500',
    },
    stable: {
      icon: Minus,
      label: 'Stable',
      variant: 'secondary' as const,
      color: 'text-yellow-500',
    },
    declining: {
      icon: TrendingDown,
      label: 'Needs Attention',
      variant: 'destructive' as const,
      color: 'text-red-500',
    },
  };

  const { icon: TrendIcon, label, variant, color } = trendConfig[trend];

  // Calculate summary stats
  const totalLessons = data.reduce((sum, d) => sum + d.lessonsCompleted, 0);
  const totalMinutes = data.reduce((sum, d) => sum + d.timeSpentMinutes, 0);
  const activeDays = data.filter(d => d.lessonsCompleted > 0).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Activity Over Time</CardTitle>
            <CardDescription>Last 14 days of learning</CardDescription>
          </div>
          <Badge variant={variant} className="gap-1">
            <TrendIcon className={`h-3 w-3 ${color}`} />
            {label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--border))" 
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover text-popover-foreground rounded-lg shadow-lg border p-3">
                      <p className="font-semibold text-sm">{label}</p>
                      <div className="mt-1 space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Lessons: <span className="text-foreground font-medium">{data.lessons}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Time: <span className="text-foreground font-medium">{data.minutes} min</span>
                        </p>
                        {data.score > 0 && (
                          <p className="text-muted-foreground">
                            Avg Score: <span className="text-foreground font-medium">{data.score}%</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="lessons"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorLessons)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Summary row */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t pt-4">
          <div>
            <p className="text-xl font-bold text-foreground">{totalLessons}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{totalMinutes}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{activeDays}</p>
            <p className="text-xs text-muted-foreground">Active Days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
