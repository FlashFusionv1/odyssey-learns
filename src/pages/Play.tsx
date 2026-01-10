import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, BookOpen, Palette, Heart, Music, Puzzle, Play as PlayIcon, Star, Clock, Sparkles } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface InteractiveContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  grade_level_min: number;
  grade_level_max: number;
  subject: string;
  estimated_minutes: number;
  points_value: number;
  content_data: Record<string, unknown>;
  play_count: number;
  avg_rating: number | null;
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  game: <Gamepad2 className="w-5 h-5" />,
  story: <BookOpen className="w-5 h-5" />,
  adventure: <Sparkles className="w-5 h-5" />,
  coloring: <Palette className="w-5 h-5" />,
  self_soothing: <Heart className="w-5 h-5" />,
  roleplay: <Star className="w-5 h-5" />,
  video: <PlayIcon className="w-5 h-5" />,
  music: <Music className="w-5 h-5" />,
  puzzle: <Puzzle className="w-5 h-5" />,
  quiz_game: <Gamepad2 className="w-5 h-5" />,
};

const contentTypeLabels: Record<string, string> = {
  game: "Games",
  story: "Stories",
  adventure: "Adventures",
  coloring: "Coloring",
  self_soothing: "Calm Down",
  roleplay: "Role Play",
  video: "Videos",
  music: "Music",
  puzzle: "Puzzles",
  quiz_game: "Quiz Games",
};

const subjectColors: Record<string, string> = {
  math: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  reading: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  science: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  social: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  lifeskills: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

export default function Play() {
  const { childId, isValidating } = useValidatedChild();
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["interactive-content", childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interactive_content")
        .select("*")
        .eq("is_active", true)
        .order("play_count", { ascending: false });

      if (error) throw error;
      return data as InteractiveContent[];
    },
    enabled: !!childId,
  });

  if (isValidating || contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredContent = selectedType === "all" 
    ? content 
    : content?.filter(c => c.content_type === selectedType);

  const contentTypes = [...new Set(content?.map(c => c.content_type) || [])];

  const handlePlay = (item: InteractiveContent) => {
    // TODO: Implement activity player based on content_type
    console.log("Playing:", item);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" />
          Play Zone
        </h1>
        <p className="text-muted-foreground mt-1">
          Games, stories, and activities just for you!
        </p>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedType}>
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-muted/50 p-2">
          <TabsTrigger value="all" className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            All
          </TabsTrigger>
          {contentTypes.map(type => (
            <TabsTrigger key={type} value={type} className="flex items-center gap-1.5">
              {contentTypeIcons[type]}
              {contentTypeLabels[type] || type}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedType} className="mt-0">
          {filteredContent?.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Puzzle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No activities found</h3>
                <p className="text-muted-foreground">Try selecting a different category!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent?.map((item) => (
                <Card 
                  key={item.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                  onClick={() => handlePlay(item)}
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                    <div className="text-5xl opacity-50 group-hover:scale-110 transition-transform">
                      {contentTypeIcons[item.content_type]}
                    </div>
                    <Badge className="absolute top-2 right-2 text-xs">
                      +{item.points_value} ⭐
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2 text-xs">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${subjectColors[item.subject] || ""}`}
                        >
                          {item.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.estimated_minutes}m
                        </span>
                      </div>
                      <Button size="sm" className="h-7 text-xs">
                        <PlayIcon className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Featured Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Calm & Relax
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content?.filter(c => c.content_type === "self_soothing").slice(0, 4).map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800"
              onClick={() => handlePlay(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.estimated_minutes} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
