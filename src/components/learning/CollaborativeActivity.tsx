import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CollaborativeActivityProps {
  childId: string;
  lessonId: string;
}

export const CollaborativeActivity = ({ childId, lessonId }: CollaborativeActivityProps) => {
  const [availableFriends, setAvailableFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, [childId]);

  const loadFriends = async () => {
    // Get siblings (same parent) as potential collaboration partners
    const { data: child } = await supabase
      .from('children')
      .select('parent_id')
      .eq('id', childId)
      .single();

    if (child) {
      const { data: siblings } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', child.parent_id)
        .neq('id', childId);

      setAvailableFriends(siblings || []);
    }
  };

  const loadRequests = async () => {
    const { data } = await supabase
      .from('collaboration_requests')
      .select('*, requester:children!collaboration_requests_requester_child_id_fkey(name), recipient:children!collaboration_requests_recipient_child_id_fkey(name)')
      .or(`requester_child_id.eq.${childId},recipient_child_id.eq.${childId}`)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false });

    setRequests(data || []);
  };

  const sendRequest = async () => {
    if (!selectedFriend) return;

    setLoading(true);
    const { error } = await supabase
      .from('collaboration_requests')
      .insert({
        requester_child_id: childId,
        recipient_child_id: selectedFriend,
        lesson_id: lessonId,
        status: 'pending',
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Sent! 🤝",
        description: "Waiting for parent approval...",
      });
      loadRequests();
      setSelectedFriend("");
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Collaborative Learning</h3>
          <p className="text-sm text-muted-foreground">Learn together with friends!</p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="mb-4 p-3 bg-info/10 border border-info/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-info mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">Parent Safety:</strong> Your parent can see 
            everything you share with friends and must approve all collaboration requests.
          </div>
        </div>
      </div>

      {/* Invite Friends */}
      {availableFriends.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 gap-2">
              <Users className="w-4 h-4" />
              Invite a Friend to This Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background z-50">
            <DialogHeader>
              <DialogTitle>Invite a Friend</DialogTitle>
              <DialogDescription>
                Choose a sibling to work with on this lesson. Your parent will review the request.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Select value={selectedFriend} onValueChange={setSelectedFriend}>
                <SelectTrigger className="bg-background z-50">
                  <SelectValue placeholder="Select a friend..." />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {availableFriends.map((friend) => (
                    <SelectItem key={friend.id} value={friend.id} className="cursor-pointer">
                      {friend.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={sendRequest} 
                disabled={!selectedFriend || loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Collaboration Requests */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Your Collaboration Requests</h4>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No collaboration requests yet
          </p>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {request.requester?.name?.charAt(0) || request.recipient?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {request.requester_child_id === childId 
                        ? `To: ${request.recipient?.name}` 
                        : `From: ${request.requester?.name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <span className="text-xs font-medium capitalize">
                    {request.status}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};
