export type FileStatus = 'M' | 'A' | 'D' | 'U';

export interface FileItemProps {
  filePath: string;
  status: FileStatus;
  diff: string | null;
  isExpanded: boolean;
  isSelected: boolean;
  isMobile?: boolean;
  wrapText: boolean;
  onToggleExpanded: () => void;
  onToggleSelected: () => void;
  onToggleWrapText: () => void;
}
