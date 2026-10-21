import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const splash = document.getElementById("boot-splash");
const errorBox = document.getElementById("boot-error");

function showFatal(message: string) {
  if (errorBox) {
    errorBox.style.display = "block";
    errorBox.textContent += "\n[fatal] " + message + "\n";
  }
  if (splash) splash.style.display = "flex";
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error: String(error) };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    showFatal(String(error) + "\n" + (info?.componentStack || "").slice(0, 400));
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: "#8b1e1e", fontFamily: "monospace", fontSize: 14 }}>
          <h2>Nova startup failed</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error}</pre>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    showFatal("missing #root");
  } else {
    ReactDOM.createRoot(rootEl).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    );
    // Hide splash after App has a chance to paint
    window.setTimeout(() => {
      const html = rootEl.innerHTML;
      if (html.trim().length > 20 && !errorBox?.textContent) {
        if (splash) splash.style.display = "none";
      } else if (html.trim().length <= 20) {
        showFatal("[empty-root] len=" + html.length);
      }
    }, 1000);
  }
} catch (error) {
  showFatal("[bootstrap] " + String(error));
}
