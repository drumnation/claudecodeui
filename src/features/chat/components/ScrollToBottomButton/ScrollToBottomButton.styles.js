import styled from '@emotion/styled';

export const StyledButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background-color: #2563eb;
  color: white;
  border-radius: 50%;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms;
  z-index: 10;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #1d4ed8;
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Dark mode ring offset */
  @media (prefers-color-scheme: dark) {
    &:focus-visible {
      outline-offset: -2px;
      outline-color: #1f2937;
    }
  }
`;

export const StyledIcon = styled.svg`
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
`;