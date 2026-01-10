import { Card, CardContent } from "@/components/ui/card";
import { Puzzle } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Puzzle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No activities found</h3>
        <p className="text-muted-foreground">Try selecting a different category!</p>
      </CardContent>
    </Card>
  );
}
