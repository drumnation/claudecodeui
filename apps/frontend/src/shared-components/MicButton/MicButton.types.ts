import {ButtonHTMLAttributes} from 'react';

export interface MicButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onError'> {
  onTranscript: (transcript: string) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: MicState) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  showVisualizer?: boolean;
  autoStop?: boolean;
  maxDuration?: number; // in seconds
}

export type MicState = 'idle' | 'listening' | 'processing' | 'error';

export interface AudioLevel {
  current: number;
  average: number;
  peak: number;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}
