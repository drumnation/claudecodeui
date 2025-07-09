export interface ShellHeaderProps {
  isConnected: boolean;
  selectedSession?: {
    summary: string;
    [key: string]: any;
  };
  isInitialized: boolean;
  isRestarting: boolean;
  isConnecting: boolean;
  onDisconnect: () => void;
  onRestart: () => void;
  onConnect: () => void;
  onStartFresh: () => void;
}
