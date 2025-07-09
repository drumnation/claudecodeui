export interface ToolCardProps {
  tool: string;
  variant?: 'default' | 'active' | 'dark';
  onRemove: (tool: string) => void;
}
