import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, X, Download, Loader2 } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { motion, AnimatePresence } from "framer-motion";

export const PWAUpdatePrompt = () => {
  const { needRefresh, updateServiceWorker, updateStatus, isUpgrading, upgradeMessage } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Show upgrading overlay
  if (isUpgrading) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Updating Inner Odyssey</h2>
          <p className="text-muted-foreground">{upgradeMessage || 'Please wait...'}</p>
          <Progress value={undefined} className="w-64 mx-auto" />
        </div>
      </div>
    );
  }

  // Don't show if no update or dismissed
  if (!needRefresh || isDismissed) return null;

  const isUpdating = updateStatus === 'updating';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="bg-primary text-primary-foreground shadow-lg">
          <div className="container max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                ) : (
                  <Download className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {isUpdating ? 'Installing update...' : 'Update available!'}
                  </p>
                  <p className="text-xs opacity-90 hidden sm:block">
                    {isUpdating 
                      ? 'Please wait while we update the app'
                      : 'A new version with improvements is ready'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isUpdating && (
                  <>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => updateServiceWorker()}
                      className="whitespace-nowrap"
                    >
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      Update Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsDismissed(true)}
                      className="text-primary-foreground hover:bg-primary-foreground/10 p-1.5"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {isUpdating && (
              <Progress value={undefined} className="mt-2 h-1 bg-primary-foreground/20" />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
