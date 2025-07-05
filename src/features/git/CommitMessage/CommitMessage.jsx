import React from 'react';
import { RefreshCw, Sparkles, Check } from 'lucide-react';
import { MicButton } from '@/shared-components/MicButton';
import {
  CommitSection,
  CommitTextareaContainer,
  CommitTextarea,
  CommitButtonGroup,
  CommitActionsContainer,
  FileCountText,
  CommitButton,
  IconButton
} from '@/features/git/CommitMessage/CommitMessage.styles';

export const CommitMessage = ({
  commitMessage,
  onCommitMessageChange,
  onGenerateMessage,
  onCommit,
  onTranscript,
  selectedFilesCount,
  isCommitting,
  isGeneratingMessage,
  textareaRef
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onCommit();
    }
  };

  return (
    <CommitSection>
      <CommitTextareaContainer>
        <CommitTextarea
          ref={textareaRef}
          value={commitMessage}
          onChange={(e) => onCommitMessageChange(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit)"
          rows="3"
          onKeyDown={handleKeyDown}
        />
        <CommitButtonGroup>
          <IconButton
            onClick={onGenerateMessage}
            disabled={selectedFilesCount === 0 || isGeneratingMessage}
            title="Generate commit message"
          >
            {isGeneratingMessage ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </IconButton>
          <MicButton
            onTranscript={onTranscript}
            mode="default"
            className="p-1.5"
          />
        </CommitButtonGroup>
      </CommitTextareaContainer>
      <CommitActionsContainer>
        <FileCountText>
          {selectedFilesCount} file{selectedFilesCount !== 1 ? 's' : ''} selected
        </FileCountText>
        <CommitButton
          onClick={onCommit}
          disabled={!commitMessage.trim() || selectedFilesCount === 0 || isCommitting}
        >
          <Check className="w-3 h-3" />
          <span>{isCommitting ? 'Committing...' : 'Commit'}</span>
        </CommitButton>
      </CommitActionsContainer>
    </CommitSection>
  );
};