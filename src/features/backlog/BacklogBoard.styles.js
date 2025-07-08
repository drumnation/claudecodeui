import styled from '@emotion/styled';

export const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgb(255 255 255);
  color: rgb(0 0 0);
  position: relative;
  
  .dark & {
    background-color: rgb(17 24 39);
    color: rgb(255 255 255);
  }
`;

export const BoardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgb(229 231 235);
  background-color: rgb(249 250 251);
  flex-shrink: 0;
  
  .dark & {
    border-bottom-color: rgb(55 65 81);
    background-color: rgb(31 41 55);
  }
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
    ? 'rgba(59, 130, 246, 0.1)' 
    : 'rgb(249 250 251)'};
  border: 1px solid ${props => props.isDragOver 
    ? 'rgb(59, 130, 246)' 
    : 'rgb(229 231 235)'};
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    max-width: 100%;
    min-height: 200px;
  }
  
  .dark & {
    background: ${props => props.isDragOver 
      ? 'rgba(59, 130, 246, 0.1)' 
      : 'rgb(31 41 55)'};
    border-color: ${props => props.isDragOver 
      ? 'rgb(59, 130, 246)' 
      : 'rgb(55 65 81)'};
  }
`;

export const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgb(229 231 235);
  background-color: rgb(255 255 255);
  border-radius: 0.5rem 0.5rem 0 0;
  
  .dark & {
    border-bottom-color: rgb(55 65 81);
    background-color: rgb(17 24 39);
  }
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
  color: rgb(107 114 128);
  background: rgb(229 231 235);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  
  .dark & {
    color: rgb(156 163 175);
    background: rgb(55 65 81);
  }
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
  color: rgb(107 114 128);
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
  
  .dark & {
    color: rgb(156 163 175);
  }
`;

export const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgb(249 250 251);
  border-bottom: 1px solid rgb(229 231 235);
  flex-wrap: wrap;
  
  .dark & {
    background: rgb(31 41 55);
    border-bottom-color: rgb(55 65 81);
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.5rem 1rem;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.375rem;
  background: rgb(255 255 255);
  color: rgb(0 0 0);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: rgb(59 130 246);
  }

  &::placeholder {
    color: rgb(107 114 128);
  }
  
  .dark & {
    border-color: rgb(55 65 81);
    background: rgb(17 24 39);
    color: rgb(255 255 255);
    
    &::placeholder {
      color: rgb(156 163 175);
    }
  }
`;

export const FilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.isActive 
    ? 'rgb(59 130 246)' 
    : 'rgb(255 255 255)'};
  color: ${props => props.isActive 
    ? 'white' 
    : 'rgb(0 0 0)'};
  border: 1px solid ${props => props.isActive 
    ? 'rgb(59 130 246)' 
    : 'rgb(229 231 235)'};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.isActive 
      ? 'rgb(37 99 235)' 
      : 'rgb(229 231 235)'};
  }
  
  .dark & {
    background: ${props => props.isActive 
      ? 'rgb(59 130 246)' 
      : 'rgb(17 24 39)'};
    color: ${props => props.isActive 
      ? 'white' 
      : 'rgb(255 255 255)'};
    border-color: ${props => props.isActive 
      ? 'rgb(59 130 246)' 
      : 'rgb(55 65 81)'};
    
    &:hover {
      background: ${props => props.isActive 
        ? 'rgb(37 99 235)' 
        : 'rgb(55 65 81)'};
    }
  }
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.93);
  z-index: 10;
  
  .dark & {
    background: rgba(17, 24, 39, 0.93);
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.06);
  color: rgb(239 68 68);
  border: 1px solid rgba(239, 68, 68, 0.19);
  border-radius: 0.375rem;
  margin: 1rem;
`;

export const MetricsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: rgb(249 250 251);
  border-bottom: 1px solid rgb(229 231 235);
  font-size: 0.875rem;
  
  .dark & {
    background: rgb(31 41 55);
    border-bottom-color: rgb(55 65 81);
  }
`;

export const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

export const MetricLabel = styled.span`
  color: rgb(107 114 128);
  
  .dark & {
    color: rgb(156 163 175);
  }
`;

export const MetricValue = styled.span`
  font-weight: 600;
  color: ${props => props.color || 'rgb(0 0 0)'};
  
  .dark & {
    color: ${props => props.color || 'rgb(255 255 255)'};
  }
`;