import {HTMLAttributes, ReactNode} from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}
