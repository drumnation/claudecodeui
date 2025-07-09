export interface SettingToggleProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  description: string;
}
