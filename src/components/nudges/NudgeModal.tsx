/**
 * @fileoverview AI Nudge Modal Component
 * Displays high-priority nudges in a modal overlay.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAINudges } from '@/hooks/useAINudges';

interface NudgeModalProps {
  childId?: string;
}

export function NudgeModal({ childId }: NudgeModalProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const {
    nudges,
    recordImpression,
    dismissNudge,
    completeNudge,
  } = useAINudges({
    childId,
    location: 'modal',
    maxNudges: 1,
    autoFetch: true,
  });

  const modalNudge = nudges[0];

  useEffect(() => {
    if (modalNudge && !open) {
      // Small delay before showing modal for better UX
      const timer = setTimeout(() => {
        setOpen(true);
        recordImpression(modalNudge.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [modalNudge?.id]);

  const handleAction = () => {
    if (modalNudge?.actionUrl) {
      completeNudge(modalNudge.id);
      setOpen(false);
      navigate(modalNudge.actionUrl);
    }
  };

  const handleDismiss = () => {
    if (modalNudge) {
      dismissNudge(modalNudge.id);
    }
    setOpen(false);
  };

  if (!modalNudge) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {modalNudge.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {modalNudge.message}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          {modalNudge.actionUrl && (
            <Button
              onClick={handleAction}
              className="w-full sm:w-auto"
            >
              {modalNudge.actionLabel || "Let's Go!"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NudgeModal;
