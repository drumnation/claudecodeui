import React from 'react';
import * as S from './DefaultTool.styles';

const DefaultTool = ({ toolInput, autoExpandTools }) => {
  return (
    <S.DetailsContainer open={autoExpandTools}>
      <S.DetailsSummary>
        <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </S.ChevronIcon>
        View input parameters
      </S.DetailsSummary>
      <S.RawParametersContent>{toolInput}</S.RawParametersContent>
    </S.DetailsContainer>
  );
};

export default DefaultTool;