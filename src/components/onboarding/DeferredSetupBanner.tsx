/**
 * @fileoverview Deferred Setup Banner
 * Non-intrusive prompt for Quick Start users to complete full setup.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DeferredSetupBannerProps {
  deferredItems?: string[];
  onDismiss?: () => void;
  onComplete?: () => void;
}

const ITEM_LABELS: Record<string, { label: string; benefit: string }> = {
  learning_preferences: {
    label: 'Learning Preferences',
    benefit: 'Get personalized content recommendations',
  },
  subjects: {
    label: 'Subject Interests',
    benefit: 'Discover lessons you\'ll love',
  },
  goals: {
    label: 'Learning Goals',
    benefit: 'Track progress toward your targets',
  },
  schedule: {
    label: 'Learning Schedule',
    benefit: 'Build consistent learning habits',
  },
  community: {
    label: 'Community Settings',
    benefit: 'Connect with other learners',
  },
};

export function DeferredSetupBanner({
  deferredItems = [],
  onDismiss,
  onComplete,
}: DeferredSetupBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  if (!isVisible || deferredItems.length === 0) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleComplete = () => {
    // Navigate to settings or onboarding page
    navigate('/settings?tab=preferences');
    onComplete?.();
  };

  const primaryItem = deferredItems[0];
  const primaryItemData = ITEM_LABELS[primaryItem];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20"
      >
        <div className="container py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Main content */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-full bg-primary/10 shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                {!isExpanded ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      Complete your profile for better recommendations
                    </span>
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-sm text-primary hover:underline shrink-0"
                    >
                      Learn more
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      You have {deferredItems.length} setup item{deferredItems.length > 1 ? 's' : ''} to complete:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {deferredItems.slice(0, 3).map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Settings className="w-3 h-3" />
                          <span>{ITEM_LABELS[item]?.label || item}</span>
                          <span className="text-xs">— {ITEM_LABELS[item]?.benefit}</span>
                        </li>
                      ))}
                      {deferredItems.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{deferredItems.length - 3} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="default"
                onClick={handleComplete}
                className="gap-1"
              >
                Complete Setup
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="p-2"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default DeferredSetupBanner;
