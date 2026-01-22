import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Gift, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  is_active: boolean;
  redemption_count: number;
}

export const RewardManagement = ({ parentId }: { parentId: string }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', points_cost: 50 });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRewards();
  }, [parentId]);

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
      toast({
        title: "Error",
        description: "Failed to load rewards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || formData.points_cost < 1) {
      toast({
        title: "Invalid input",
        description: "Please fill in all fields correctly",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingReward) {
        const { error } = await supabase
          .from('rewards')
          .update(formData)
          .eq('id', editingReward.id);

        if (error) throw error;
        toast({ title: "Reward updated!", description: "Changes saved successfully" });
      } else {
        const { error } = await supabase
          .from('rewards')
          .insert({ ...formData, parent_id: parentId });

        if (error) throw error;
        toast({ title: "Reward created!", description: "Your child can now redeem this reward" });
      }

      setShowDialog(false);
      setEditingReward(null);
      setFormData({ name: '', description: '', points_cost: 50 });
      loadRewards();
    } catch (error) {
      console.error('Error saving reward:', error);
      toast({
        title: "Error",
        description: "Failed to save reward",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Reward deleted", description: "Reward removed successfully" });
      loadRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast({
        title: "Error",
        description: "Failed to delete reward",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (reward: Reward) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ is_active: !reward.is_active })
        .eq('id', reward.id);

      if (error) throw error;
      loadRewards();
    } catch (error) {
      console.error('Error toggling reward:', error);
    }
  };

  const openEditDialog = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || '',
      points_cost: reward.points_cost,
    });
    setShowDialog(true);
  };

  const openCreateDialog = () => {
    setEditingReward(null);
    setFormData({ name: '', description: '', points_cost: 50 });
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reward Management</h2>
          <p className="text-sm text-muted-foreground">Create rewards your children can earn with points</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Reward
        </Button>
      </div>

      {rewards.length === 0 ? (
        <Card className="p-12 text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No rewards yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first reward to motivate your child's learning!
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Reward
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className={`p-6 ${!reward.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Gift className="w-3 h-3" />
                      {reward.points_cost} points
                    </Badge>
                    <Badge variant={reward.is_active ? "default" : "outline"}>
                      {reward.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(reward)}
                  className="flex-1"
                >
                  {reward.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(reward)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(reward.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {reward.redemption_count > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Redeemed {reward.redemption_count} time{reward.redemption_count !== 1 ? 's' : ''}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReward ? 'Edit Reward' : 'Create Reward'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="reward-name" className="text-sm font-medium mb-2 block">Reward Name</label>
              <Input
                id="reward-name"
                name="reward-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Extra 30 minutes screen time"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="reward-description" className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                id="reward-description"
                name="reward-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what the reward includes..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="reward-points-cost" className="text-sm font-medium mb-2 block">Points Cost</label>
              <Input
                id="reward-points-cost"
                name="reward-points-cost"
                type="number"
                min="1"
                max="10000"
                value={formData.points_cost}
                onChange={(e) => setFormData({ ...formData, points_cost: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingReward ? 'Save Changes' : 'Create Reward'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
