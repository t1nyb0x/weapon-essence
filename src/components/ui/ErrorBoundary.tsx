import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <p className={styles.message}>
            データの読み込みに失敗しました。ページを再読み込みしてください。
          </p>
          <button className={styles.button} onClick={() => window.location.reload()}>
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
