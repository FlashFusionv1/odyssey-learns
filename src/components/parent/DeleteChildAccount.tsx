import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeleteChildAccountProps {
  childId: string;
  childName: string;
  onDeleted: () => void;
}

export function DeleteChildAccount({ childId, childName, onDeleted }: DeleteChildAccountProps) {
  const [step, setStep] = useState<'initial' | 'confirm'>('initial');
  const [nameConfirmation, setNameConfirmation] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleScheduleDeletion = async () => {
    if (nameConfirmation !== childName || deleteConfirmation !== 'DELETE') {
      toast({
        title: 'Confirmation failed',
        description: 'Please type the exact values as requested.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('delete-child-account', {
        body: { 
          child_id: childId,
          action: 'schedule'
        }
      });

      if (error) throw error;

      toast({
        title: 'Deletion scheduled',
        description: `${childName}'s account will be permanently deleted in 7 days. You can cancel this at any time within the next 7 days.`
      });

      onDeleted();
    } catch (error: any) {
      toast({
        title: 'Deletion failed',
        description: error.message || 'Failed to schedule deletion. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('delete-child-account', {
        body: { 
          child_id: childId,
          action: 'cancel'
        }
      });

      if (error) throw error;

      toast({
        title: 'Deletion cancelled',
        description: `${childName}'s account deletion has been cancelled.`
      });

      onDeleted();
    } catch (error: any) {
      toast({
        title: 'Cancellation failed',
        description: error.message || 'Failed to cancel deletion. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Delete {childName}'s Account
        </CardTitle>
        <CardDescription>
          Permanently delete this child's account and all associated data. 
          This action cannot be undone after the 7-day grace period.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-destructive">Warning: This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All profile information</li>
                <li>Learning progress and quiz scores</li>
                <li>Emotion check-ins and reflections</li>
                <li>Activity history and screen time logs</li>
                <li>Created content and lessons</li>
                <li>Parent-child messages</li>
              </ul>
              <p className="text-destructive font-semibold mt-3">
                This is required by COPPA to give you full control over your child's data.
              </p>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  This will schedule {childName}'s account for deletion. You have 7 days to change your mind.
                </p>
                
                <div className="space-y-3 pt-4">
                  <div>
                    <Label htmlFor="name-confirm">
                      Type the child's name to confirm: <strong>{childName}</strong>
                    </Label>
                    <Input
                      id="name-confirm"
                      value={nameConfirmation}
                      onChange={(e) => setNameConfirmation(e.target.value)}
                      placeholder={childName}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="delete-confirm">
                      Type <strong>DELETE</strong> to confirm:
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      className="mt-1"
                    />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleScheduleDeletion}
                disabled={nameConfirmation !== childName || deleteConfirmation !== 'DELETE' || loading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {loading ? 'Processing...' : 'Schedule Deletion'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Grace Period:</p>
          <p>
            After scheduling deletion, you have 7 days to cancel. After 7 days, 
            the account and all data will be permanently deleted and cannot be recovered.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
