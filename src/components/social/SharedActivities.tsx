import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Calendar, Trophy } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";

interface SharedActivitiesProps {
  childId: string;
}

export const SharedActivities = ({ childId }: SharedActivitiesProps) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    activity_type: "quiz",
    max_participants: 4,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [childId]);

  const loadActivities = async () => {
    if (!childId) return;

    const { data } = await supabase
      .from("shared_activities")
      .select(`
        *,
        creator:children!shared_activities_created_by_fkey(name),
        participants:activity_participants(
          id,
          child:children(id, name)
        )
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    setActivities(data || []);
    setLoading(false);
  };

  const createActivity = async () => {
    if (!newActivity.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("shared_activities").insert({
      ...newActivity,
      created_by: childId,
      status: "open",
    });

    if (error) {
      console.error("Error creating activity:", error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Activity created!",
      description: "Your shared activity is now open for others to join",
    });

    setShowCreateDialog(false);
    setNewActivity({
      title: "",
      description: "",
      activity_type: "quiz",
      max_participants: 4,
    });
    loadActivities();
  };

  const joinActivity = async (activityId: string) => {
    const { error } = await supabase.from("activity_participants").insert({
      activity_id: activityId,
      child_id: childId,
      status: "active",
    });

    if (error) {
      console.error("Error joining activity:", error);
      toast({
        title: "Error",
        description: "Failed to join activity",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Joined!",
      description: "You've joined the activity",
    });
    loadActivities();
  };

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      quiz: "bg-blue-500",
      discussion: "bg-green-500",
      project: "bg-purple-500",
      challenge: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Shared Learning Activities
        </h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Shared Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="activity-title" className="text-sm font-medium">Title</label>
                <Input
                  id="activity-title"
                  name="activity-title"
                  value={newActivity.title}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, title: e.target.value })
                  }
                  placeholder="e.g., Math Challenge for Grade 5"
                />
              </div>
              <div>
                <label htmlFor="activity-description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="activity-description"
                  name="activity-description"
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the activity..."
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="activity-type" className="text-sm font-medium">Activity Type</label>
                <Select
                  value={newActivity.activity_type}
                  onValueChange={(value) =>
                    setNewActivity({ ...newActivity, activity_type: value })
                  }
                >
                  <SelectTrigger id="activity-type" name="activity-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="activity-max-participants" className="text-sm font-medium">Max Participants</label>
                <Input
                  id="activity-max-participants"
                  name="activity-max-participants"
                  type="number"
                  min="2"
                  max="10"
                  value={newActivity.max_participants}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      max_participants: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <Button onClick={createActivity} className="w-full">
                Create Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activities.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            No shared activities yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Create an activity to learn together with friends!
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Activity
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => {
            const participantCount = activity.participants?.length || 0;
            const isFull = participantCount >= activity.max_participants;
            const isParticipant = activity.participants?.some(
              (p: any) => p.child.id === childId
            );

            return (
              <Card key={activity.id} className="p-6 hover-scale">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge
                      className={`${getActivityTypeColor(
                        activity.activity_type
                      )} text-white`}
                    >
                      {activity.activity_type}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {participantCount}/{activity.max_participants}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Created by {activity.creator.name}
                  </div>

                  {!isParticipant && !isFull && (
                    <Button
                      className="w-full"
                      onClick={() => joinActivity(activity.id)}
                    >
                      Join Activity
                    </Button>
                  )}

                  {isParticipant && (
                    <Button className="w-full" variant="outline" disabled>
                      <Trophy className="w-4 h-4 mr-2" />
                      Already Joined
                    </Button>
                  )}

                  {isFull && !isParticipant && (
                    <Button className="w-full" variant="outline" disabled>
                      Activity Full
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};