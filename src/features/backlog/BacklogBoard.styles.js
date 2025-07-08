import styled from '@emotion/styled';

export const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;

export const BoardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  flex-shrink: 0;
`;

export const BoardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

export const BoardControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const BoardContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ColumnsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
  }
`;

export const Column = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  background: ${props => props.isDragOver 
    ? props.theme.colors.primary + '10' 
    : props.theme.colors.surface};
  border: 1px solid ${props => props.isDragOver 
    ? props.theme.colors.primary 
    : props.theme.colors.border};
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    max-width: 100%;
    min-height: 200px;
  }
`;

export const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  border-radius: 0.5rem 0.5rem 0 0;
`;

export const ColumnTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ColumnCount = styled.span`
  font-size: 0.75rem;
  font-weight: 400;
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.border};
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
`;

export const ColumnContent = styled.div`
  flex: 1;
  padding: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const EmptyColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
`;

export const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  flex-wrap: wrap;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.375rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

export const FilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.isActive 
    ? props.theme.colors.primary 
    : props.theme.colors.background};
  color: ${props => props.isActive 
    ? 'white' 
    : props.theme.colors.text};
  border: 1px solid ${props => props.isActive 
    ? props.theme.colors.primary 
    : props.theme.colors.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.isActive 
      ? props.theme.colors.primaryDark 
      : props.theme.colors.border};
  }
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background}ee;
  z-index: 10;
`;

export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: ${props => props.theme.colors.error}10;
  color: ${props => props.theme.colors.error};
  border: 1px solid ${props => props.theme.colors.error}30;
  border-radius: 0.375rem;
  margin: 1rem;
`;

export const MetricsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-size: 0.875rem;
`;

export const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

export const MetricLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
`;

export const MetricValue = styled.span`
  font-weight: 600;
  color: ${props => props.color || props.theme.colors.text};
`;