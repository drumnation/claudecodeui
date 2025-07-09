import {ButtonHTMLAttributes} from 'react';

export interface CopyToClipboardButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  text: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showTooltip?: boolean;
  variant?: 'icon' | 'text' | 'both';
  size?: 'sm' | 'md' | 'lg';
}
