/**
 * Error boundary specifically for ActivityPlayer
 * Provides kid-friendly error recovery
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, X, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  onClose: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ActivityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Activity Player Error:', error, errorInfo);
    
    // Log error for monitoring
    try {
      import('@/integrations/supabase/client').then(({ supabase }) => {
        supabase.from('error_logs').insert({
          severity: 'error',
          component: 'ActivityPlayer',
          error_message: error.message,
          error_stack: error.stack,
          metadata: { componentStack: errorInfo.componentStack },
        }).then(() => {});
      });
    } catch {
      // Silently fail if logging fails
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <Card className="max-w-md w-full p-8 text-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={this.props.onClose}
            >
              <X className="w-5 h-5" />
            </Button>
            
            {/* Fun emoji animation */}
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 0.5,
                repeat: 2,
              }}
              className="text-6xl mb-6"
            >
              🎮✨
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-2">Whoops!</h2>
            <p className="text-muted-foreground mb-6">
              This activity got a little confused. Let's try again!
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={this.props.onClose} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Pick Another
              </Button>
            </div>
          </Card>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
