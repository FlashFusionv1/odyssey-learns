import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  points_value: number;
  estimated_minutes: number;
  thumbnail_url?: string;
}

interface K2QuestProps {
  quest: Lesson;
  bonusPoints: number;
  onComplete: () => void;
  isCompleted: boolean;
}

export const K2Quest = ({ quest, bonusPoints, isCompleted }: K2QuestProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-full"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-4 border-primary p-8">
        {/* Decorative stars */}
        <div className="absolute top-4 right-4 text-yellow-400">
          <Sparkles className="w-12 h-12 animate-pulse" />
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-primary mb-2">
              Today's Adventure!
            </h2>
            {isCompleted ? (
              <p className="text-2xl text-green-600 font-bold">
                ✨ You Did It! ✨
              </p>
            ) : (
              <p className="text-xl text-muted-foreground">
                Let's Learn Something Fun!
              </p>
            )}
          </div>

          {/* Quest Content */}
          <div className="bg-background/80 rounded-3xl p-6 space-y-4">
            {quest.thumbnail_url && (
              <div className="w-full h-48 rounded-2xl overflow-hidden">
                <img
                  src={quest.thumbnail_url}
                  alt={quest.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h3 className="text-3xl font-bold text-center">{quest.title}</h3>

            {/* Simple info */}
            <div className="flex items-center justify-center gap-6 text-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-8 h-8 text-primary" />
                <span className="font-semibold">{quest.estimated_minutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                <span className="font-semibold">
                  {quest.points_value + bonusPoints} stars
                </span>
              </div>
            </div>
          </div>

          {/* Big action button */}
          {!isCompleted && (
            <Button
              onClick={() => navigate(`/lessons/${quest.id}`)}
              className="w-full h-20 text-3xl font-bold rounded-2xl bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform"
            >
              Start Your Adventure! 🚀
            </Button>
          )}

          {isCompleted && (
            <div className="text-center p-6 bg-green-100 rounded-2xl">
              <p className="text-2xl font-bold text-green-600">
                Amazing Work! Come back tomorrow for a new adventure! 🎉
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
