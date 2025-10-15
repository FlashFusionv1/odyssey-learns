import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Gift, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Redemption {
  id: string;
  status: string;
  requested_at: string;
  resolved_at: string | null;
  parent_notes: string | null;
  child_id: string;
  reward_id: string;
  children: {
    name: string;
    total_points: number;
  };
  rewards: {
    name: string;
    description: string;
    points_cost: number;
  };
}

export const RewardRedemptions = ({ parentId }: { parentId: string }) => {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadRedemptions();
  }, [parentId]);

  const loadRedemptions = async () => {
    try {
      const { data: childrenData } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', parentId);

      if (!childrenData) return;

      const childIds = childrenData.map(c => c.id);

      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          children (name, total_points),
          rewards (name, description, points_cost)
        `)
        .in('child_id', childIds)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRedemptions(data as any || []);
    } catch (error) {
      console.error('Error loading redemptions:', error);
      toast({
        title: "Error",
        description: "Failed to load redemptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedemption = async (redemptionId: string, approved: boolean) => {
    setProcessingId(redemptionId);
    try {
      const redemption = redemptions.find(r => r.id === redemptionId);
      if (!redemption) return;

      // Update redemption status
      const { error: redemptionError } = await supabase
        .from('reward_redemptions')
        .update({
          status: approved ? 'approved' : 'rejected',
          resolved_at: new Date().toISOString(),
          parent_notes: notes[redemptionId] || null,
        })
        .eq('id', redemptionId);

      if (redemptionError) throw redemptionError;

      // If approved, deduct points
      if (approved) {
        const newPoints = redemption.children.total_points - redemption.rewards.points_cost;
        const { error: pointsError } = await supabase
          .from('children')
          .update({ total_points: Math.max(0, newPoints) })
          .eq('id', redemption.child_id);

        if (pointsError) throw pointsError;

        // Increment redemption counter
        const { data: rewardData } = await supabase
          .from('rewards')
          .select('redemption_count')
          .eq('id', redemption.reward_id)
          .single();

        if (rewardData) {
          await supabase
            .from('rewards')
            .update({ redemption_count: rewardData.redemption_count + 1 })
            .eq('id', redemption.reward_id);
        }
      }

      toast({
        title: approved ? "Reward approved! 🎉" : "Reward denied",
        description: approved
          ? `${redemption.children.name} can now enjoy their reward!`
          : "The request has been declined",
      });

      loadRedemptions();
    } catch (error) {
      console.error('Error processing redemption:', error);
      toast({
        title: "Error",
        description: "Failed to process redemption",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');
  const historyRedemptions = redemptions.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Pending Requests</h3>
        {pendingRedemptions.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No pending redemption requests</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRedemptions.map((redemption) => (
              <Card key={redemption.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {redemption.children.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{redemption.children.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(redemption.requested_at).toLocaleDateString()} at{' '}
                          {new Date(redemption.requested_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Gift className="w-3 h-3" />
                        {redemption.rewards.points_cost} points
                      </Badge>
                    </div>

                    <div className="bg-accent/10 p-4 rounded-lg mb-4">
                      <h5 className="font-medium mb-1">{redemption.rewards.name}</h5>
                      <p className="text-sm text-muted-foreground">{redemption.rewards.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Add a note (optional)</label>
                        <Textarea
                          value={notes[redemption.id] || ''}
                          onChange={(e) => setNotes({ ...notes, [redemption.id]: e.target.value })}
                          placeholder="Add a personal message..."
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRedemption(redemption.id, false)}
                          variant="outline"
                          disabled={processingId === redemption.id}
                          className="flex-1 gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Deny
                        </Button>
                        <Button
                          onClick={() => handleRedemption(redemption.id, true)}
                          disabled={processingId === redemption.id}
                          className="flex-1 gap-2"
                        >
                          {processingId === redemption.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">History</h3>
        {historyRedemptions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No redemption history yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {historyRedemptions.slice(0, 5).map((redemption) => (
              <Card key={redemption.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {redemption.children.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{redemption.rewards.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {redemption.children.name} • {new Date(redemption.resolved_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={redemption.status === 'approved' ? 'default' : 'secondary'}>
                    {redemption.status}
                  </Badge>
                </div>
                {redemption.parent_notes && (
                  <p className="text-sm text-muted-foreground mt-2 pl-11">
                    Note: {redemption.parent_notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
