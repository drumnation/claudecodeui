export interface DirectoryBrowserProps {
  onSelectPath: (path: string) => void;
  selectedPath: string;
  className?: string;
}

export interface DirectoryItem {
  name: string;
  type: 'directory' | 'file';
  path: string;
}
