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

export const FileButton = styled.button`
  margin-left: 4px;
  padding: 2px 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 200ms;

  &:hover {
    background-color: #2563eb;
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const DiffContainer = styled.div`
  margin-top: 8px;
`;

export const DiffWrapper = styled.div`
  background-color: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;

  @media (prefers-color-scheme: dark) {
    background-color: #1e293b;
    border-color: #334155;
  }
`;

export const DiffHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;

  @media (prefers-color-scheme: dark) {
    background-color: #0f172a;
    border-bottom-color: #334155;
  }
`;

export const DiffFilePath = styled.button`
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 12px;
  color: #2563eb;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 200ms;

  &:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }

  @media (prefers-color-scheme: dark) {
    color: #60a5fa;

    &:hover {
      color: #93bbfc;
    }
  }
`;

export const DiffLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

export const DiffContent = styled.div`
  max-height: 400px;
  overflow-y: auto;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
`;

export const DiffLine = styled.div`
  display: flex;
  white-space: pre-wrap;
  word-break: break-all;
`;

export const DiffLineNumber = styled.span`
  flex-shrink: 0;
  width: 40px;
  padding: 0 8px;
  text-align: center;
  color: #6b7280;
  background-color: ${props => 
    props.type === 'removed' ? '#fee2e2' : 
    props.type === 'added' ? '#dcfce7' : 
    'transparent'
  };

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
    background-color: ${props => 
      props.type === 'removed' ? 'rgba(254, 202, 202, 0.1)' : 
      props.type === 'added' ? 'rgba(187, 247, 208, 0.1)' : 
      'transparent'
    };
  }
`;

export const DiffLineContent = styled.span`
  flex: 1;
  padding: 0 12px;
  background-color: ${props => 
    props.type === 'removed' ? '#fee2e2' : 
    props.type === 'added' ? '#dcfce7' : 
    'transparent'
  };
  color: ${props => 
    props.type === 'removed' ? '#991b1b' : 
    props.type === 'added' ? '#166534' : 
    '#374151'
  };

  @media (prefers-color-scheme: dark) {
    background-color: ${props => 
      props.type === 'removed' ? 'rgba(254, 202, 202, 0.1)' : 
      props.type === 'added' ? 'rgba(187, 247, 208, 0.1)' : 
      'transparent'
    };
    color: ${props => 
      props.type === 'removed' ? '#fca5a5' : 
      props.type === 'added' ? '#86efac' : 
      '#e5e7eb'
    };
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