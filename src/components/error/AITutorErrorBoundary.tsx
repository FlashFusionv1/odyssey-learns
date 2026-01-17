/**
 * Error boundary specifically for AI Tutor feature
 * Provides friendly recovery options for children
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, RefreshCw, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  onClose: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AITutorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AI Tutor Error:', error, errorInfo);
    
    // Log error for monitoring
    try {
      import('@/integrations/supabase/client').then(({ supabase }) => {
        supabase.from('error_logs').insert({
          severity: 'error',
          component: 'AITutorChat',
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
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
        >
          <Card className="shadow-2xl border-2 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Oops!</p>
                    <p className="text-xs opacity-80">Something went wrong</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={this.props.onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <div className="text-4xl">🤖💫</div>
              <div>
                <h3 className="font-semibold text-lg">Learning Buddy needs a restart!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Don't worry, this happens sometimes. Let's try again!
                </p>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleRetry} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.props.onClose}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
