import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { InteractiveContent } from "@/hooks/useInteractiveContent";

interface CalmZoneProps {
  activities: InteractiveContent[];
  onPlay: (activity: InteractiveContent) => void;
}

export function CalmZone({ activities, onPlay }: CalmZoneProps) {
  const calmActivities = activities
    .filter((c) => c.content_type === "self_soothing")
    .slice(0, 4);

  if (calmActivities.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-pink-500" />
        Calm & Relax
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {calmActivities.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800"
            onClick={() => onPlay(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.estimated_minutes || 5} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
