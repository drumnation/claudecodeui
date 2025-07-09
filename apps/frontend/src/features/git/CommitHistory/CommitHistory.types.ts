export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  stats?: string;
}

export interface CommitHistoryProps {
  recentCommits: Commit[];
  expandedCommits: Set<string>;
  commitDiffs: Record<string, string>;
  isLoading: boolean;
  isMobile?: boolean;
  onToggleCommitExpanded: (hash: string) => void;
}
