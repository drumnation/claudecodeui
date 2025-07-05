import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getStatusLabel } from '@/features/git/GitPanel.logic';
import {
  FileItemContainer,
  FileItemHeader,
  FileItemCheckbox,
  FileItemContent,
  ExpandButton,
  FilePath,
  StatusBadge,
  DiffContainer,
  DiffControls,
  DiffContent,
  DiffLine,
  WrapToggleButton
} from '@/features/git/FileItem/FileItem.styles';

export const FileItem = ({
  filePath,
  status,
  diff,
  isExpanded,
  isSelected,
  isMobile,
  wrapText,
  onToggleExpanded,
  onToggleSelected,
  onToggleWrapText
}) => {
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
        wrapText={isMobile && wrapText}
      >
        {line}
      </DiffLine>
    );
  };

  return (
    <FileItemContainer>
      <FileItemHeader>
        <FileItemCheckbox
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelected}
          onClick={(e) => e.stopPropagation()}
        />
        <FileItemContent onClick={onToggleExpanded}>
          <ExpandButton>
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </ExpandButton>
          <FilePath>{filePath}</FilePath>
          <StatusBadge status={status} title={getStatusLabel(status)}>
            {status}
          </StatusBadge>
        </FileItemContent>
      </FileItemHeader>
      {isExpanded && diff && (
        <DiffContainer>
          {isMobile && (
            <DiffControls>
              <WrapToggleButton
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWrapText();
                }}
                title={wrapText ? "Switch to horizontal scroll" : "Switch to text wrap"}
              >
                {wrapText ? '↔️ Scroll' : '↩️ Wrap'}
              </WrapToggleButton>
            </DiffControls>
          )}
          <DiffContent>
            {diff.split('\n').map((line, index) => renderDiffLine(line, index))}
          </DiffContent>
        </DiffContainer>
      )}
    </FileItemContainer>
  );
};