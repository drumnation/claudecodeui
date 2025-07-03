/**
 * Files Feature - Main export file
 * Following Bulletproof React feature-slice pattern
 */

// Types
export type {
  FileItem,
  EditableFile,
  DiffInfo,
  FileOperations,
  FileTreeState,
  FileEditorState,
  FileSystemResponse,
  FileContentResponse,
  FileValidation,
  SupportedFileType,
  FileTypeConfig,
  FileSearchQuery,
  FileSearchResult,
  FilePermissions,
} from './types';

// API (to be created)
// export { filesAPI, FilesAPI } from './api';

// Hooks (to be created)
// export { useFileTree } from './hooks/useFileTree';
// export { useFileEditor } from './hooks/useFileEditor';

// Components
export { FileTree } from './components/FileTree';
export { CodeEditor } from './components/CodeEditor';
export { ImageViewer } from './components/ImageViewer';