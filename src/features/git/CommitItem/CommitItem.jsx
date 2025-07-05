import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  CommitItemContainer,
  CommitHeader,
  ExpandButton,
  CommitContent,
  CommitInfo,
  CommitMessage,
  CommitMeta,
  CommitHash,
  CommitDiffContainer,
  DiffStats,
  DiffLine
} from '@/features/git/CommitItem/CommitItem.styles';

export const CommitItem = ({ commit, isExpanded, diff, onToggleExpanded }) => {
  const renderDiffLine = (line, index) => {
    const isAddition = line.startsWith('+') && !line.startsWith('+++');
    const isDeletion = line.startsWith('-') && !line.startsWith('---');
    const isHeader = line.startsWith('@@');
    
    return (
      <DiffLine
        key={index}
        isAddition={isAddition}
        isDeletion={isDeletion}
        isHeader={isHeader}
      >
        {line}
      </DiffLine>
    );
  };

  return (
    <CommitItemContainer>
      <CommitHeader onClick={onToggleExpanded}>
        <ExpandButton>
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </ExpandButton>
        <CommitContent>
          <CommitInfo>
            <CommitMessage>{commit.message}</CommitMessage>
            <CommitMeta>
              {commit.author} • {commit.date}
            </CommitMeta>
          </CommitInfo>
          <CommitHash>{commit.hash.substring(0, 7)}</CommitHash>
        </CommitContent>
      </CommitHeader>
      {isExpanded && diff && (
        <CommitDiffContainer>
          <DiffStats>{commit.stats}</DiffStats>
          {diff.split('\n').map((line, index) => renderDiffLine(line, index))}
        </CommitDiffContainer>
      )}
    </CommitItemContainer>
  );
};