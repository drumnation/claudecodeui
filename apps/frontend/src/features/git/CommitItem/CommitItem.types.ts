export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  stats?: string;
}

export interface CommitItemProps {
  commit: Commit;
  isExpanded: boolean;
  diff: string | null;
  onToggleExpanded: () => void;
}
