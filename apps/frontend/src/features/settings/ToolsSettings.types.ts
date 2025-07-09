export interface ToolsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: ToolsConfig) => void;
}

export interface ToolsConfig {
  claude: ClaudeSettings;
  editor: EditorSettings;
  terminal: TerminalSettings;
  preview: PreviewSettings;
  git: GitSettings;
  advanced: AdvancedSettings;
}

export interface ClaudeSettings {
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  customInstructions?: string;
}

export interface EditorSettings {
  theme: string;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  formatOnSave: boolean;
}

export interface TerminalSettings {
  shell: string;
  fontSize: number;
  theme: string;
  cursorStyle: 'block' | 'bar' | 'underline';
  scrollback: number;
}

export interface PreviewSettings {
  defaultPort: number;
  autoOpen: boolean;
  defaultDevice: string;
  enableHotReload: boolean;
}

export interface GitSettings {
  autoFetch: boolean;
  fetchInterval: number;
  defaultBranch: string;
  signCommits: boolean;
  pushDefault: 'simple' | 'current' | 'upstream';
}

export interface AdvancedSettings {
  enableTelemetry: boolean;
  debugMode: boolean;
  experimentalFeatures: string[];
  customKeybindings: Record<string, string>;
}

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface SettingItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  error?: string;
}
