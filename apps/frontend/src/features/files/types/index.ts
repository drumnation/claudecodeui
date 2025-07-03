/**
 * Files Feature Types - Domain-specific type definitions
 * Following Bulletproof React feature-slice pattern
 */

// File system types
export interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  lastModified?: string;
  children?: FileItem[];
}

// File editor types
export interface EditableFile {
  name: string;
  path: string;
  projectName: string;
  projectPath: string;
  content?: string;
  diffInfo?: DiffInfo;
}

export interface DiffInfo {
  old_string: string;
  new_string: string;
  file_path?: string;
}

// File operations
export interface FileOperations {
  onFileOpen: (filePath: string, diffInfo?: DiffInfo) => void;
  onFileEdit: (file: EditableFile) => void;
  onFileDelete: (filePath: string) => void;
  onFileCreate: (filePath: string, content: string) => void;
  onDirectoryCreate: (dirPath: string) => void;
}

// File tree state
export interface FileTreeState {
  files: FileItem[];
  expandedDirs: Set<string>;
  selectedFile: EditableFile | null;
  selectedImage: EditableFile | null;
  loading: boolean;
  error: string | null;
}

// File editor state
export interface FileEditorState {
  content: string;
  originalContent: string;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  language: string;
}

// File system API responses
export interface FileSystemResponse {
  files: FileItem[];
  total: number;
}

export interface FileContentResponse {
  content: string;
  encoding: string;
  size: number;
  lastModified: string;
}

// File validation
export interface FileValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Supported file types
export type SupportedFileType = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'html' 
  | 'css' 
  | 'json' 
  | 'markdown' 
  | 'text' 
  | 'image';

// File type configuration
export interface FileTypeConfig {
  extensions: string[];
  language: string;
  icon: string;
  editable: boolean;
  previewable: boolean;
}

// File search
export interface FileSearchQuery {
  query: string;
  fileTypes?: string[];
  includeContent?: boolean;
  caseSensitive?: boolean;
  useRegex?: boolean;
}

export interface FileSearchResult {
  file: FileItem;
  matches: Array<{
    line: number;
    content: string;
    startIndex: number;
    endIndex: number;
  }>;
}

// File permissions
export interface FilePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
  delete: boolean;
}