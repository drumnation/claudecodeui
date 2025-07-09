export interface GitPanelProps {
  selectedProject: {
    name: string;
    path: string;
    fullPath?: string;
  } | null;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: GitFileStatus[];
  unstaged: GitFileStatus[];
  untracked: GitFileStatus[];
  conflicted: GitFileStatus[];
  isRepository: boolean;
}

export interface GitFileStatus {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied' | 'untracked';
  oldPath?: string; // For renamed files
  additions?: number;
  deletions?: number;
}

export interface GitCommit {
  hash: string;
  abbreviatedHash: string;
  subject: string;
  body?: string;
  author: {
    name: string;
    email: string;
  };
  date: Date;
  refs?: string[];
  parentHashes?: string[];
}

export interface GitBranch {
  name: string;
  current: boolean;
  remote?: string;
  lastCommit?: GitCommit;
  ahead?: number;
  behind?: number;
}

export interface GitRemote {
  name: string;
  url: string;
  fetch?: string;
  push?: string;
}

export interface GitPanelState {
  status: GitStatus | null;
  commits: GitCommit[];
  branches: GitBranch[];
  remotes: GitRemote[];
  loading: boolean;
  error: string | null;
  selectedFiles: string[];
  commitMessage: string;
  showNewBranchModal: boolean;
  isInitialized: boolean;
}

export interface NewBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBranch: (branchName: string, checkout: boolean) => Promise<void>;
  currentBranch: string;
}

export interface CommitMessageProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface FileListProps {
  files: GitFileStatus[];
  selectedFiles: string[];
  onToggleFile: (path: string) => void;
  onToggleAll: () => void;
  title: string;
  showCheckboxes?: boolean;
}

export interface BranchSelectorProps {
  branches: GitBranch[];
  currentBranch: string;
  onBranchChange: (branchName: string) => void;
  onCreateBranch: () => void;
  loading?: boolean;
}
