import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface TopicSuggestionsProps {
  suggestions: string[];
  visible: boolean;
  disabled: boolean;
  onSelect: (topic: string) => void;
}

export function TopicSuggestions({
  suggestions,
  visible,
  disabled,
  onSelect,
}: TopicSuggestionsProps) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-2"
      >
        <label className="text-sm text-muted-foreground">💡 Try one of these:</label>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => onSelect(suggestion)}
              disabled={disabled}
              className="rounded-full hover:bg-primary/10 hover:border-primary"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
