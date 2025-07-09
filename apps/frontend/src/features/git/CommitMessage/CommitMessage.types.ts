import {RefObject} from 'react';

export interface CommitMessageProps {
  commitMessage: string;
  onCommitMessageChange: (message: string) => void;
  onGenerateMessage: () => void;
  onCommit: () => void;
  onTranscript: (transcript: string) => void;
  selectedFilesCount: number;
  isCommitting: boolean;
  isGeneratingMessage: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
}
