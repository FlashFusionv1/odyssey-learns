import { Card } from "@/components/ui/card";
import type { Decoration } from "@/hooks/useChildRoom";

interface RoomDisplayProps {
  decorations: Decoration[];
}

export function RoomDisplay({ decorations }: RoomDisplayProps) {
  return (
    <Card className="p-6 min-h-[300px] bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-900/20 dark:to-sky-800/10 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {decorations.length === 0 ? (
          <p className="text-muted-foreground">
            Visit the shop to get decorations!
          </p>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center items-end p-4">
            {decorations.map((deco) => (
              <div
                key={deco.id}
                className="flex flex-col items-center gap-1 hover-scale cursor-pointer"
              >
                <div
                  className="w-20 h-20"
                  dangerouslySetInnerHTML={{ __html: deco.svg_data }}
                />
                <span className="text-xs text-muted-foreground">
                  {deco.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
