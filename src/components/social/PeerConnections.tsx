import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Check, X, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PeerConnectionsProps {
  childId: string;
}

export const PeerConnections = ({ childId }: PeerConnectionsProps) => {
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConnections();
  }, [childId]);

  const loadConnections = async () => {
    if (!childId) return;

    // Load accepted connections
    const { data: acceptedData } = await supabase
      .from("peer_connections")
      .select("*, peer:children!peer_connections_peer_id_fkey(id, name, grade_level)")
      .eq("child_id", childId)
      .eq("status", "accepted");

    // Load pending incoming requests
    const { data: pendingData } = await supabase
      .from("peer_connections")
      .select("*, requester:children!peer_connections_child_id_fkey(id, name, grade_level)")
      .eq("peer_id", childId)
      .eq("status", "pending");

    setConnections(acceptedData || []);
    setPendingRequests(pendingData || []);
    setLoading(false);
  };

  const searchPeers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const { data } = await supabase
      .from("children")
      .select("id, name, grade_level")
      .neq("id", childId)
      .ilike("name", `%${searchQuery}%`)
      .limit(10);

    setSearchResults(data || []);
  };

  const sendConnectionRequest = async (peerId: string) => {
    const { error } = await supabase.from("peer_connections").insert({
      child_id: childId,
      peer_id: peerId,
      status: "pending",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request sent!",
      description: "Connection request sent successfully",
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("peer_connections")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Connection accepted!",
      description: "You are now connected",
    });
    loadConnections();
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("peer_connections")
      .delete()
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request declined",
      description: "Connection request declined",
    });
    loadConnections();
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
      {/* Search Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Find Learning Friends
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchPeers()}
          />
          <Button onClick={searchPeers}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{peer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{peer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Grade {peer.grade_level}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => sendConnectionRequest(peer.id)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {request.requester.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.requester.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Grade {request.requester.grade_level}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectRequest(request.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => acceptRequest(request.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* My Connections */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          My Learning Friends ({connections.length})
        </h3>
        {connections.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No connections yet. Search for friends above!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center gap-3 p-4 rounded-lg border"
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {connection.peer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{connection.peer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Grade {connection.peer.grade_level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};