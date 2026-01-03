import { Component } from "react";
import type { ReactNode } from "react";
import { Button, Result } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <Result
            status="error"
            title="Oops! Something went wrong"
            subTitle="We're sorry, but something unexpected happened."
            extra={
              <div className="flex flex-col items-center gap-4">
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReset}
                  size="large"
                >
                  {this.props.onReset ? "Try Again" : "Refresh Page"}
                </Button>

                {import.meta.env.DEV && this.state.error && (
                  <details className="w-full max-w-2xl p-4 border border-gray-200 rounded bg-white text-left">
                    <summary className="cursor-pointer font-medium mb-2 text-gray-700">
                      Error Details (Dev Only)
                    </summary>
                    <pre className="whitespace-pre-wrap text-xs text-red-500 overflow-auto max-h-64">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
