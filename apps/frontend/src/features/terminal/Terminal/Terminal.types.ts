import {RefObject} from 'react';

export interface TerminalProps {
  terminalRef: RefObject<HTMLDivElement>;
  isInitialized: boolean;
}
