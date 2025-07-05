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

export const DiffContainer = styled.div`
  margin-top: 8px;
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