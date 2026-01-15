import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import {
  useInteractiveContent,
  useContentTypes,
  filterContentByType,
  type InteractiveContent,
} from "@/hooks/useInteractiveContent";
import {
  ActivityCard,
  ActivityPlayer,
  CalmZone,
  ContentTypeFilter,
  EmptyState,
} from "@/components/play";

export default function Play() {
  const { childId, isValidating } = useValidatedChild();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeActivity, setActiveActivity] = useState<InteractiveContent | null>(null);

  const { data: content, isLoading, refetch } = useInteractiveContent({
    enabled: !!childId,
  });

  const contentTypes = useContentTypes(content);
  const filteredContent = filterContentByType(content, selectedType);

  const handlePlay = (item: InteractiveContent) => {
    setActiveActivity(item);
  };

  const handleClosePlayer = () => {
    setActiveActivity(null);
    refetch(); // Refresh to update play counts
  };

  const handleComplete = (score: number, pointsEarned: number) => {
    console.log(`Activity completed - Score: ${score}%, Points: ${pointsEarned}`);
  };

  if (isValidating || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" />
          Play Zone
        </h1>
        <p className="text-muted-foreground mt-1">
          Games, stories, and activities just for you!
        </p>
      </header>

      <ContentTypeFilter
        contentTypes={contentTypes}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      <TabsContent value={selectedType} className="mt-0">
        {filteredContent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item) => (
              <ActivityCard key={item.id} activity={item} onPlay={handlePlay} />
            ))}
          </div>
        )}
      </TabsContent>

      {content && <CalmZone activities={content} onPlay={handlePlay} />}

      {/* Activity Player Modal */}
      {activeActivity && childId && (
        <ActivityPlayer
          activity={activeActivity}
          childId={childId}
          onClose={handleClosePlayer}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
