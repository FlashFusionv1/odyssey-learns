import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import type { Json } from '@/integrations/supabase/types';

export interface AvatarConfig {
  hair: string;
  color: string;
  accessory: string;
}

interface AvatarCustomizerProps {
  open: boolean;
  onClose: () => void;
  childId: string;
  currentConfig: AvatarConfig | null;
  onSave: (config: AvatarConfig) => void;
}

interface AvatarItem {
  id: string;
  item_type: 'hair' | 'color' | 'accessory';
  item_name: string;
  item_svg_data: string;
  points_cost: number;
}

const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  hair: 'short',
  color: 'brown',
  accessory: 'none'
};

export const AvatarCustomizer = ({ open, onClose, childId, currentConfig, onSave }: AvatarCustomizerProps) => {
  const [config, setConfig] = useState<AvatarConfig>(currentConfig || DEFAULT_AVATAR_CONFIG);
  const [items, setItems] = useState<AvatarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAvatarItems();
  }, []);

  const loadAvatarItems = async () => {
    try {
      const { data, error } = await supabase
        .from('avatar_items')
        .select('*')
        .order('item_type', { ascending: true })
        .order('item_name', { ascending: true });

      if (error) throw error;
      setItems((data || []) as AvatarItem[]);
    } catch (error) {
      console.error('Error loading avatar items:', error);
      toast({
        title: "Error",
        description: "Failed to load avatar options. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('children')
        .update({ avatar_config: config as unknown as Json })
        .eq('id', childId);

      if (error) throw error;

      toast({
        title: "Avatar saved! ✨",
        description: "Your new look is ready!",
      });

      onSave(config);
      onClose();
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: "Error",
        description: "Failed to save avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hairItems = items.filter(item => item.item_type === 'hair');
  const colorItems = items.filter(item => item.item_type === 'color');
  const accessoryItems = items.filter(item => item.item_type === 'accessory');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Customize Your Avatar ✨</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <AvatarDisplay config={config} size="large" />
            </div>

            {/* Hair Style */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Hair Style</h3>
              <div className="grid grid-cols-5 gap-2">
                {hairItems.map(item => (
                  <Button
                    key={item.id}
                    variant={config.hair === item.item_name ? "default" : "outline"}
                    className="h-12 capitalize"
                    onClick={() => setConfig({ ...config, hair: item.item_name })}
                  >
                    {item.item_name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Hair Color</h3>
              <div className="grid grid-cols-6 gap-2">
                {colorItems.map(item => (
                  <button
                    key={item.id}
                    className={`h-12 w-12 rounded-full border-2 transition-all ${
                      config.color === item.item_name
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-border hover:border-primary'
                    }`}
                    style={{ backgroundColor: item.item_svg_data }}
                    onClick={() => setConfig({ ...config, color: item.item_name })}
                    title={item.item_name}
                  />
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Accessories</h3>
              <div className="grid grid-cols-4 gap-2">
                {accessoryItems.map(item => (
                  <Button
                    key={item.id}
                    variant={config.accessory === item.item_name ? "default" : "outline"}
                    className="h-12 capitalize"
                    onClick={() => setConfig({ ...config, accessory: item.item_name })}
                  >
                    {item.item_name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Avatar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
