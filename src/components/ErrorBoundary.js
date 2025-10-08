import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a ResizeObserver error
    if (error.message && error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return { hasError: false }; // Don't show error UI for ResizeObserver
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Suppress ResizeObserver errors
    if (error.message && error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      console.log('ResizeObserver error suppressed');
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
