import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Home, ShoppingBag, Sparkles, Check } from "lucide-react";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import { useChildRoom, type Decoration } from "@/hooks/useChildRoom";
import { RoomDisplay } from "@/components/room/RoomDisplay";
import { DecorationShop } from "@/components/room/DecorationShop";

const KidsRoom = () => {
  const { childId, isValidating } = useValidatedChild();
  const {
    child,
    ownedDecorations,
    shopDecorations,
    loading,
    purchasing,
    purchaseDecoration,
  } = useChildRoom(childId);

  if (isValidating || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AppLayout childName={child?.name} points={child?.total_points || 0}>
      <div className="space-y-8 animate-fade-in">
        <header className="text-center py-6">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent items-center justify-center mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">My Room</h1>
          <p className="text-muted-foreground">
            Decorate your space with awesome stuff!
          </p>
        </header>

        <Tabs defaultValue="room" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="room" className="gap-2">
              <Sparkles className="w-4 h-4" /> My Room
            </TabsTrigger>
            <TabsTrigger value="shop" className="gap-2">
              <ShoppingBag className="w-4 h-4" /> Deco Shop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="room" className="mt-6">
            <RoomDisplay decorations={ownedDecorations} />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              You have {ownedDecorations.length} decoration
              {ownedDecorations.length !== 1 ? "s" : ""}
            </p>
          </TabsContent>

          <TabsContent value="shop" className="mt-6">
            <DecorationShop
              decorations={shopDecorations}
              childPoints={child?.total_points || 0}
              purchasing={purchasing}
              onPurchase={purchaseDecoration}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default KidsRoom;
