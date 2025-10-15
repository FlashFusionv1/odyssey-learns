import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Star, BookOpen } from "lucide-react";
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

interface Elementary35QuestProps {
  quest: Lesson;
  bonusPoints: number;
  onComplete: () => void;
  isCompleted: boolean;
}

export const Elementary35Quest = ({ quest, bonusPoints, isCompleted }: Elementary35QuestProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="relative overflow-hidden border-2 border-primary/30">
        {/* Header with badge */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Mission Board</h2>
            </div>
            <SubjectBadge subject={quest.subject as any} />
          </div>

          {isCompleted ? (
            <div className="flex items-center gap-2 text-green-600">
              <Star className="w-6 h-6 fill-current" />
              <span className="text-lg font-semibold">Mission Complete!</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Today's Mission</p>
              <Progress value={0} className="h-2" />
            </div>
          )}
        </div>

        {/* Quest Details */}
        <div className="p-6 space-y-6">
          {quest.thumbnail_url && (
            <div className="w-full h-40 rounded-lg overflow-hidden">
              <img
                src={quest.thumbnail_url}
                alt={quest.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xl font-bold">{quest.title}</h3>
            <p className="text-muted-foreground">{quest.description}</p>

            {/* Mission stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center space-y-1">
                <Clock className="w-5 h-5 mx-auto text-primary" />
                <p className="text-sm font-medium">{quest.estimated_minutes} min</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
              <div className="text-center space-y-1">
                <Star className="w-5 h-5 mx-auto text-yellow-500" />
                <p className="text-sm font-medium">{quest.points_value} XP</p>
                <p className="text-xs text-muted-foreground">Base</p>
              </div>
              <div className="text-center space-y-1">
                <Trophy className="w-5 h-5 mx-auto text-primary" />
                <p className="text-sm font-medium">+{bonusPoints} XP</p>
                <p className="text-xs text-muted-foreground">Bonus</p>
              </div>
            </div>
          </div>

          {/* Action button */}
          {!isCompleted ? (
            <Button
              onClick={() => navigate(`/lessons/${quest.id}`)}
              className="w-full h-12 text-lg font-semibold"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Mission
            </Button>
          ) : (
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="font-semibold text-green-600">
                Great job! Check back tomorrow for your next mission! 🎯
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
