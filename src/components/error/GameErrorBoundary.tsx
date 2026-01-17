/**
 * Error boundary specifically for Multiplayer Games
 * Handles game-specific errors with recovery options
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'network' | 'realtime' | 'unknown';
}

export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorType: 'unknown' };
  }

  static getDerivedStateFromError(error: Error): State {
    // Categorize error type for better messaging
    let errorType: 'network' | 'realtime' | 'unknown' = 'unknown';
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      errorType = 'network';
    } else if (error.message.includes('realtime') || error.message.includes('websocket')) {
      errorType = 'realtime';
    }
    
    return { hasError: true, error, errorType };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Multiplayer Game Error:', error, errorInfo);
    
    // Log error for monitoring
    try {
      import('@/integrations/supabase/client').then(({ supabase }) => {
        supabase.from('error_logs').insert({
          severity: 'error',
          component: 'MultiplayerGames',
          error_message: error.message,
          error_stack: error.stack,
          metadata: { 
            componentStack: errorInfo.componentStack,
            errorType: this.state.errorType,
          },
        }).then(() => {});
      });
    } catch {
      // Silently fail if logging fails
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorType: 'unknown' });
  };

  handleGoHome = () => {
    window.location.href = '/child/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const { errorType } = this.state;
      
      return (
        <PageContainer>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
                <CardTitle className="text-xl">
                  {errorType === 'network' && 'Connection Lost!'}
                  {errorType === 'realtime' && 'Game Disconnected!'}
                  {errorType === 'unknown' && 'Oops! Something Went Wrong'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  {errorType === 'network' && (
                    "Looks like your internet connection dropped. Check your connection and try again!"
                  )}
                  {errorType === 'realtime' && (
                    "The game connection was interrupted. Don't worry, your score is saved!"
                  )}
                  {errorType === 'unknown' && (
                    "The game had a little hiccup. Let's get you back to playing!"
                  )}
                </p>
                
                <div className="flex items-center justify-center gap-6 py-4">
                  <div className="text-center">
                    <Gamepad2 className="w-12 h-12 mx-auto text-primary/30" />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={this.handleRetry} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  If this keeps happening, ask a parent for help!
                </p>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      );
    }

    return this.props.children;
  }
}
