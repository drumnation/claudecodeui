import {HTMLAttributes, ReactNode, UIEvent} from 'react';

export interface ScrollAreaProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onScroll'> {
  children: ReactNode;
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollbarSize?: 'sm' | 'md' | 'lg';
  hideScrollbar?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  showScrollbar?: 'always' | 'hover' | 'never';
  scrollbarWidth?: number;
  onScroll?: (event: ScrollEvent) => void;
  onReachEnd?: () => void;
  onReachTop?: () => void;
}

export interface ScrollEvent {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
}
