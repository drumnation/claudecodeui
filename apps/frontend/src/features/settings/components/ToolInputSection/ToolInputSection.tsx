import React from 'react';
import {
  ToolInputWrapper,
  ToolInput,
  AddButton,
  PlusIcon,
  ButtonText,
} from './ToolInputSection.styles';
import type {ToolInputSectionProps} from './ToolInputSection.types';

export const ToolInputSection: React.FC<ToolInputSectionProps> = ({
  value,
  onChange,
  onAdd,
  onKeyPress,
  placeholder = 'Enter tool name',
}) => {
  return (
    <ToolInputWrapper>
      <ToolInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyPress={onKeyPress}
      />
      <AddButton onClick={() => onAdd(value)} disabled={!value} size="sm">
        <PlusIcon />
        <ButtonText>Add Tool</ButtonText>
      </AddButton>
    </ToolInputWrapper>
  );
};
