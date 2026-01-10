import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, Trophy, Crown } from 'lucide-react';
import { SkillMastery } from '@/hooks/useChildProgressAnalytics';
import { cn } from '@/lib/utils';

interface SkillMasteryGridProps {
  /** Skill mastery data from analytics hook */
  skills: SkillMastery[];
}

const LEVEL_CONFIG = {
  beginner: {
    icon: BookOpen,
    label: 'Beginner',
    color: 'bg-muted text-muted-foreground',
    progressColor: 'bg-muted-foreground',
  },
  intermediate: {
    icon: Star,
    label: 'Intermediate',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    progressColor: 'bg-blue-500',
  },
  advanced: {
    icon: Trophy,
    label: 'Advanced',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    progressColor: 'bg-purple-500',
  },
  expert: {
    icon: Crown,
    label: 'Expert',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    progressColor: 'bg-amber-500',
  },
};

/**
 * Displays a grid of skill mastery cards with progress indicators
 * Shows level badges and completion progress for each subject
 */
export function SkillMasteryGrid({ skills }: SkillMasteryGridProps) {
  if (skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skill Mastery</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Start learning to build your skills!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Skill Mastery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((skill) => {
            const config = LEVEL_CONFIG[skill.level];
            const LevelIcon = config.icon;

            return (
              <div
                key={skill.skill}
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{skill.skill}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {skill.lessonsCompleted} of {skill.totalLessons} lessons
                    </p>
                  </div>
                  <Badge className={cn('gap-1', config.color)}>
                    <LevelIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{skill.progress}%</span>
                  </div>
                  <Progress 
                    value={skill.progress} 
                    className="h-2"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
