import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import DOMPurify from "dompurify";
import type { Decoration } from "@/hooks/useChildRoom";

// Sanitize SVG content to prevent XSS attacks
const sanitizeSvg = (svgData: string): string => {
  return DOMPurify.sanitize(svgData, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
};

interface DecorationShopProps {
  decorations: Decoration[];
  childPoints: number;
  purchasing: string | null;
  onPurchase: (decoration: Decoration) => void;
}

export function DecorationShop({
  decorations,
  childPoints,
  purchasing,
  onPurchase,
}: DecorationShopProps) {
  return (
    <>
      <Card className="p-4 mb-4 bg-accent/10 border-accent/20">
        <div className="flex items-center justify-between">
          <span className="font-medium">Your Points</span>
          <span className="text-2xl font-bold text-accent">
            {childPoints} ⭐
          </span>
        </div>
      </Card>

      {decorations.length === 0 ? (
        <Card className="p-12 text-center">
          <Check className="w-12 h-12 mx-auto mb-4 text-success" />
          <h3 className="text-xl font-semibold mb-2">You own everything!</h3>
          <p className="text-muted-foreground">
            Check back later for new items.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {decorations.map((deco) => {
            const canAfford = childPoints >= deco.points_cost;
            return (
              <DecorationCard
                key={deco.id}
                decoration={deco}
                canAfford={canAfford}
                isPurchasing={purchasing === deco.id}
                onPurchase={() => onPurchase(deco)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

interface DecorationCardProps {
  decoration: Decoration;
  canAfford: boolean;
  isPurchasing: boolean;
  onPurchase: () => void;
}

function DecorationCard({
  decoration,
  canAfford,
  isPurchasing,
  onPurchase,
}: DecorationCardProps) {
  return (
    <Card
      className={`p-4 text-center ${canAfford ? "hover-scale" : "opacity-60"}`}
    >
      <div
        className="w-16 h-16 mx-auto mb-2"
        dangerouslySetInnerHTML={{ __html: sanitizeSvg(decoration.svg_data) }}
      />
      <h4 className="font-medium text-sm mb-1">{decoration.name}</h4>
      <p className="text-lg font-bold text-accent mb-2">
        {decoration.points_cost} ⭐
      </p>
      <Button
        size="sm"
        className="w-full"
        disabled={!canAfford || isPurchasing}
        onClick={onPurchase}
      >
        {isPurchasing ? "Buying..." : canAfford ? "Buy" : "Need more ⭐"}
      </Button>
    </Card>
  );
}
