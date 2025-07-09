export interface LivePreviewPanelProps {
  selectedProject: {
    name: string;
    path: string;
    fullPath?: string;
  } | null;
  port?: number;
  url?: string;
}

export interface PreviewState {
  url: string;
  isLoading: boolean;
  error: string | null;
  isFullscreen: boolean;
  deviceMode: DeviceMode;
  zoom: number;
  isRefreshing: boolean;
}

export type DeviceMode = 'desktop' | 'tablet' | 'mobile' | 'responsive';

export interface DevicePreset {
  name: string;
  width: number;
  height: number;
  userAgent?: string;
}

export interface NavigationBarProps {
  url: string;
  onUrlChange: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
}

export interface PreviewFrameProps {
  url: string;
  deviceMode: DeviceMode;
  zoom: number;
  onLoad: () => void;
  onError: (error: Error) => void;
  className?: string;
}

export interface LogsPanelProps {
  projectPath: string;
  serverName?: string;
  maxLines?: number;
  autoScroll?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
  metadata?: Record<string, any>;
}
