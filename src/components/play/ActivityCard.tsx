import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play as PlayIcon, Clock } from "lucide-react";
import type { InteractiveContent } from "@/hooks/useInteractiveContent";
import { CONTENT_TYPE_ICONS, SUBJECT_COLORS } from "./constants";

interface ActivityCardProps {
  activity: InteractiveContent;
  onPlay: (activity: InteractiveContent) => void;
}

export function ActivityCard({ activity, onPlay }: ActivityCardProps) {
  const Icon = CONTENT_TYPE_ICONS[activity.content_type];
  const subjectColor = activity.subject ? SUBJECT_COLORS[activity.subject] : "";

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
      onClick={() => onPlay(activity)}
    >
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
        <div className="text-5xl opacity-50 group-hover:scale-110 transition-transform">
          {Icon && <Icon className="w-12 h-12" />}
        </div>
        <Badge className="absolute top-2 right-2 text-xs">
          +{activity.points_value || 0} ⭐
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-1">{activity.title}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2 text-xs">
          {activity.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activity.subject && (
              <Badge variant="secondary" className={`text-xs ${subjectColor}`}>
                {activity.subject}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activity.estimated_minutes || 10}m
            </span>
          </div>
          <Button size="sm" className="h-7 text-xs">
            <PlayIcon className="w-3 h-3 mr-1" />
            Play
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
