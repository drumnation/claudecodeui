import React from 'react';
import * as S from '@/features/chat/components/Tools/WriteTool/WriteTool.styles';
import { parseToolInput, extractFilenameFromPath } from '@/features/chat/components/Tools/WriteTool/WriteTool.logic';

const WriteTool = ({ 
  toolInput, 
  autoExpandTools, 
  showRawParameters, 
  onFileOpen, 
  createDiff,
  renderDefaultTool 
}) => {
  const input = parseToolInput(toolInput);
  
  if (!input || !input.file_path || input.content === undefined) {
    return renderDefaultTool();
  }

  const handleFileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFileOpen && onFileOpen(input.file_path, {
      old_string: '',
      new_string: input.content
    });
  };

  return (
    <S.DetailsContainer open={autoExpandTools}>
      <S.DetailsSummary>
        <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </S.ChevronIcon>
        📄 Creating new file: 
        <S.FileButton onClick={handleFileClick}>
          {extractFilenameFromPath(input.file_path)}
        </S.FileButton>
      </S.DetailsSummary>
      <S.DiffContainer>
        <S.DiffWrapper>
          <S.DiffHeader>
            <S.DiffFilePath onClick={() => onFileOpen && onFileOpen(input.file_path, {
              old_string: '',
              new_string: input.content
            })}>
              {input.file_path}
            </S.DiffFilePath>
            <S.DiffLabel>New File</S.DiffLabel>
          </S.DiffHeader>
          <S.DiffContent>
            {createDiff('', input.content).map((diffLine, i) => (
              <S.DiffLine key={i}>
                <S.DiffLineNumber type={diffLine.type}>
                  {diffLine.type === 'removed' ? '-' : '+'}
                </S.DiffLineNumber>
                <S.DiffLineContent type={diffLine.type}>
                  {diffLine.content}
                </S.DiffLineContent>
              </S.DiffLine>
            ))}
          </S.DiffContent>
        </S.DiffWrapper>
        {showRawParameters && (
          <S.RawParametersDetails open={autoExpandTools}>
            <S.RawParametersSummary>View raw parameters</S.RawParametersSummary>
            <S.RawParametersContent>{toolInput}</S.RawParametersContent>
          </S.RawParametersDetails>
        )}
      </S.DiffContainer>
    </S.DetailsContainer>
  );
};

export default WriteTool;