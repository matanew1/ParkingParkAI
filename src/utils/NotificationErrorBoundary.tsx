import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for the notification system
 * Prevents notification errors from crashing the entire app
 */
class NotificationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error but don't crash the app
    console.warn('Notification system error (app continues running):', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // You could also log this to an error reporting service
    // errorReportingService.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Notification system failed, but app continues without notifications
      console.warn('Notification system disabled due to error. App continues without notifications.');
      return this.props.children;
    }

    return this.props.children;
  }
}

export default NotificationErrorBoundary;
