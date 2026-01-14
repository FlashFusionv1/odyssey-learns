import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Trash2,
  Smartphone
} from "lucide-react";
import { usePWA, UpdateStatus } from "@/hooks/usePWA";
import { getUpdateHistory } from "@/lib/updateLogger";
import { fullReset } from "@/lib/clearCache";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function getStatusIcon(status: UpdateStatus) {
  switch (status) {
    case 'checking':
      return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    case 'available':
      return <Download className="w-4 h-4 text-primary" />;
    case 'updating':
      return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    default:
      return <CheckCircle className="w-4 h-4 text-green-500" />;
  }
}

function getStatusText(status: UpdateStatus) {
  switch (status) {
    case 'checking':
      return 'Checking for updates...';
    case 'available':
      return 'Update available';
    case 'updating':
      return 'Installing update...';
    case 'error':
      return 'Update check failed';
    default:
      return 'Up to date';
  }
}

function formatDate(date: Date | null): string {
  if (!date) return 'Never';
  return date.toLocaleString();
}

export function PWASettingsCard() {
  const { 
    appVersion, 
    updateStatus, 
    lastChecked, 
    lastUpdateTime,
    checkForUpdates, 
    forceUpdate,
    updateServiceWorker,
    needRefresh,
    isStandalone 
  } = usePWA();
  
  const [isClearing, setIsClearing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await fullReset();
    } catch (error) {
      console.error('Failed to clear data:', error);
      setIsClearing(false);
    }
  };

  const updateHistory = getUpdateHistory();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">App Updates</CardTitle>
          </div>
          {isStandalone && (
            <Badge variant="secondary" className="text-xs">
              Installed
            </Badge>
          )}
        </div>
        <CardDescription>
          Manage app updates and cached data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Version Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Version</span>
          <span className="font-mono">{appVersion}</span>
        </div>
        
        {/* Update Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(updateStatus)}
            <span>{getStatusText(updateStatus)}</span>
          </div>
        </div>
        
        {/* Last Updated */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last updated</span>
          <span>{formatDate(lastUpdateTime)}</span>
        </div>
        
        {/* Last Checked */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last checked</span>
          <span>{formatDate(lastChecked)}</span>
        </div>

        <div className="border-t pt-4 space-y-2">
          {/* Apply Update Button - shown when update is available */}
          {needRefresh && (
            <Button 
              onClick={() => updateServiceWorker()}
              disabled={updateStatus === 'updating'}
              className="w-full"
            >
              {updateStatus === 'updating' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Install Update
                </>
              )}
            </Button>
          )}

          {/* Check for Updates */}
          <Button 
            variant="outline"
            onClick={checkForUpdates}
            disabled={updateStatus === 'checking' || updateStatus === 'updating'}
            className="w-full"
          >
            {updateStatus === 'checking' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check for Updates
              </>
            )}
          </Button>

          {/* Force Refresh */}
          <Button 
            variant="outline"
            onClick={forceUpdate}
            disabled={updateStatus === 'updating'}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Refresh
          </Button>

          {/* Clear All Data */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                disabled={isClearing}
                className="w-full"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All App Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all app data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all cached data and reset the app. You'll need to sign in again.
                  This can help fix issues with the app not loading correctly.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  Clear Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Update History Toggle */}
        {updateHistory.length > 0 && (
          <div className="border-t pt-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full text-muted-foreground"
            >
              {showHistory ? 'Hide' : 'Show'} Update History ({updateHistory.length})
            </Button>
            
            {showHistory && (
              <div className="mt-2 space-y-2 text-xs">
                {updateHistory.slice(0, 5).map((event, i) => (
                  <div key={i} className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>{event.type}</span>
                    <span className="text-muted-foreground">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
