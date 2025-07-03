// Atoms - Basic building blocks
export { Button, buttonVariants } from './atoms/Button';
export type { ButtonProps } from './atoms/Button';

export { Input } from './atoms/Input';
export type { InputProps } from './atoms/Input';

export { Badge, badgeVariants } from './atoms/Badge';
export type { BadgeProps } from './atoms/Badge';

export { ScrollArea } from './atoms/ScrollArea';
export type { ScrollAreaProps } from './atoms/ScrollArea';

// Molecules - Composed components built from atoms  
export * from './molecules';

// Layouts - Complex layout components
export * from './layouts';

// All major components have been migrated to features/
// Use feature-based imports instead:
// - Shell: import { Shell } from '@/features/shell'
// - GitPanel: import { GitPanel } from '@/features/git'  
// - LivePreviewPanel: import { LivePreviewPanel } from '@/features/preview'