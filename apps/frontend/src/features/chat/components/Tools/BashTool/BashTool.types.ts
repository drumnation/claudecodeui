import {BaseToolProps} from '@/features/chat/components/Tools/Tools.types';

export interface BashToolProps extends BaseToolProps {}

export interface BashToolInput {
  command: string;
  description?: string;
  timeout?: number;
}

export type ToolInput = string | Record<string, any>;
