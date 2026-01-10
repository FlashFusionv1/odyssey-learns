import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubjectProgress } from '@/hooks/useChildProgressAnalytics';

interface SubjectProgressChartProps {
  /** Subject progress data from analytics hook */
  data: SubjectProgress[];
  /** Chart title */
  title?: string;
  /** Show time instead of lessons */
  showTime?: boolean;
}

/**
 * Displays a pie chart breakdown of learning progress by subject
 * Uses design system colors for consistent theming
 */
export function SubjectProgressChart({ 
  data, 
  title = 'Learning by Subject',
  showTime = false 
}: SubjectProgressChartProps) {
  const chartData = useMemo(() => 
    data.map(d => ({
      name: d.subject,
      value: showTime ? d.totalTimeMinutes : d.lessonsCompleted,
      color: d.color,
      score: d.averageScore,
    })).filter(d => d.value > 0),
  [data, showTime]);

  const total = useMemo(() => 
    chartData.reduce((sum, d) => sum + d.value, 0),
  [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-center">
            Complete lessons to see your progress breakdown!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover text-popover-foreground rounded-lg shadow-lg border p-3">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {showTime ? `${data.value} minutes` : `${data.value} lessons`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Avg Score: {data.score}%
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Summary stats below chart */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">
              {showTime ? 'Total Minutes' : 'Total Lessons'}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{chartData.length}</p>
            <p className="text-xs text-muted-foreground">Subjects Explored</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
