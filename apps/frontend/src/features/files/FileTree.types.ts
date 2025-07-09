export interface Project {
  name: string;
  path: string;
  fullPath?: string;
}

export interface GitStatus {
  modified?: string[];
  added?: string[];
  deleted?: string[];
  untracked?: string[];
}

export interface FileTreeProps {
  selectedProject: Project | null;
  onFileSelect?: (file: FileNode) => void;
  selectedFiles?: string[];
  expandedFolders?: string[];
}

export interface FileTreeComponentProps extends FileTreeProps {
  gitStatus?: GitStatus;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  modified?: Date;
  extension?: string;
  permissions?: string;
}

export interface FileTreeState {
  tree: FileNode | null;
  expandedPaths: Set<string>;
  selectedPaths: Set<string>;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filteredTree: FileNode | null;
}

export interface FileItemProps {
  node: FileNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export interface FileIconProps {
  type: 'file' | 'directory';
  extension?: string;
  isExpanded?: boolean;
  size?: number;
}

export interface FileSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export interface FileContextMenuProps {
  x: number;
  y: number;
  file: FileNode;
  onClose: () => void;
  onAction: (action: FileAction) => void;
}

export type FileAction =
  | 'open'
  | 'rename'
  | 'delete'
  | 'copy'
  | 'paste'
  | 'duplicate'
  | 'newFile'
  | 'newFolder'
  | 'refresh';
