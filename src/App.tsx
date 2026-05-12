import React from "react";
import AppContent from "./features/app/components/AppContent";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#0d1117",
            padding: "20px",
            fontFamily: "Inter, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              background: "#161b22",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🅿️</div>
            <h2 style={{ color: "#e6edf3", marginBottom: "12px", fontSize: "20px" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#7d8590", marginBottom: "24px", fontSize: "14px" }}>
              The parking app encountered an error. Please refresh to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #00c8ff, #00a3cc)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details style={{ marginTop: "16px", textAlign: "left" }}>
                <summary style={{ color: "#7d8590", fontSize: "12px", cursor: "pointer" }}>
                  Error details
                </summary>
                <pre
                  style={{
                    color: "#f85149",
                    fontSize: "11px",
                    marginTop: "8px",
                    background: "#0d1117",
                    padding: "12px",
                    borderRadius: "8px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
