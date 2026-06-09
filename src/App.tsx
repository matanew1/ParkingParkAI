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
            backgroundColor: "#111315",
            padding: "20px",
            fontFamily: "Inter, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              background: "#191C20",
              border: "1px solid rgba(248,250,252,0.12)",
              borderRadius: "10px",
              padding: "32px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🅿️</div>
            <h2 style={{ color: "#F8FAFC", marginBottom: "12px", fontSize: "20px" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#A7B0BE", marginBottom: "24px", fontSize: "14px" }}>
              The parking app encountered an error. Please refresh to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #60A5FA, #34D399)",
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
                <summary style={{ color: "#A7B0BE", fontSize: "12px", cursor: "pointer" }}>
                  Error details
                </summary>
                <pre
                  style={{
                    color: "#f85149",
                    fontSize: "11px",
                    marginTop: "8px",
                    background: "#111315",
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
