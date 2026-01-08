import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Share2, Loader2 } from "lucide-react";

interface RequestShareButtonProps {
  lessonId: string;
  currentStatus: string;
  onStatusChange?: () => void;
}

export const RequestShareButton = ({ lessonId, currentStatus, onStatusChange }: RequestShareButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestShare = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('request-lesson-share', {
        body: { lessonId }
      });

      if (error) throw error;

      toast.success('Share request submitted! Waiting for parent approval.');
      setOpen(false);
      onStatusChange?.();
    } catch (err) {
      console.error('Error requesting share:', err);
      toast.error('Failed to request share approval');
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'public') {
    return (
      <Button variant="outline" disabled>
        <Share2 className="w-4 h-4 mr-2" />
        Public
      </Button>
    );
  }

  if (currentStatus === 'pending_approval') {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Pending Approval
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Request to Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to Share Publicly</DialogTitle>
          <DialogDescription>
            Submit this lesson for parent approval to share it with the community. Once approved, other students can learn from your creation!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Your parent will review the lesson and decide whether to approve it for public sharing. You'll receive a notification once they make a decision.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRequestShare} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};