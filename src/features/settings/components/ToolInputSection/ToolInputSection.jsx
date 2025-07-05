import React from 'react';
import { 
  ToolInputWrapper, 
  ToolInput,
  AddButton,
  PlusIcon,
  ButtonText
} from './ToolInputSection.styles';

export const ToolInputSection = ({ 
  value, 
  onChange, 
  onAdd, 
  onKeyPress, 
  placeholder 
}) => {
  return (
    <ToolInputWrapper>
      <ToolInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyPress={onKeyPress}
      />
      <AddButton
        onClick={() => onAdd(value)}
        disabled={!value}
        size="sm"
      >
        <PlusIcon />
        <ButtonText>Add Tool</ButtonText>
      </AddButton>
    </ToolInputWrapper>
  );
};