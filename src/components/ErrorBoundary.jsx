import React from "react";

/**
 * Error boundary that prevents uncaught render exceptions from leaking stack traces.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen bg-[#06060C] text-slate-100 flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#121026] border border-purple-500/30 text-center space-y-4">
            <h1 className="font-display text-xl font-bold text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-300">
              VayuGuide encountered an unexpected display error. Your local preferences are safe.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
