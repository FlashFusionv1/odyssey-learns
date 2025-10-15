import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, Trophy, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ChallengeModetoggleProps {
  childId: string;
  challengeModeEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const ChallengeModeToggle = ({ 
  childId, 
  challengeModeEnabled, 
  onToggle 
}: ChallengeModetoggleProps) => {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (enabled: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from('children')
      .update({ challenge_mode_enabled: enabled })
      .eq('id', childId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      onToggle(enabled);
      toast({
        title: enabled ? "Challenge Mode Activated! ⚡" : "Challenge Mode Disabled",
        description: enabled 
          ? "Get ready for harder problems and bonus points!"
          : "Back to normal difficulty.",
      });
      setShowDialog(false);
    }
    setLoading(false);
  };

  return (
    <Card className={`p-6 transition-all ${
      challengeModeEnabled 
        ? 'bg-gradient-to-br from-accent/20 to-warning/20 border-accent' 
        : 'bg-card'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            challengeModeEnabled 
              ? 'bg-accent/20 animate-pulse' 
              : 'bg-muted'
          }`}>
            <Zap className={`w-6 h-6 ${
              challengeModeEnabled ? 'text-accent' : 'text-muted-foreground'
            }`} />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Challenge Mode</h3>
              {challengeModeEnabled && (
                <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {challengeModeEnabled 
                ? "You're tackling harder problems for extra rewards! Keep pushing yourself!"
                : "Ready for a bigger challenge? Turn this on for harder questions and bonus points!"
              }
            </p>
          </div>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <div>
              <Switch
                checked={challengeModeEnabled}
                disabled={loading}
                onCheckedChange={() => setShowDialog(true)}
              />
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {challengeModeEnabled ? (
                  <AlertCircle className="w-5 h-5 text-warning" />
                ) : (
                  <Trophy className="w-5 h-5 text-accent" />
                )}
                {challengeModeEnabled 
                  ? "Disable Challenge Mode?" 
                  : "Activate Challenge Mode?"}
              </DialogTitle>
              <DialogDescription className="space-y-4">
                {challengeModeEnabled ? (
                  <div className="space-y-2">
                    <p>You'll return to normal difficulty lessons.</p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                      <li>Standard questions</li>
                      <li>Regular point values (125 points)</li>
                      <li>Hints available</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium">Challenge Mode includes:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                      <li>Harder, more complex problems</li>
                      <li>Fewer hints available</li>
                      <li>Open-ended questions</li>
                      <li>🎉 Bonus points: <strong>150 instead of 125</strong></li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4">
                      You can turn this off anytime if it feels too hard!
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleToggle(!challengeModeEnabled)}
                disabled={loading}
                variant={challengeModeEnabled ? "destructive" : "default"}
              >
                {loading ? "Updating..." : challengeModeEnabled ? "Disable" : "Activate"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {challengeModeEnabled && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="font-medium">Bonus: +25 points per lesson</span>
          </div>
        </div>
      )}
    </Card>
  );
};
