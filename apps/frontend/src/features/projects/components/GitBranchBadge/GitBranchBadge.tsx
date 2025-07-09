import React from 'react';
import {GitBranch} from 'lucide-react';
import * as S from './GitBranchBadge.styles';
import {GitBranchBadgeProps} from './GitBranchBadge.types';

export const GitBranchBadge = ({branch, gitStatus}: GitBranchBadgeProps) => {
  if (!branch) return null;

  // Determine badge color based on git status
  let variant = 'default';
  if (gitStatus) {
    if (gitStatus.modified > 0 || gitStatus.staged > 0) {
      variant = 'modified'; // Yellow/amber for uncommitted changes
    } else if (gitStatus.untracked > 0) {
      variant = 'untracked'; // Blue for untracked files only
    }
  }

  return (
    <S.Badge
      variant={variant}
      title={`Branch: ${branch}${gitStatus ? ` (${gitStatus.modified} modified, ${gitStatus.untracked} untracked, ${gitStatus.staged} staged)` : ''}`}
    >
      <S.Icon>
        <GitBranch className="w-3 h-3" />
      </S.Icon>
      <S.Text>{branch}</S.Text>
    </S.Badge>
  );
};
