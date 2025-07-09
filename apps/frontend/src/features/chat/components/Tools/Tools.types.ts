export interface BaseToolProps {
  toolInput: string;
  autoExpandTools?: boolean;
  showRawParameters?: boolean;
  renderDefaultTool: () => React.ReactNode;
}

export interface ReadToolProps extends BaseToolProps {}

export interface EditToolProps extends BaseToolProps {
  createDiff?: (oldContent: string, newContent: string) => any[];
  onFileOpen?: (
    filePath: string,
    editContext?: {old_string: string; new_string: string},
  ) => void;
}

export interface WriteToolProps extends BaseToolProps {
  createDiff?: (oldContent: string, newContent: string) => any[];
  onFileOpen?: (
    filePath: string,
    editContext?: {old_string: string; new_string: string},
  ) => void;
}

export interface DefaultToolProps {
  toolName: string;
  toolInput: string;
  autoExpandTools?: boolean;
  showRawParameters?: boolean;
}

export interface TodoWriteToolProps extends BaseToolProps {}

export interface BashToolProps extends BaseToolProps {}

// Tool input types
export interface ReadToolInput {
  file_path: string;
  limit?: number;
  offset?: number;
}

export interface EditToolInput {
  file_path: string;
  old_string?: string;
  new_string?: string;
}

export interface WriteToolInput {
  file_path: string;
  content?: string;
}

export interface TodoItem {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface TodoWriteToolInput {
  todos?: TodoItem[];
}
