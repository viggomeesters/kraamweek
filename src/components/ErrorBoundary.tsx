'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { ErrorLoggingService, withErrorLogging } from '@/lib/errorLoggingService';

interface ErrorBoundaryState {
  hasError: boolean;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ errorId?: string; onRetry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorLogger: ErrorLoggingService;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.errorLogger = ErrorLoggingService.getInstance();
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    withErrorLogging(error, { componentStack: errorInfo.componentStack || 'Unknown component' });
    
    // Get the error ID for reference
    const errorLogs = this.errorLogger.getErrorLogs();
    const latestError = errorLogs[0]; // Most recent error
    
    this.setState({ errorId: latestError?.id });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          errorId={this.state.errorId} 
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ errorId?: string; onRetry: () => void }> = ({ 
  errorId, 
  onRetry 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Er is iets misgegaan
        </h2>
        
        <p className="text-gray-600 mb-4">
          De applicatie heeft een onverwachte fout tegengekomen. 
          De fout is automatisch gerapporteerd voor verdere analyse.
        </p>
        
        {errorId && (
          <p className="text-sm text-gray-500 mb-4">
            Fout ID: <code className="bg-gray-100 px-2 py-1 rounded">{errorId}</code>
          </p>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={onRetry}
            fullWidth
          >
            Probeer opnieuw
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            fullWidth
          >
            Pagina verversen
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Als het probleem blijft bestaan, neem dan contact op met de ondersteuning.
        </p>
      </div>
    </div>
  );
};

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;