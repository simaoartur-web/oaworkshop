import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ModelViewerErrorBoundaryProps {
  /** Changing `resetKey` clears an active boundary error and re-mounts children cleanly. */
  resetKey: string | number;
  /** Invoked when a WebGL or React Three Fiber runtime exception escapes inside `<Canvas>`. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Optional fallback UI when the boundary catches an error (defaults to null so parent renders structured fallback). */
  fallback?: ReactNode;
  children: ReactNode;
}

interface ModelViewerErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Dedicated React ErrorBoundary wrapping `<Canvas>` so WebGL or R3F runtime exceptions
 * never crash the host route and can be recovered via controlled retry.
 */
export class ModelViewerErrorBoundary extends Component<
  ModelViewerErrorBoundaryProps,
  ModelViewerErrorBoundaryState
> {
  state: ModelViewerErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ModelViewerErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidUpdate(prevProps: ModelViewerErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export default ModelViewerErrorBoundary;
