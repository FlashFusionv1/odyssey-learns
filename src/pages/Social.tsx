import { useValidatedChild } from "@/hooks/useValidatedChild";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeerConnectionsUI } from "@/components/social/PeerConnectionsUI";
import { SharedActivitiesUI } from "@/components/social/SharedActivitiesUI";
import { Users, Sparkles, Trophy, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChildData {
  id: string;
  name: string;
  total_points: number | null;
  grade_level: number;
}

const Social = () => {
  const { childId, isValidating } = useValidatedChild();
  const [child, setChild] = useState<ChildData | null>(null);
  const [friendCount, setFriendCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    if (childId) {
      loadChild();
      loadStats();
    }
  }, [childId]);

  const loadChild = async () => {
    const { data } = await supabase
      .from("children")
      .select("id, name, total_points, grade_level")
      .eq("id", childId)
      .single();
    setChild(data);
  };

  const loadStats = async () => {
    // Get friend count
    const { count: friends } = await supabase
      .from("peer_connections")
      .select("*", { count: "exact", head: true })
      .or(`requester_id.eq.${childId},recipient_id.eq.${childId}`)
      .eq("status", "accepted");
    
    setFriendCount(friends || 0);

    // Get shared activity count
    const { count: activities } = await supabase
      .from("activity_participants")
      .select("*", { count: "exact", head: true })
      .eq("child_id", childId);
    
    setActivityCount(activities || 0);
  };

  if (isValidating || !child) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          Social Learning
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect with friends and learn together
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{friendCount}</p>
              <p className="text-xs text-muted-foreground">Friends</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary/10">
              <Sparkles className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activityCount}</p>
              <p className="text-xs text-muted-foreground">Activities</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{child.total_points || 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <Badge variant="secondary" className="text-xs">
                Grade {child.grade_level}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Your Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="friends">
            <Users className="w-4 h-4 mr-2" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Sparkles className="w-4 h-4 mr-2" />
            Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <PeerConnectionsUI childId={childId!} />
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <SharedActivitiesUI childId={childId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Social;