import styled from '@emotion/styled';

export const DetailsContainer = styled.details`
  margin-top: 8px;
`;

export const DetailsSummary = styled.summary`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  background-color: #f3f4f6;
  transition: background-color 200ms;
  font-size: 13px;
  color: #4b5563;
  user-select: none;

  &:hover {
    background-color: #e5e7eb;
  }

  @media (prefers-color-scheme: dark) {
    background-color: #374151;
    color: #d1d5db;

    &:hover {
      background-color: #4b5563;
    }
  }
`;

export const ChevronIcon = styled.svg`
  width: 16px;
  height: 16px;
  transition: transform 200ms;

  details[open] & {
    transform: rotate(90deg);
  }
`;

export const TerminalContainer = styled.div`
  margin-top: 8px;
`;

export const Terminal = styled.div`
  background-color: #000000;
  border: 1px solid #00ff00;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
`;

export const TerminalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #000000;
  border-bottom: 1px solid #00ff00;
`;

export const TerminalIcon = styled.svg`
  width: 16px;
  height: 16px;
  color: #00ff00;
`;

export const TerminalLabel = styled.span`
  font-size: 12px;
  color: #00ff00;
  font-weight: 500;
`;

export const TerminalCommand = styled.div`
  padding: 12px;
  font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #00ff00;
  background-color: #000000;
`;

export const CommandDescription = styled.div`
  font-size: 12px;
  color: #64748b;
  padding: 0 4px;
  margin-bottom: 8px;

  @media (prefers-color-scheme: dark) {
    color: #94a3b8;
  }
`;

export const RawParametersDetails = styled.details`
  margin-top: 8px;
`;

export const RawParametersSummary = styled.summary`
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  padding: 4px 0;

  &:hover {
    color: #4b5563;
  }

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;

    &:hover {
      color: #d1d5db;
    }
  }
`;

export const RawParametersContent = styled.pre`
  margin-top: 8px;
  padding: 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;

  @media (prefers-color-scheme: dark) {
    background-color: #1f2937;
    border-color: #374151;
    color: #d1d5db;
  }
`;