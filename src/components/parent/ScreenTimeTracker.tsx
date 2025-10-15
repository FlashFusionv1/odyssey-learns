import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, TrendingUp, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Child {
  id: string;
  name: string;
  daily_screen_time_limit_minutes: number;
  screen_time_enabled: boolean;
}

interface ScreenTimeData {
  child_id: string;
  today_minutes: number;
  week_minutes: number;
}

export const ScreenTimeTracker = ({ parentId }: { parentId: string }) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [screenTime, setScreenTime] = useState<Record<string, ScreenTimeData>>({});
  const [loading, setLoading] = useState(true);
  const [editingLimits, setEditingLimits] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [parentId]);

  const loadData = async () => {
    try {
      // Load children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId);

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Load screen time data for today and this week
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const screenTimeData: Record<string, ScreenTimeData> = {};

      for (const child of childrenData || []) {
        // Today's screen time
        const { data: todaySessions } = await supabase
          .from('screen_time_sessions')
          .select('minutes_used')
          .eq('child_id', child.id)
          .gte('session_start', today.toISOString());

        const todayMinutes = todaySessions?.reduce((sum, s) => sum + (s.minutes_used || 0), 0) || 0;

        // This week's screen time
        const { data: weekSessions } = await supabase
          .from('screen_time_sessions')
          .select('minutes_used')
          .eq('child_id', child.id)
          .gte('session_start', weekStart.toISOString());

        const weekMinutes = weekSessions?.reduce((sum, s) => sum + (s.minutes_used || 0), 0) || 0;

        screenTimeData[child.id] = {
          child_id: child.id,
          today_minutes: todayMinutes,
          week_minutes: weekMinutes,
        };
      }

      setScreenTime(screenTimeData);
    } catch (error) {
      console.error('Error loading screen time data:', error);
      toast({
        title: "Error",
        description: "Failed to load screen time data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLimit = async (childId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from('children')
        .update({ daily_screen_time_limit_minutes: newLimit })
        .eq('id', childId);

      if (error) throw error;

      toast({
        title: "Limit updated",
        description: "Screen time limit has been saved",
      });

      loadData();
      setEditingLimits({ ...editingLimits, [childId]: 0 });
    } catch (error) {
      console.error('Error updating limit:', error);
      toast({
        title: "Error",
        description: "Failed to update limit",
        variant: "destructive",
      });
    }
  };

  const toggleScreenTime = async (childId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('children')
        .update({ screen_time_enabled: enabled })
        .eq('id', childId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling screen time:', error);
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Screen Time Management</h2>
        <p className="text-sm text-muted-foreground">Monitor and set daily screen time limits</p>
      </div>

      <div className="space-y-4">
        {children.map((child) => {
          const data = screenTime[child.id] || { today_minutes: 0, week_minutes: 0, child_id: child.id };
          const percentUsed = (data.today_minutes / child.daily_screen_time_limit_minutes) * 100;
          const isOverLimit = data.today_minutes > child.daily_screen_time_limit_minutes;

          return (
            <Card key={child.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{child.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {child.screen_time_enabled ? 'Tracking enabled' : 'Tracking disabled'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleScreenTime(child.id, !child.screen_time_enabled)}
                >
                  {child.screen_time_enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>

              {child.screen_time_enabled && (
                <>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Today</span>
                        </div>
                        <span className={`text-sm font-semibold ${isOverLimit ? 'text-destructive' : 'text-primary'}`}>
                          {formatMinutes(data.today_minutes)} / {formatMinutes(child.daily_screen_time_limit_minutes)}
                        </span>
                      </div>
                      <Progress value={Math.min(percentUsed, 100)} className="h-2" />
                      {isOverLimit && (
                        <p className="text-xs text-destructive mt-1">Over limit by {formatMinutes(data.today_minutes - child.daily_screen_time_limit_minutes)}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">This week:</span>
                      <span className="font-medium">{formatMinutes(data.week_minutes)}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Input
                        type="number"
                        min="0"
                        max="480"
                        placeholder={child.daily_screen_time_limit_minutes.toString()}
                        value={editingLimits[child.id] || ''}
                        onChange={(e) =>
                          setEditingLimits({
                            ...editingLimits,
                            [child.id]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">minutes/day</span>
                      <Button
                        size="sm"
                        onClick={() => updateLimit(child.id, editingLimits[child.id])}
                        disabled={!editingLimits[child.id] || editingLimits[child.id] === child.daily_screen_time_limit_minutes}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
