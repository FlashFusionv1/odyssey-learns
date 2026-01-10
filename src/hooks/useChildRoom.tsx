import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Decoration {
  id: string;
  name: string;
  category: string;
  svg_data: string;
  points_cost: number;
  is_default: boolean;
}

export interface ChildRoom {
  id: string;
  child_id: string;
  room_name: string | null;
  placed_decorations: Array<{ id: string; x: number; y: number }> | null;
  owned_decoration_ids: string[] | null;
}

interface Child {
  id: string;
  name: string;
  total_points: number | null;
  grade_level: number;
}

interface UseChildRoomResult {
  child: Child | null;
  room: ChildRoom | null;
  decorations: Decoration[];
  ownedDecorations: Decoration[];
  shopDecorations: Decoration[];
  loading: boolean;
  purchasing: string | null;
  purchaseDecoration: (decoration: Decoration) => Promise<void>;
  isOwned: (id: string) => boolean;
  refresh: () => Promise<void>;
}

export function useChildRoom(childId: string | null): UseChildRoomResult {
  const [child, setChild] = useState<Child | null>(null);
  const [room, setRoom] = useState<ChildRoom | null>(null);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!childId) {
      setLoading(false);
      return;
    }

    try {
      const [childRes, roomRes, decosRes] = await Promise.all([
        supabase.from("children").select("id, name, total_points, grade_level").eq("id", childId).single(),
        supabase.from("child_room").select("*").eq("child_id", childId).single(),
        supabase.from("room_decorations").select("*").order("points_cost", { ascending: true }),
      ]);

      setChild(childRes.data as Child | null);
      setRoom(roomRes.data as unknown as ChildRoom | null);
      setDecorations((decosRes.data || []) as unknown as Decoration[]);
    } catch (error) {
      console.error("Error loading room data:", error);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOwned = useCallback(
    (id: string) => room?.owned_decoration_ids?.includes(id) || false,
    [room?.owned_decoration_ids]
  );

  const purchaseDecoration = useCallback(
    async (decoration: Decoration) => {
      if (!child || !room || !childId) return;

      if ((child.total_points || 0) < decoration.points_cost) {
        toast.error("Not enough points!");
        return;
      }

      if (isOwned(decoration.id)) {
        toast.info("You already own this!");
        return;
      }

      setPurchasing(decoration.id);

      try {
        const { error: pointsError } = await supabase
          .from("children")
          .update({ total_points: (child.total_points || 0) - decoration.points_cost })
          .eq("id", childId);

        if (pointsError) throw pointsError;

        const newOwned = [...(room.owned_decoration_ids || []), decoration.id];
        await supabase
          .from("child_room")
          .update({ owned_decoration_ids: newOwned })
          .eq("child_id", childId);

        toast.success(`You got ${decoration.name}! 🎉`);
        await loadData();
      } catch (error) {
        console.error("Purchase error:", error);
        toast.error("Failed to purchase");
      } finally {
        setPurchasing(null);
      }
    },
    [child, room, childId, isOwned, loadData]
  );

  const ownedDecorations = decorations.filter((d) => isOwned(d.id));
  const shopDecorations = decorations.filter((d) => !d.is_default && !isOwned(d.id));

  return {
    child,
    room,
    decorations,
    ownedDecorations,
    shopDecorations,
    loading,
    purchasing,
    purchaseDecoration,
    isOwned,
    refresh: loadData,
  };
}
