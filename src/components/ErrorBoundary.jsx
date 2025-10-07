// A simple error boundary component to catch JavaScript errors
// anywhere in the child component tree.  If an error is caught the
// user sees a friendly message instead of a blank screen.  Error
// boundaries are an important part of robust React applications and
// allow us to gracefully recover from unexpected problems.

import React from 'react';

/**
 * ErrorBoundary is a class component because error boundaries must
 * implement lifecycle methods that are not available in functional
 * components.  It tracks whether an error has been thrown and, if
 * so, displays a fallback UI.  Otherwise it renders its children
 * normally.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You could log the error to an error reporting service here.
    /* eslint-disable no-console */
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
          <h1 className="text-3xl font-bold mb-4">มีข้อผิดพลาดเกิดขึ้น</h1>
          <p className="text-center text-gray-400 mb-6">
            เราขออภัยในความไม่สะดวก ขณะนี้ระบบพบข้อผิดพลาดที่ไม่คาดคิดและไม่สามารถทำงานต่อได้
          </p>
          <pre className="bg-gray-800 text-rose-400 p-4 rounded text-sm overflow-x-auto max-w-xl">
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
