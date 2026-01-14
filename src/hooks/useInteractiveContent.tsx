import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InteractiveContent {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  grade_level_min: number;
  grade_level_max: number;
  subject: string | null;
  estimated_minutes: number | null;
  points_value: number | null;
  content_data: Record<string, unknown>;
  play_count: number | null;
  avg_rating: number | null;
  is_premium: boolean | null;
  thumbnail_url: string | null;
}

interface UseInteractiveContentOptions {
  enabled?: boolean;
  gradeLevel?: number;
  contentType?: string;
}

export function useInteractiveContent(options: UseInteractiveContentOptions = {}) {
  const { enabled = true, gradeLevel, contentType } = options;

  return useQuery({
    queryKey: ["interactive-content", gradeLevel, contentType],
    queryFn: async () => {
      let query = supabase
        .from("interactive_content")
        .select("*")
        .eq("is_active", true)
        .order("play_count", { ascending: false });

      if (gradeLevel !== undefined) {
        query = query
          .lte("grade_level_min", gradeLevel)
          .gte("grade_level_max", gradeLevel);
      }

      if (contentType && contentType !== "all") {
        query = query.eq("content_type", contentType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as InteractiveContent[];
    },
    enabled,
  });
}

export function useContentTypes(content: InteractiveContent[] | undefined) {
  if (!content) return [];
  return [...new Set(content.map((c) => c.content_type))];
}

export function filterContentByType(
  content: InteractiveContent[] | undefined,
  type: string
): InteractiveContent[] {
  if (!content) return [];
  if (type === "all") return content;
  return content.filter((c) => c.content_type === type);
}
