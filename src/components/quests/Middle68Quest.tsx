import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, Zap, Award, ArrowRight } from "lucide-react";
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

interface Middle68QuestProps {
  quest: Lesson;
  bonusPoints: number;
  onComplete: () => void;
  isCompleted: boolean;
}

export const Middle68Quest = ({ quest, bonusPoints, isCompleted }: Middle68QuestProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Challenge Hub</h2>
                <p className="text-sm text-muted-foreground">Daily Challenge</p>
              </div>
            </div>
            {isCompleted && (
              <Badge variant="default" className="bg-green-600">
                <Award className="w-4 h-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>

          {/* Quest content */}
          <div className="grid md:grid-cols-2 gap-4">
            {quest.thumbnail_url && (
              <div className="h-32 rounded-lg overflow-hidden">
                <img
                  src={quest.thumbnail_url}
                  alt={quest.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold line-clamp-2">{quest.title}</h3>
                <SubjectBadge subject={quest.subject as any} />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {quest.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">{quest.estimated_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">
                {quest.points_value} + {bonusPoints} bonus
              </span>
            </div>
          </div>

          {/* Action */}
          {!isCompleted ? (
            <Button
              onClick={() => navigate(`/lessons/${quest.id}`)}
              className="w-full group"
            >
              Take Challenge
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <div className="p-3 bg-muted rounded-lg text-sm text-center">
              Challenge complete! New challenge available tomorrow.
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
