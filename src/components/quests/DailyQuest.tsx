import { useEffect, useState } from "react";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import { supabase } from "@/integrations/supabase/client";
import { generateDailyQuest, isQuestStale } from "@/lib/questGenerator";
import { toast } from "sonner";
import { K2Quest } from "./K2Quest";
import { Elementary35Quest } from "./Elementary35Quest";
import { Middle68Quest } from "./Middle68Quest";
import { High912Quest } from "./High912Quest";
import { Loader2 } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  grade_level: number;
  points_value: number;
  estimated_minutes: number;
  thumbnail_url?: string | null;
}

interface ChildData {
  id: string;
  name: string;
  grade_level: number;
  daily_quest_id: string | null;
  quest_completed_at: string | null;
  quest_bonus_points: number | null;
  total_points: number;
}

export const DailyQuest = () => {
  const { childId, isValidating } = useValidatedChild();
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [quest, setQuest] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [bonusPoints, setBonusPoints] = useState(0);

  useEffect(() => {
    if (!isValidating && childId) {
      loadQuest();
    }
  }, [childId, isValidating]);

  const loadQuest = async () => {
    if (!childId) return;

    try {
      setLoading(true);

      // Fetch child data
      const { data: child, error: childError } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (childError) throw childError;
      setChildData(child);

      // Check if current quest is stale
      const needsNewQuest = child.daily_quest_id 
        ? isQuestStale(child.quest_completed_at)
        : true;

      if (needsNewQuest) {
        // Generate new quest
        const newQuest = await generateDailyQuest(child.id, child.grade_level);

        if (newQuest) {
          // Fetch full lesson details
          const { data: lessonData, error: lessonError } = await supabase
            .from("lessons")
            .select("*")
            .eq("id", newQuest.lesson_id)
            .single();

          if (lessonError) throw lessonError;

          // Update child with new quest
          const { error: updateError } = await supabase
            .from("children")
            .update({
              daily_quest_id: newQuest.lesson_id,
              quest_completed_at: null,
              quest_bonus_points: newQuest.bonus_points,
            })
            .eq("id", child.id);

          if (updateError) throw updateError;

          setQuest(lessonData);
          setBonusPoints(newQuest.bonus_points);
        }
      } else if (child.daily_quest_id) {
        // Load existing quest
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", child.daily_quest_id)
          .single();

        if (lessonError) throw lessonError;

        setQuest(lessonData);
        setBonusPoints(child.quest_bonus_points || 0);
      }
    } catch (error) {
      console.error("Error loading quest:", error);
      toast.error("Failed to load today's quest");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestComplete = async () => {
    if (!childData || !quest) return;

    try {
      // Award bonus points
      const totalPoints = childData.total_points + bonusPoints;

      const { error } = await supabase
        .from("children")
        .update({
          quest_completed_at: new Date().toISOString(),
          total_points: totalPoints,
        })
        .eq("id", childData.id);

      if (error) throw error;

      toast.success(`Quest Complete! +${bonusPoints} bonus points! 🎉`);
      
      // Reload quest for tomorrow
      setTimeout(loadQuest, 2000);
    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error("Failed to complete quest");
    }
  };

  if (loading || isValidating) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quest || !childData) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No quest available today.</p>
      </div>
    );
  }

  // Determine age tier based on grade level
  const gradeLevel = childData.grade_level;

  if (gradeLevel <= 2) {
    return (
      <K2Quest
        quest={quest}
        bonusPoints={bonusPoints}
        onComplete={handleQuestComplete}
        isCompleted={!!childData.quest_completed_at}
      />
    );
  }

  if (gradeLevel <= 5) {
    return (
      <Elementary35Quest
        quest={quest}
        bonusPoints={bonusPoints}
        onComplete={handleQuestComplete}
        isCompleted={!!childData.quest_completed_at}
      />
    );
  }

  if (gradeLevel <= 8) {
    return (
      <Middle68Quest
        quest={quest}
        bonusPoints={bonusPoints}
        onComplete={handleQuestComplete}
        isCompleted={!!childData.quest_completed_at}
      />
    );
  }

  return (
    <High912Quest
      quest={quest}
      bonusPoints={bonusPoints}
      onComplete={handleQuestComplete}
      isCompleted={!!childData.quest_completed_at}
    />
  );
};
