import type {ChangeEvent} from 'react';

export type ServerStatus =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

export interface ServerControlsProps {
  availableScripts: string[];
  currentScript: string | null;
  serverStatus: ServerStatus;
  isMobile?: boolean;
  showLogs: boolean;
  onScriptChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onStartServer: (script: string) => void;
  onStopServer: () => void;
  onToggleLogs: () => void;
}
