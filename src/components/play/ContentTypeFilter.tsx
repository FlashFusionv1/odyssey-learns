import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import { CONTENT_TYPE_ICONS, CONTENT_TYPE_LABELS } from "./constants";

interface ContentTypeFilterProps {
  contentTypes: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function ContentTypeFilter({
  contentTypes,
  selectedType,
  onTypeChange,
}: ContentTypeFilterProps) {
  return (
    <Tabs value={selectedType} onValueChange={onTypeChange}>
      <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-muted/50 p-2">
        <TabsTrigger value="all" className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          All
        </TabsTrigger>
        {contentTypes.map((type) => {
          const Icon = CONTENT_TYPE_ICONS[type];
          return (
            <TabsTrigger key={type} value={type} className="flex items-center gap-1.5">
              {Icon && <Icon className="w-4 h-4" />}
              {CONTENT_TYPE_LABELS[type] || type}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
