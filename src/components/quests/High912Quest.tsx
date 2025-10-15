import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, TrendingUp, CheckCircle2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SubjectBadge } from "@/components/ui/subject-badge";

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  points_value: number;
  estimated_minutes: number;
  thumbnail_url?: string;
}

interface High912QuestProps {
  quest: Lesson;
  bonusPoints: number;
  onComplete: () => void;
  isCompleted: boolean;
}

export const High912Quest = ({ quest, bonusPoints, isCompleted }: High912QuestProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="border hover:shadow-lg transition-shadow">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Pathway Project</h2>
              </div>
              <p className="text-sm text-muted-foreground">Daily Learning Objective</p>
            </div>
            {isCompleted && (
              <Badge variant="outline" className="border-green-600 text-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>

          {/* Content grid */}
          <div className="grid md:grid-cols-[200px_1fr] gap-4">
            {quest.thumbnail_url && (
              <div className="h-28 rounded overflow-hidden bg-muted">
                <img
                  src={quest.thumbnail_url}
                  alt={quest.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{quest.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {quest.description}
                  </p>
                </div>
                <SubjectBadge subject={quest.subject as any} />
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{quest.estimated_minutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{quest.points_value} points (+{bonusPoints} bonus)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          {!isCompleted ? (
            <Button
              onClick={() => navigate(`/lessons/${quest.id}`)}
              variant="default"
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Begin Project
            </Button>
          ) : (
            <div className="p-3 bg-muted/50 rounded text-sm text-center text-muted-foreground">
              Project completed. Next assignment available tomorrow.
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
