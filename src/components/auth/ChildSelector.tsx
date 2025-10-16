import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Child {
  id: string;
  name: string;
  grade_level: number;
  avatar_config: any;
  total_points: number;
}

interface ChildSelectorProps {
  children: Child[];
  onSelect: (childId: string) => void;
}

export const ChildSelector = ({ children, onSelect }: ChildSelectorProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
      {children.map((child) => (
        <Card
          key={child.id}
          className={cn(
            "p-6 cursor-pointer elevated-card hover-scale",
            "flex flex-col items-center gap-4 text-center"
          )}
          onClick={() => onSelect(child.id)}
        >
          <AvatarDisplay 
            config={child.avatar_config}
            name={child.name}
            size="large"
          />
          
          <div>
            <h3 className="text-xl font-semibold">{child.name}</h3>
            <p className="text-sm text-muted-foreground">Grade {child.grade_level}</p>
            <p className="text-sm font-medium text-accent mt-2">{child.total_points} points</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
