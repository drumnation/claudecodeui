import React from 'react';
import * as S from './EditTool.styles';
import { parseToolInput, extractFilenameFromPath } from './EditTool.logic';

const EditTool = ({ 
  toolInput, 
  autoExpandTools, 
  showRawParameters, 
  onFileOpen, 
  createDiff,
  renderDefaultTool 
}) => {
  const input = parseToolInput(toolInput);
  
  if (!input || !input.file_path || !input.old_string || !input.new_string) {
    return renderDefaultTool();
  }

  const handleFileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFileOpen && onFileOpen(input.file_path, {
      old_string: input.old_string,
      new_string: input.new_string
    });
  };

  return (
    <S.DetailsContainer open={autoExpandTools}>
      <S.DetailsSummary>
        <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </S.ChevronIcon>
        📝 View edit diff for 
        <S.FileButton onClick={handleFileClick}>
          {extractFilenameFromPath(input.file_path)}
        </S.FileButton>
      </S.DetailsSummary>
      <S.DiffContainer>
        <S.DiffWrapper>
          <S.DiffHeader>
            <S.DiffFilePath onClick={() => onFileOpen && onFileOpen(input.file_path, {
              old_string: input.old_string,
              new_string: input.new_string
            })}>
              {input.file_path}
            </S.DiffFilePath>
            <S.DiffLabel>Diff</S.DiffLabel>
          </S.DiffHeader>
          <S.DiffContent>
            {createDiff(input.old_string, input.new_string).map((diffLine, i) => (
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

export default EditTool;