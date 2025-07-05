import React from 'react';
import { TodoList } from './components/TodoList';
import * as S from './TodoWriteTool.styles';
import { parseToolInput } from './TodoWriteTool.logic';

export const TodoWriteTool = ({ toolInput, autoExpandTools, showRawParameters, renderDefaultTool }) => {
  const input = parseToolInput(toolInput);
  
  if (!input || !input.todos || !Array.isArray(input.todos)) {
    return renderDefaultTool();
  }

  return (
    <S.DetailsContainer open={autoExpandTools}>
      <S.DetailsSummary>
        <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </S.ChevronIcon>
        Updating Todo List
      </S.DetailsSummary>
      <S.DiffContainer>
        <TodoList todos={input.todos} />
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

