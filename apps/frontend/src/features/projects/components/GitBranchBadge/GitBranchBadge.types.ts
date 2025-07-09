export interface GitStatus {
  modified: number;
  staged: number;
  untracked: number;
}

export interface GitBranchBadgeProps {
  branch: string | null;
  gitStatus?: GitStatus;
}
