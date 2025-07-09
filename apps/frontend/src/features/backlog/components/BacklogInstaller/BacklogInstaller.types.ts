export interface BacklogInstallerProps {
  onInstallComplete?: () => void;
  onSkip?: () => void;
}

export type InstallationStatus =
  | 'checking'
  | 'not-installed'
  | 'installing'
  | 'installed'
  | 'error';

export interface InstallProgress {
  message: string;
  progress: number;
  status?: 'completed' | 'failed';
}

export type DetailedError = 'path-issue' | 'npm-issue' | 'not-installed' | null;

export interface DebugInfo {
  npmGlobalBin?: string;
  pnpmGlobalBin?: string;
  path?: boolean;
  environment?: {
    backlogCliPath?: string;
  };
  commonLocations?: Record<string, boolean>;
  recommendations?: string[];
}

export interface EnvironmentInfo {
  npm?: {
    available: boolean;
    version?: string;
    globalBin?: string;
  };
  pnpm?: {
    available: boolean;
    version?: string;
    globalBin?: string;
  };
  recommendations?: string[];
}

export interface BacklogHealthResponse {
  backlogAvailable: boolean;
  error?:
    | {
        message?: string;
      }
    | string;
  debug?: DebugInfo;
}

export interface InstallationProgressData {
  message: string;
  progress: number;
  status?: 'completed' | 'failed';
}
