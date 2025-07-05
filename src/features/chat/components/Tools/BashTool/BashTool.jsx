import React from 'react';
import * as S from '@/features/chat/components/Tools/BashTool/BashTool.styles';
import { parseToolInput } from '@/features/chat/components/Tools/BashTool/BashTool.logic';

const BashTool = ({ toolInput, autoExpandTools, showRawParameters, renderDefaultTool }) => {
  const input = parseToolInput(toolInput);
  
  if (!input || !input.command) {
    return renderDefaultTool();
  }

  return (
    <S.DetailsContainer open={autoExpandTools}>
      <S.DetailsSummary>
        <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </S.ChevronIcon>
        Running command
      </S.DetailsSummary>
      <S.TerminalContainer>
        <S.Terminal>
          <S.TerminalHeader>
            <S.TerminalIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </S.TerminalIcon>
            <S.TerminalLabel>Terminal</S.TerminalLabel>
          </S.TerminalHeader>
          <S.TerminalCommand>$ {input.command}</S.TerminalCommand>
        </S.Terminal>
        {input.description && (
          <S.CommandDescription>{input.description}</S.CommandDescription>
        )}
        {showRawParameters && (
          <S.RawParametersDetails>
            <S.RawParametersSummary>View raw parameters</S.RawParametersSummary>
            <S.RawParametersContent>{toolInput}</S.RawParametersContent>
          </S.RawParametersDetails>
        )}
      </S.TerminalContainer>
    </S.DetailsContainer>
  );
};

export default BashTool;