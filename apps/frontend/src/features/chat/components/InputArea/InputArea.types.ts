import {RefObject} from 'react';

export interface FileItem {
  name: string;
  path: string;
}

export interface Command {
  command: string;
  description: string;
}

export interface InputAreaProps {
  input: string;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
  textareaExpanded: boolean;
  setTextareaExpanded: (expanded: boolean) => void;
  isLoading: boolean;
  claudeStatus: string;
  connectionHealth: 'connected' | 'disconnected' | 'connecting';
  lastUpdateTime: number | null;
  showCommandMenu: boolean;
  filteredCommands: Command[];
  showFileDropdown: boolean;
  filteredFiles: FileItem[];
  selectedFileIndex: number;
  selectedCommandIndex: number;
  textareaRef: RefObject<HTMLTextAreaElement>;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleTextareaClick: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleTranscript: (transcript: string) => void;
  handleAbortSession: () => void;
  selectCommand: (command: Command) => void;
  selectFile: (file: FileItem) => void;
  setInput: (input: string) => void;
  setCursorPosition: (position: number) => void;

  // Optional props with defaults
  fileList?: FileItem[];
  slashCommands?: Command[];
  cursorPosition?: number;
  atSymbolPosition?: number;
  setAtSymbolPosition?: (position: number) => void;
  slashPosition?: number;
  setSlashPosition?: (position: number) => void;
  setShowFileDropdown?: (show: boolean) => void;
  setShowCommandMenu?: (show: boolean) => void;
  setFilteredFiles?: (files: FileItem[]) => void;
  setFilteredCommands?: (commands: Command[]) => void;
  setSelectedFileIndex?: (index: number) => void;
  setSelectedCommandIndex?: (index: number) => void;
  messageQueue?: any[];
}

export interface InputAreaHookProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
  fileList: FileItem[];
  slashCommands: Command[];
  showFileDropdown: boolean;
  setShowFileDropdown: (show: boolean) => void;
  showCommandMenu: boolean;
  setShowCommandMenu: (show: boolean) => void;
  filteredFiles: FileItem[];
  setFilteredFiles: (files: FileItem[]) => void;
  filteredCommands: Command[];
  setFilteredCommands: (commands: Command[]) => void;
  selectedFileIndex: number;
  setSelectedFileIndex: (index: number) => void;
  selectedCommandIndex: number;
  setSelectedCommandIndex: (index: number) => void;
  cursorPosition: number;
  setCursorPosition: (position: number) => void;
  atSymbolPosition: number;
  setAtSymbolPosition: (position: number) => void;
  slashPosition: number;
  setSlashPosition: (position: number) => void;
  textareaExpanded: boolean;
  setTextareaExpanded: (expanded: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  selectCommand: (command: Command) => void;
  selectFile: (file: FileItem) => void;
}

export interface InputAreaHookReturn {
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleTextareaClick: () => void;
  handleTextareaInput: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  selectFile: (file: FileItem) => void;
  selectCommand: (command: Command) => void;
  handleClear: () => void;
  canSubmit: boolean;
}
