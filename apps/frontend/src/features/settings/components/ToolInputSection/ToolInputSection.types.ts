export interface ToolInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: (value: string) => void;
  onKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}
