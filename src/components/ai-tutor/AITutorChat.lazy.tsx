/**
 * Lazy-loaded AITutorChat with error boundary and loading state
 */
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AITutorErrorBoundary } from '@/components/error/AITutorErrorBoundary';

// Lazy load the heavy AITutorChat component
const AITutorChatBase = React.lazy(() => 
  import('./AITutorChat').then(module => ({ default: module.AITutorChat }))
);

interface AITutorChatLazyProps {
  childId: string;
  childName: string;
  gradeLevel: number;
  subject?: string;
  isOpen: boolean;
  onClose: () => void;
}

function AITutorChatFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
    >
      <Card className="shadow-2xl border-2 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-full">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base font-semibold">Learning Buddy</p>
              <p className="text-xs opacity-80">Loading...</p>
            </div>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    </motion.div>
  );
}

export function AITutorChatLazy(props: AITutorChatLazyProps) {
  if (!props.isOpen) return null;

  return (
    <AITutorErrorBoundary onClose={props.onClose}>
      <Suspense fallback={<AITutorChatFallback />}>
        <AITutorChatBase {...props} />
      </Suspense>
    </AITutorErrorBoundary>
  );
}

export default AITutorChatLazy;
