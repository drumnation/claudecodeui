import {GitStatus} from '@/features/files/FileTree.types';

export interface GitDiff {
  [filePath: string]: string;
}

export interface FileListProps {
  gitStatus: GitStatus | null;
  gitDiff: GitDiff;
  expandedFiles: Set<string>;
  selectedFiles: Set<string>;
  isLoading: boolean;
  isMobile: boolean;
  wrapText: boolean;
  onToggleFileExpanded: (filePath: string) => void;
  onToggleFileSelected: (filePath: string) => void;
  onToggleWrapText: () => void;
}
