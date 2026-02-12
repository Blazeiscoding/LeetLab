import React, { type ErrorInfo, type ReactNode } from "react";
import { IconAlertTriangle, IconBug, IconHome, IconRefresh } from '@tabler/icons-react';
import { Link } from "react-router-dom";

/**
 * Error Boundary component to catch JavaScript errors in child components
 * Displays a friendly error UI instead of crashing the whole app
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  minimal?: boolean;
  fallback?: (error: Error | null, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log to an error reporting service here
    // e.g., Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback, minimal } = this.props;

      // Custom fallback UI
      if (fallback) {
        return fallback(this.state.error, this.handleRetry);
      }

      // Minimal error display (for inline components)
      if (minimal) {
        return (
          <div className="flex items-center gap-2 p-4 bg-error/10 text-error rounded-xl border border-error/20">
            <IconAlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Something went wrong</span>
            <button
              onClick={this.handleRetry}
              className="btn btn-ghost btn-xs gap-1"
            >
              <IconRefresh className="w-3 h-3" />
              Retry
            </button>
          </div>
        );
      }

      // Full page error display
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/10 mb-6">
              <IconAlertTriangle className="w-10 h-10 text-error" />
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold mb-3">Oops! Something went wrong</h2>
            <p className="text-base-content/60 mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {/* Error Details (collapsible) */}
            {this.state.error && (
              <div className="collapse collapse-arrow bg-base-200/50 rounded-xl mb-6 text-left">
                <input type="checkbox" />
                <div className="collapse-title flex items-center gap-2 text-sm font-medium">
                  <IconBug className="w-4 h-4" />
                  Technical Details
                </div>
                <div className="collapse-content">
                  <pre className="text-xs text-error overflow-x-auto whitespace-pre-wrap bg-base-300/50 p-3 rounded-lg">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-xs text-base-content/50 overflow-x-auto whitespace-pre-wrap mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="btn btn-primary gap-2"
              >
                <IconRefresh className="w-4 h-4" />
                Try Again
              </button>
              <Link to="/" className="btn btn-ghost gap-2">
                <IconHome className="w-4 h-4" />
                Go IconHome
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
