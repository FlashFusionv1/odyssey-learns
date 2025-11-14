import { Button } from "@/components/ui/button";
import { Save, Share2 } from "lucide-react";
import { trackLessonSave, trackLessonShare } from "@/hooks/useLessonAnalytics";

interface LessonActionButtonsProps {
  lessonId: string;
  childId: string;
}

export const LessonActionButtons = ({ lessonId, childId }: LessonActionButtonsProps) => {
  const handleSave = async () => {
    await trackLessonSave(lessonId, childId);
  };

  const handleShare = async () => {
    await trackLessonShare(lessonId, childId);
    
    // Copy link to clipboard
    const link = `${window.location.origin}/lessons/${lessonId}`;
    await navigator.clipboard.writeText(link);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleSave}>
        <Save className="w-4 h-4 mr-2" />
        Save
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  );
};