import React from 'react';
import { FileItem } from '@/features/git/FileItem';
import { GitCommit, RefreshCw } from 'lucide-react';
import {
  FileListContainer,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateText,
  LoadingContainer,
  FileListContent
} from '@/features/git/FileList/FileList.styles';

export const FileList = ({
  gitStatus,
  gitDiff,
  expandedFiles,
  selectedFiles,
  isLoading,
  isMobile,
  wrapText,
  onToggleFileExpanded,
  onToggleFileSelected,
  onToggleWrapText
}) => {
  if (isLoading) {
    return (
      <FileListContainer isMobile={isMobile}>
        <LoadingContainer>
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </LoadingContainer>
      </FileListContainer>
    );
  }

  const hasChanges = gitStatus && (
    gitStatus.modified?.length > 0 ||
    gitStatus.added?.length > 0 ||
    gitStatus.deleted?.length > 0 ||
    gitStatus.untracked?.length > 0
  );

  if (!hasChanges) {
    return (
      <FileListContainer isMobile={isMobile}>
        <EmptyStateContainer>
          <EmptyStateIcon>
            <GitCommit className="w-12 h-12 opacity-50" />
          </EmptyStateIcon>
          <EmptyStateText>No changes detected</EmptyStateText>
        </EmptyStateContainer>
      </FileListContainer>
    );
  }

  return (
    <FileListContainer isMobile={isMobile}>
      <FileListContent isMobile={isMobile}>
        {gitStatus.modified?.map(file => (
          <FileItem
            key={file}
            filePath={file}
            status="M"
            diff={gitDiff[file]}
            isExpanded={expandedFiles.has(file)}
            isSelected={selectedFiles.has(file)}
            isMobile={isMobile}
            wrapText={wrapText}
            onToggleExpanded={() => onToggleFileExpanded(file)}
            onToggleSelected={() => onToggleFileSelected(file)}
            onToggleWrapText={onToggleWrapText}
          />
        ))}
        {gitStatus.added?.map(file => (
          <FileItem
            key={file}
            filePath={file}
            status="A"
            diff={gitDiff[file]}
            isExpanded={expandedFiles.has(file)}
            isSelected={selectedFiles.has(file)}
            isMobile={isMobile}
            wrapText={wrapText}
            onToggleExpanded={() => onToggleFileExpanded(file)}
            onToggleSelected={() => onToggleFileSelected(file)}
            onToggleWrapText={onToggleWrapText}
          />
        ))}
        {gitStatus.deleted?.map(file => (
          <FileItem
            key={file}
            filePath={file}
            status="D"
            diff={gitDiff[file]}
            isExpanded={expandedFiles.has(file)}
            isSelected={selectedFiles.has(file)}
            isMobile={isMobile}
            wrapText={wrapText}
            onToggleExpanded={() => onToggleFileExpanded(file)}
            onToggleSelected={() => onToggleFileSelected(file)}
            onToggleWrapText={onToggleWrapText}
          />
        ))}
        {gitStatus.untracked?.map(file => (
          <FileItem
            key={file}
            filePath={file}
            status="U"
            diff={gitDiff[file]}
            isExpanded={expandedFiles.has(file)}
            isSelected={selectedFiles.has(file)}
            isMobile={isMobile}
            wrapText={wrapText}
            onToggleExpanded={() => onToggleFileExpanded(file)}
            onToggleSelected={() => onToggleFileSelected(file)}
            onToggleWrapText={onToggleWrapText}
          />
        ))}
      </FileListContent>
    </FileListContainer>
  );
};