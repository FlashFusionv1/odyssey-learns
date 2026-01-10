import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Normalize any thrown value to a proper Error object
 * This prevents the "%o %s %s {}" console message when non-Error objects are thrown
 */
const normalizeError = (thrown: unknown): Error => {
  // Already an Error - return as-is
  if (thrown instanceof Error) {
    return thrown;
  }

  // String thrown - wrap in Error
  if (typeof thrown === 'string') {
    return new Error(thrown);
  }

  // Null or undefined - create generic error
  if (thrown === null || thrown === undefined) {
    return new Error('An unknown error occurred (null/undefined thrown)');
  }

  // Object with message property - extract message
  if (typeof thrown === 'object' && thrown !== null) {
    const obj = thrown as Record<string, unknown>;
    
    // Check for message property
    if ('message' in obj && typeof obj.message === 'string') {
      const error = new Error(obj.message);
      if ('stack' in obj && typeof obj.stack === 'string') {
        error.stack = obj.stack;
      }
      if ('name' in obj && typeof obj.name === 'string') {
        error.name = obj.name;
      }
      return error;
    }

    // Empty object {} - common React error pattern
    if (Object.keys(obj).length === 0) {
      return new Error('An error occurred (empty object thrown - check component lifecycle)');
    }

    // Try to stringify the object for debugging
    try {
      return new Error(`Non-Error object thrown: ${JSON.stringify(thrown)}`);
    } catch {
      return new Error('Non-Error object thrown (could not stringify)');
    }
  }

  // Primitive types
  return new Error(`Non-Error thrown: ${String(thrown)}`);
};

/**
 * Production-grade error boundary to catch and handle React errors gracefully
 * Prevents white screen of death and provides recovery options
 * 
 * Key features:
 * - Normalizes all thrown values to proper Error objects
 * - Prevents "%o %s %s {}" console messages from empty object throws
 * - Provides detailed error logging for debugging
 * - Offers user-friendly recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: '',
  };

  public static getDerivedStateFromError(error: unknown): Partial<State> {
    // Normalize the error immediately
    const normalizedError = normalizeError(error);
    return { 
      hasError: true, 
      error: normalizedError, 
      errorInfo: null,
      errorId: `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`
    };
  }

  public componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    // Normalize the error
    const normalizedError = normalizeError(error);
    
    // Log with proper formatting (not printf-style to avoid %o %s issues)
    console.group('[ErrorBoundary] Component Error Caught');
    console.error('Error:', normalizedError.message);
    console.error('Stack:', normalizedError.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Original thrown value:', error);
    console.error('Error type:', typeof error, error?.constructor?.name);
    console.groupEnd();
    
    // Log to analytics/monitoring service
    this.logErrorToService(normalizedError, errorInfo, error);
    
    // Update state with normalized error
    this.setState({
      error: normalizedError,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(normalizedError, errorInfo);
  }

  private logErrorToService = (
    error: Error, 
    errorInfo: ErrorInfo, 
    originalThrown: unknown
  ) => {
    try {
      const errorData = {
        id: this.state.errorId,
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        originalType: typeof originalThrown,
        originalConstructor: originalThrown?.constructor?.name ?? 'unknown',
        wasEmptyObject: typeof originalThrown === 'object' && 
                        originalThrown !== null && 
                        Object.keys(originalThrown as object).length === 0,
      };
      
      // Store in sessionStorage for security (not persisted across browser sessions)
      const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      // Keep only last 10 errors
      sessionStorage.setItem('app_errors', JSON.stringify(errors.slice(-10)));
    } catch (e) {
      // Avoid recursive errors - use basic console
      console.warn('[ErrorBoundary] Failed to log error:', e);
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: '' });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
                <p className="text-muted-foreground mb-4">
                  We're sorry for the inconvenience. The error has been logged and we'll fix it soon.
                </p>
              </div>

              {isDev && this.state.error && (
                <details className="w-full text-left" open>
                  <summary className="cursor-pointer text-sm font-medium mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-muted p-4 rounded-lg overflow-auto text-xs space-y-2">
                    <div>
                      <strong className="text-destructive">Error:</strong>{' '}
                      <span className="font-mono">{this.state.error.name}: {this.state.error.message}</span>
                    </div>
                    
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-[10px] bg-background/50 p-2 rounded">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-[10px] bg-background/50 p-2 rounded">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={this.handleReset} variant="default">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="secondary">
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Error ID: <code className="bg-muted px-1 py-0.5 rounded">{this.state.errorId}</code>
                <br />
                If this problem persists, please contact support with this ID.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
