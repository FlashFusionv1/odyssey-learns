import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const trackLessonView = async (lessonId: string, childId: string) => {
  try {
    await supabase.functions.invoke('track-lesson-analytics', {
      body: {
        lessonId,
        childId,
        eventType: 'view'
      }
    });
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

export const trackLessonSave = async (lessonId: string, childId: string) => {
  try {
    const { error } = await supabase.functions.invoke('track-lesson-analytics', {
      body: {
        lessonId,
        childId,
        eventType: 'save'
      }
    });

    if (error) throw error;
    toast.success('Lesson saved!');
  } catch (error) {
    console.error('Error tracking save:', error);
    toast.error('Failed to save lesson');
  }
};

export const trackLessonShare = async (lessonId: string, childId: string) => {
  try {
    const { error } = await supabase.functions.invoke('track-lesson-analytics', {
      body: {
        lessonId,
        childId,
        eventType: 'share'
      }
    });

    if (error) throw error;
    toast.success('Lesson shared!');
  } catch (error) {
    console.error('Error tracking share:', error);
    toast.error('Failed to share lesson');
  }
};