/**
 * PeerConnectionApprovals Component
 * 
 * Displays pending peer connection requests for a parent's children
 * and allows the parent to approve or reject connections.
 * 
 * COPPA compliant - requires parental approval before children can connect.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Users, UserCheck, UserX, Clock, Shield, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistanceToNow } from 'date-fns';

interface PeerRequest {
  id: string;
  child_id: string;
  peer_id: string;
  status: string;
  requested_at: string | null;
  accepted_at: string | null;
  parent_approved: boolean | null;
  parent_approved_at: string | null;
  parent_approved_by: string | null;
  rejection_reason: string | null;
  child: {
    id: string;
    name: string;
    grade_level: number;
  };
  peer: {
    id: string;
    name: string;
    grade_level: number;
  };
}

export const PeerConnectionApprovals = () => {
  const [pendingRequests, setPendingRequests] = useState<PeerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PeerRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPendingRequests();
      subscribeToRequests();
    }
  }, [user]);

  const loadPendingRequests = async () => {
    if (!user) return;

    try {
      // Get all children for this parent
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id);

      if (!children || children.length === 0) {
        setPendingRequests([]);
        setLoading(false);
        return;
      }

      const childIds = children.map(c => c.id);

      // Get pending connections where parent hasn't approved yet
      const { data: requests, error } = await supabase
        .from('peer_connections')
        .select(`
          id,
          child_id,
          peer_id,
          status,
          requested_at,
          accepted_at,
          parent_approved,
          parent_approved_at,
          parent_approved_by,
          rejection_reason,
          child:children!peer_connections_child_id_fkey(id, name, grade_level),
          peer:children!peer_connections_peer_id_fkey(id, name, grade_level)
        `)
        .in('child_id', childIds)
        .or('parent_approved.is.null,parent_approved.eq.false')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      // Also get requests where our children are the peer (incoming requests)
      const { data: incomingRequests, error: incomingError } = await supabase
        .from('peer_connections')
        .select(`
          id,
          child_id,
          peer_id,
          status,
          requested_at,
          accepted_at,
          parent_approved,
          parent_approved_at,
          parent_approved_by,
          rejection_reason,
          child:children!peer_connections_child_id_fkey(id, name, grade_level),
          peer:children!peer_connections_peer_id_fkey(id, name, grade_level)
        `)
        .in('peer_id', childIds)
        .or('parent_approved.is.null,parent_approved.eq.false')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (incomingError) throw incomingError;

      // Combine and deduplicate
      const allRequests = [...(requests || []), ...(incomingRequests || [])];
      const uniqueRequests = allRequests.filter(
        (req, index, self) => index === self.findIndex(r => r.id === req.id)
      ) as unknown as PeerRequest[];

      setPendingRequests(uniqueRequests);
    } catch (error) {
      console.error('Error loading peer requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load peer connection requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRequests = () => {
    const channel = supabase
      .channel('peer_connection_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'peer_connections' },
        () => {
          loadPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const approveConnection = async (request: PeerRequest) => {
    setProcessing(request.id);

    try {
      const { error } = await supabase
        .from('peer_connections')
        .update({
          parent_approved: true,
          parent_approved_at: new Date().toISOString(),
          parent_approved_by: user?.id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (error) throw error;

      // Mark related notification as actioned
      await supabase
        .from('parent_notifications')
        .update({
          is_read: true,
          action_taken_at: new Date().toISOString(),
        })
        .eq('action_data->>peer_connection_id', request.id);

      toast({
        title: 'Connection Approved! 🎉',
        description: `${request.child.name} and ${request.peer.name} are now learning friends!`,
      });

      loadPendingRequests();
    } catch (error) {
      console.error('Error approving connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve connection',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const openRejectDialog = (request: PeerRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const rejectConnection = async () => {
    if (!selectedRequest) return;

    setProcessing(selectedRequest.id);

    try {
      const { error } = await supabase
        .from('peer_connections')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason || 'Parent declined',
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Mark related notification as actioned
      await supabase
        .from('parent_notifications')
        .update({
          is_read: true,
          action_taken_at: new Date().toISOString(),
        })
        .eq('action_data->>peer_connection_id', selectedRequest.id);

      toast({
        title: 'Connection Declined',
        description: 'The connection request has been declined.',
      });

      setRejectDialogOpen(false);
      loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline connection',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return null; // Don't show card if no pending requests
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Pending Friend Requests</CardTitle>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {pendingRequests.length}
              </Badge>
            </div>
          </div>
          <CardDescription className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Your approval is required for your children to connect with peers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-lg border bg-background p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <Avatar className="border-2 border-background">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {request.child.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="border-2 border-background">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {request.peer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="font-medium">
                    <span className="text-primary">{request.child.name}</span>
                    {' '}↔{' '}
                    <span className="text-secondary">{request.peer.name}</span>
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>Grade {request.child.grade_level} & Grade {request.peer.grade_level}</span>
                    <Clock className="ml-2 h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openRejectDialog(request)}
                  disabled={processing === request.id}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <UserX className="mr-1 h-4 w-4" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => approveConnection(request)}
                  disabled={processing === request.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing === request.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <UserCheck className="mr-1 h-4 w-4" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Connection Request?</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  You're about to decline the connection between{' '}
                  <strong>{selectedRequest.child.name}</strong> and{' '}
                  <strong>{selectedRequest.peer.name}</strong>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Reason (optional, for your records)
            </label>
            <Textarea
              placeholder="e.g., Don't know this family"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={rejectConnection}
              disabled={processing !== null}
            >
              {processing ? <LoadingSpinner size="sm" /> : 'Decline Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
