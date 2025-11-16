import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  feature?: 'auth' | 'parent' | 'child' | 'admin' | 'public';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Feature-specific error boundary for route groups
 * Provides context-appropriate error messages and recovery actions
 */
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to database
    this.logError(error, errorInfo);
  }

  async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      await supabase.from('error_logs').insert({
        error_message: error.message,
        error_stack: error.stack || null,
        component: this.props.feature || 'unknown',
        severity: 'error',
        metadata: {
          componentStack: errorInfo.componentStack,
        },
      });
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  getFeatureMessages() {
    const { feature } = this.props;

    switch (feature) {
      case 'auth':
        return {
          title: 'Login Error',
          description: 'We encountered an issue with the authentication system. Please try again.',
          emoji: '🔐',
        };
      case 'parent':
        return {
          title: 'Parent Dashboard Error',
          description: 'Something went wrong with the parent dashboard. Our team has been notified.',
          emoji: '👨‍👩‍👧‍👦',
          supportLink: '/support',
        };
      case 'child':
        return {
          title: 'Oops! Something went wrong',
          description: "Don't worry! We're working on fixing this. Try again or ask a parent for help.",
          emoji: '🎮',
        };
      case 'admin':
        return {
          title: 'Admin Dashboard Error',
          description: 'An error occurred in the admin system. Technical details are available below.',
          emoji: '⚙️',
          showTechnicalDetails: true,
        };
      default:
        return {
          title: 'Something went wrong',
          description: 'An unexpected error occurred. Please try again or contact support.',
          emoji: '⚠️',
        };
    }
  }

  render() {
    if (this.state.hasError) {
      const messages = this.getFeatureMessages();
      const { error, errorInfo } = this.state;

      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <Card className="w-full max-w-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-4xl">{messages.emoji}</span>
              </div>

              <h1 className="text-2xl font-bold">{messages.title}</h1>
              <p className="text-muted-foreground">{messages.description}</p>

              {messages.showTechnicalDetails && error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Technical Details
                  </summary>
                  <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-48">
                    <code>{error.toString()}</code>
                    {errorInfo && (
                      <>
                        {'\n\n'}
                        <code>{errorInfo.componentStack}</code>
                      </>
                    )}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleReset} variant="default">
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                Go Home
              </Button>
              {messages.supportLink && (
                <Button
                  onClick={() => (window.location.href = messages.supportLink!)}
                  variant="ghost"
                >
                  Contact Support
                </Button>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
