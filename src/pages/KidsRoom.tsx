import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Home, ShoppingBag, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { useValidatedChild } from "@/hooks/useValidatedChild";

interface Decoration {
  id: string;
  name: string;
  category: string;
  svg_data: string;
  points_cost: number;
  is_default: boolean;
}

interface ChildRoom {
  id: string;
  child_id: string;
  room_name: string;
  placed_decorations: Array<{ id: string; x: number; y: number }>;
  owned_decoration_ids: string[];
}

const KidsRoom = () => {
  const { childId, isValidating } = useValidatedChild();
  const [child, setChild] = useState<any>(null);
  const [room, setRoom] = useState<ChildRoom | null>(null);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidating && childId) {
      loadData();
    }
  }, [childId, isValidating]);

  const loadData = async () => {
    if (!childId) return;

    const [childRes, roomRes, decosRes] = await Promise.all([
      supabase.from('children').select('*').eq('id', childId).single(),
      supabase.from('child_room').select('*').eq('child_id', childId).single(),
      supabase.from('room_decorations').select('*').order('points_cost', { ascending: true })
    ]);

    setChild(childRes.data);
    setRoom(roomRes.data as unknown as ChildRoom);
    setDecorations((decosRes.data || []) as unknown as Decoration[]);
    setLoading(false);
  };

  const purchaseDecoration = async (decoration: Decoration) => {
    if (!child || !room) return;
    if (child.total_points < decoration.points_cost) {
      toast.error("Not enough points!");
      return;
    }
    if (room.owned_decoration_ids?.includes(decoration.id)) {
      toast.info("You already own this!");
      return;
    }

    setPurchasing(decoration.id);
    
    const { error: pointsError } = await supabase
      .from('children')
      .update({ total_points: child.total_points - decoration.points_cost })
      .eq('id', childId);

    if (pointsError) {
      toast.error("Failed to purchase");
      setPurchasing(null);
      return;
    }

    const newOwned = [...(room.owned_decoration_ids || []), decoration.id];
    await supabase
      .from('child_room')
      .update({ owned_decoration_ids: newOwned })
      .eq('child_id', childId);

    toast.success(`You got ${decoration.name}! 🎉`);
    loadData();
    setPurchasing(null);
  };

  const isOwned = (id: string) => room?.owned_decoration_ids?.includes(id);

  if (isValidating || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const ownedDecos = decorations.filter(d => isOwned(d.id));
  const shopDecos = decorations.filter(d => !d.is_default && !isOwned(d.id));

  return (
    <AppLayout childName={child?.name} points={child?.total_points || 0}>
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-6">
          <div className="inline-block w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">My Room</h1>
          <p className="text-muted-foreground">Decorate your space with awesome stuff!</p>
        </div>

        <Tabs defaultValue="room" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="room" className="gap-2">
              <Sparkles className="w-4 h-4" /> My Room
            </TabsTrigger>
            <TabsTrigger value="shop" className="gap-2">
              <ShoppingBag className="w-4 h-4" /> Deco Shop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="room" className="mt-6">
            {/* Room Display */}
            <Card className="p-6 min-h-[300px] bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-900/20 dark:to-sky-800/10 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {ownedDecos.length === 0 ? (
                  <p className="text-muted-foreground">Visit the shop to get decorations!</p>
                ) : (
                  <div className="flex flex-wrap gap-4 justify-center items-end p-4">
                    {ownedDecos.map((deco) => (
                      <div key={deco.id} className="flex flex-col items-center gap-1 hover-scale cursor-pointer">
                        <div 
                          className="w-20 h-20"
                          dangerouslySetInnerHTML={{ __html: deco.svg_data }}
                        />
                        <span className="text-xs text-muted-foreground">{deco.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              You have {ownedDecos.length} decoration{ownedDecos.length !== 1 ? 's' : ''}
            </div>
          </TabsContent>

          <TabsContent value="shop" className="mt-6">
            <Card className="p-4 mb-4 bg-accent/10 border-accent/20">
              <div className="flex items-center justify-between">
                <span className="font-medium">Your Points</span>
                <span className="text-2xl font-bold text-accent">{child?.total_points || 0} ⭐</span>
              </div>
            </Card>

            {shopDecos.length === 0 ? (
              <Card className="p-12 text-center">
                <Check className="w-12 h-12 mx-auto mb-4 text-success" />
                <h3 className="text-xl font-semibold mb-2">You own everything!</h3>
                <p className="text-muted-foreground">Check back later for new items.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shopDecos.map((deco) => {
                  const canAfford = (child?.total_points || 0) >= deco.points_cost;
                  return (
                    <Card 
                      key={deco.id} 
                      className={`p-4 text-center ${canAfford ? 'hover-scale' : 'opacity-60'}`}
                    >
                      <div 
                        className="w-16 h-16 mx-auto mb-2"
                        dangerouslySetInnerHTML={{ __html: deco.svg_data }}
                      />
                      <h4 className="font-medium text-sm mb-1">{deco.name}</h4>
                      <p className="text-lg font-bold text-accent mb-2">{deco.points_cost} ⭐</p>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={!canAfford || purchasing === deco.id}
                        onClick={() => purchaseDecoration(deco)}
                      >
                        {purchasing === deco.id ? 'Buying...' : canAfford ? 'Buy' : 'Need more ⭐'}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default KidsRoom;
