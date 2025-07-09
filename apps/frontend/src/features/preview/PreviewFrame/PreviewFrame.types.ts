import type {RefObject} from 'react';

export type ServerStatus =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

export interface PreviewFrameProps {
  serverStatus: ServerStatus;
  serverUrl?: string;
  url?: string;
  iframeKey: string | number;
  iframeRef: RefObject<HTMLIFrameElement>;
  isLoading: boolean;
  error: string | null;
  showDevServerAnyway: boolean;
  isCurrentProjectServer: boolean;
  availableScripts: string[];
  onIframeLoad: () => void;
  onIframeError: () => void;
  onRefresh: () => void;
  onShowDevServerAnyway: () => void;
}
