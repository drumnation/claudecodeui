import React from 'react';
import {AlertTriangle, RefreshCw} from 'lucide-react';
import {ErrorBoundary} from './ErrorBoundary';
import * as S from './ErrorBoundary.styles';

export const MinimalErrorBoundary = ({children, name = 'Component'}: any) => {
  const minimalFallback = (error: any, retry: any) => (
    <S.MinimalErrorContainer>
      <S.MinimalErrorIcon>
        <AlertTriangle className="w-8 h-8" />
      </S.MinimalErrorIcon>
      <S.MinimalErrorText>{name} failed to load</S.MinimalErrorText>
      <S.MinimalErrorButton onClick={retry}>
        <RefreshCw className="w-3 h-3" />
        Retry
      </S.MinimalErrorButton>
    </S.MinimalErrorContainer>
  );

  return (
    <ErrorBoundary level="component" fallback={minimalFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default MinimalErrorBoundary;
