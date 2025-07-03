import React from "react";
import ReactDOM from "react-dom/client";
import { createLogger } from "@kit/logger/browser";
import { LoggerProvider } from "@kit/logger/react";
import type { Logger } from "@kit/logger/types";
import App from "./App";
import "./index.css";

// Create root logger instance
const logger: Logger = createLogger({ scope: "frontend" });

// Log startup
logger.info("Starting Claude Code UI frontend");

// Error boundary for root-level errors
window.addEventListener("error", (event: ErrorEvent) => {
  logger.error("Uncaught error", { error: event.error });
});

window.addEventListener(
  "unhandledrejection",
  (event: PromiseRejectionEvent) => {
    logger.error("Unhandled promise rejection", { error: event.reason });
  },
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Cannot start the application.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <LoggerProvider scope="frontend" level="info">
      <App />
    </LoggerProvider>
  </React.StrictMode>,
);
