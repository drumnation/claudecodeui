export type ServerStatus =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

export interface StatusIndicatorProps {
  serverStatus: ServerStatus;
}
