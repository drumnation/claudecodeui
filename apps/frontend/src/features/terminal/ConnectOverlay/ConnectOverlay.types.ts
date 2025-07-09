export interface ConnectOverlayProps {
  isInitialized: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  selectedSession?: {
    summary: string;
    [key: string]: any;
  };
  projectName: string;
}
