import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-boundary" role="alert">
      <div className="error-boundary-title">Something went wrong</div>
      <div className="error-boundary-message">
        {error?.message || "Unexpected error"}
      </div>
      <button className="error-boundary-button" type="button" onClick={resetErrorBoundary}>
        Reload view
      </button>
    </div>
  );
}

export function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
}
