import { Component } from "react";
import type { ReactNode } from "react";
import { Button, Result } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Result
          status="error"
          title="Oops! Something went wrong"
          subTitle="We're sorry, but something unexpected happened. Please try refreshing the page."
          extra={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
                size="large"
              >
                Refresh Page
              </Button>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details
                  style={{
                    padding: "10px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                    textAlign: "left",
                    width: "100%",
                    maxWidth: "600px",
                  }}
                >
                  <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
                    Error Details (Development Only)
                  </summary>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "12px",
                      color: "#ff4d4f",
                    }}
                  >
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
