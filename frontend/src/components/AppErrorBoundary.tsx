import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Keep the original error visible in dev/prod logs for debugging.
    console.error('Application render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen page-container flex items-center justify-center px-6 animated-bg">
          <div className="glass p-6 text-center max-w-sm w-full">
            <h1 className="text-white text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-white/60 text-sm mb-5">
              The app hit an unexpected error. Reload to try again.
            </p>
            {this.state.message && (
              <p className="text-xs text-amber-300/90 mb-5 break-words">{this.state.message}</p>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary w-full"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;