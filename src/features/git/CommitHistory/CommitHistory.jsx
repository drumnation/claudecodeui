import React from 'react';
import { History, RefreshCw } from 'lucide-react';
import { CommitItem } from '@/features/git/CommitItem';
import {
  HistoryContainer,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateText,
  LoadingContainer,
  HistoryContent
} from '@/features/git/CommitHistory/CommitHistory.styles';

export const CommitHistory = ({
  recentCommits,
  expandedCommits,
  commitDiffs,
  isLoading,
  isMobile,
  onToggleCommitExpanded
}) => {
  if (isLoading) {
    return (
      <HistoryContainer isMobile={isMobile}>
        <LoadingContainer>
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </LoadingContainer>
      </HistoryContainer>
    );
  }

  if (recentCommits.length === 0) {
    return (
      <HistoryContainer isMobile={isMobile}>
        <EmptyStateContainer>
          <EmptyStateIcon>
            <History className="w-12 h-12 opacity-50" />
          </EmptyStateIcon>
          <EmptyStateText>No commits found</EmptyStateText>
        </EmptyStateContainer>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer isMobile={isMobile}>
      <HistoryContent isMobile={isMobile}>
        {recentCommits.map(commit => (
          <CommitItem
            key={commit.hash}
            commit={commit}
            isExpanded={expandedCommits.has(commit.hash)}
            diff={commitDiffs[commit.hash]}
            onToggleExpanded={() => onToggleCommitExpanded(commit.hash)}
          />
        ))}
      </HistoryContent>
    </HistoryContainer>
  );
};