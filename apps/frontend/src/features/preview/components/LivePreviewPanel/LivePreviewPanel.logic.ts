import type { ServerStatus } from "./LivePreviewPanel.types";

export const previewLogic = {
  getStatusColor(serverStatus: string): string {
    switch (serverStatus) {
      case "running":
        return "text-green-500";
      case "starting":
        return "text-yellow-500";
      case "stopping":
        return "text-orange-500";
      case "stopped":
        return "text-gray-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  },

  getStatusText(serverStatus: string): string {
    switch (serverStatus) {
      case "running":
        return "Running";
      case "starting":
        return "Starting...";
      case "stopping":
        return "Stopping...";
      case "stopped":
        return "Stopped";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  },

  processUrl(url: string): string {
    const trimmedUrl = url.trim();
    if (
      !trimmedUrl.startsWith("http://") &&
      !trimmedUrl.startsWith("https://")
    ) {
      return "http://" + trimmedUrl;
    }
    return trimmedUrl;
  },

  isCurrentProjectServer(): boolean {
    return window.location.hostname === "localhost" && window.location.port === "8766";
  },

  getCurrentOrigin(): string {
    return window.location.origin;
  }
};
