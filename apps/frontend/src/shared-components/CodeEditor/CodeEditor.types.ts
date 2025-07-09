export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
  tabSize?: number;
  showMinimap?: boolean;
  highlightActiveLine?: boolean;
  onSave?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export interface EditorHeaderProps {
  filename?: string;
  language?: string;
  onClose?: () => void;
  actions?: React.ReactNode;
}

export interface EditorFooterProps {
  line?: number;
  column?: number;
  selection?: {start: number; end: number};
  language?: string;
}

export interface EditorActionsProps {
  onCopy?: () => void;
  onFormat?: () => void;
  onToggleWrap?: () => void;
  isWrapped?: boolean;
}
