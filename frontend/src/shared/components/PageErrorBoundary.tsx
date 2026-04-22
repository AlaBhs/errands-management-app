import { Component, type ErrorInfo,
         type ReactNode }    from "react";
import { RefreshCw,
         AlertTriangle }     from "lucide-react";

interface Props  { children: ReactNode }
interface State  { hasError: boolean; error: Error | null }

export class PageErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[PageErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[60vh] flex-col items-center
                      justify-center px-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center
                        rounded-2xl bg-red-100 mb-5">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>

        <h2 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
          This page encountered an unexpected error. The rest of the
          app is still working.
        </p>

        {/* Error detail — dev only */}
        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-4 max-w-lg rounded-lg bg-gray-100 p-3
                          text-left text-xs text-gray-600 overflow-auto">
            {this.state.error.message}
          </pre>
        )}

        <button
          onClick={() => {
            this.setState({ hasError: false, error: null });
            window.location.reload();
          }}
          className="mt-6 flex items-center gap-2 rounded-xl
                     bg-[var(--ey-dark)] px-5 py-2.5 text-sm font-semibold
                     text-white hover:bg-[var(--ey-text-hover)] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reload page
        </button>
      </div>
    );
  }
}