// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Add this line
import App from "./App";

// Global error handling for uncaught errors and promise rejections
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  showErrorFallback(`JavaScript Error: ${event.error?.message || 'Unknown error'}`);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showErrorFallback(`Promise Rejection: ${event.reason?.message || 'Unknown error'}`);
});

function showErrorFallback(errorMessage: string) {
  const rootElement = document.getElementById("root");
  const loadingElement = document.getElementById("initial-loading");
  
  // Hide loading indicator
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  if (rootElement && !rootElement.innerHTML.includes('App Loading Error')) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px;">
          <h2 style="color: #e74c3c; margin-bottom: 15px;">App Loading Error</h2>
          <p style="margin-bottom: 15px;">Unable to load the parking app. Please try refreshing the page.</p>
          <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
            Refresh Page
          </button>
          <details style="margin-top: 15px; text-align: left;">
            <summary style="cursor: pointer; color: #666;">Technical Details</summary>
            <p style="font-size: 12px; color: #666; margin-top: 10px; font-family: monospace; background: #f8f8f8; padding: 10px; border-radius: 4px;">
              ${errorMessage}
            </p>
          </details>
        </div>
      </div>
    `;
  }
}

// iOS Safari compatibility check
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Make sure your HTML has a div with id='root'");
}

try {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Hide loading indicator when React successfully loads
  setTimeout(() => {
    const loadingElement = document.getElementById("initial-loading");
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }, 100);
  
} catch (error) {
  console.error("Failed to initialize React app:", error);
  showErrorFallback(`React Initialization: ${(error as Error).message}`);
}
