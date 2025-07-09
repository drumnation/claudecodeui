import type {FormEvent} from 'react';

export type ServerStatus =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

export interface NavigationBarProps {
  url: string;
  setUrl: (url: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  serverStatus: ServerStatus;
  isCurrentProjectServer: boolean;
  showDevServerAnyway: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onRefresh: () => void;
  onUrlSubmit: (e: FormEvent<HTMLFormElement>) => void;
}
