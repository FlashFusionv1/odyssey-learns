import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  MessageCircle, 
  Star,
  Calendar
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WeeklyReport {
  id: string;
  week_start_date: string;
  lessons_completed: number;
  total_points_earned: number;
  strongest_subject: string;
  growth_area: string;
  conversation_starter: string;
  top_achievement: string;
  report_data: any;
}

interface WeeklyReportCardProps {
  report: WeeklyReport;
  childName: string;
}

export const WeeklyReportCard = ({ report, childName }: WeeklyReportCardProps) => {
  const weekDate = new Date(report.week_start_date);
  const weekEndDate = new Date(weekDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatDate(weekDate)} - {formatDate(weekEndDate)}
            </span>
          </div>
          <h3 className="text-xl font-bold">
            {childName}'s Learning Week
          </h3>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Weekly Learning Report
              </DialogTitle>
              <DialogDescription>
                {formatDate(weekDate)} - {formatDate(weekEndDate)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{report.lessons_completed}</p>
                      <p className="text-sm text-muted-foreground">Lessons</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-accent/5">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-accent" />
                    <div>
                      <p className="text-2xl font-bold">{report.total_points_earned}</p>
                      <p className="text-sm text-muted-foreground">Points</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-success" />
                  <h4 className="font-semibold">Strengths</h4>
                </div>
                <Card className="p-4 bg-success/5">
                  <p className="text-sm">
                    Excelling in <strong>{report.strongest_subject || "multiple subjects"}</strong>
                  </p>
                </Card>
              </div>

              {/* Growth Areas */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-warning" />
                  <h4 className="font-semibold">Growth Opportunities</h4>
                </div>
                <Card className="p-4 bg-warning/5">
                  <p className="text-sm">
                    {report.growth_area || "Keep up the great work across all subjects!"}
                  </p>
                </Card>
              </div>

              {/* Top Achievement */}
              {report.top_achievement && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    <h4 className="font-semibold">Top Achievement</h4>
                  </div>
                  <Card className="p-4 bg-accent/5">
                    <p className="text-sm">{report.top_achievement}</p>
                  </Card>
                </div>
              )}

              {/* Conversation Starter */}
              {report.conversation_starter && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Start a Conversation</h4>
                  </div>
                  <Card className="p-4 bg-primary/5">
                    <p className="text-sm italic">
                      "{report.conversation_starter}"
                    </p>
                  </Card>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">{report.lessons_completed}</p>
          <p className="text-xs text-muted-foreground">Lessons</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-accent">{report.total_points_earned}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
        <div>
          <p className="text-lg font-bold text-success">⭐</p>
          <p className="text-xs text-muted-foreground">Great Week!</p>
        </div>
      </div>

      {report.conversation_starter && (
        <div className="mt-4 p-3 bg-primary/5 rounded-lg">
          <p className="text-xs font-medium mb-1">💬 Ask them about:</p>
          <p className="text-sm text-muted-foreground italic">
            "{report.conversation_starter.slice(0, 60)}..."
          </p>
        </div>
      )}
    </Card>
  );
};
