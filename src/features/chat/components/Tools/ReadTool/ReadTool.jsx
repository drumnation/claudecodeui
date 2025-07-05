import React from 'react';
import * as S from '@/features/chat/components/Tools/ReadTool/ReadTool.styles';
import { parseToolInput, getRelevantPathParts } from '@/features/chat/components/Tools/ReadTool/ReadTool.logic';

const ReadTool = ({ toolInput, autoExpandTools, showRawParameters, renderDefaultTool }) => {
  const input = parseToolInput(toolInput);
  
  if (!input || !input.file_path) {
    return renderDefaultTool();
  }

  const { relativePath, filename } = getRelevantPathParts(input.file_path);

  return (
    <S.DetailsContainer open={autoExpandTools}>
      <S.FileReadSummary>
        <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </S.ChevronIcon>
        <S.FileIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </S.FileIcon>
        <S.FilePath>{relativePath}</S.FilePath>
        <S.FileName>{filename}</S.FileName>
      </S.FileReadSummary>
      {showRawParameters && (
        <S.DiffContainer>
          <S.RawParametersDetails>
            <S.RawParametersSummary>View raw parameters</S.RawParametersSummary>
            <S.RawParametersContent>{toolInput}</S.RawParametersContent>
          </S.RawParametersDetails>
        </S.DiffContainer>
      )}
    </S.DetailsContainer>
  );
};

export default ReadTool;