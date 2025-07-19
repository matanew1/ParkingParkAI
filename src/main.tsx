// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Add this line
import App from "./App";

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
} catch (error) {
  console.error("Failed to initialize React app:", error);
  // Fallback: show a simple error message
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h2>App Loading Error</h2>
      <p>Unable to load the parking app. Please try refreshing the page.</p>
      <p style="font-size: 12px; color: #666;">Error: ${(error as Error).message}</p>
    </div>
  `;
}
