import React from 'react';
import {ToolItem, ToolName, RemoveButton, RemoveIcon} from './ToolCard.styles';
import type {ToolCardProps} from './ToolCard.types';

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  variant = 'default',
  onRemove,
}) => {
  return (
    <ToolItem $variant={variant}>
      <ToolName $variant={variant}>{tool}</ToolName>
      <RemoveButton
        variant="ghost"
        size="sm"
        onClick={() => onRemove(tool)}
        $variant={variant}
      >
        <RemoveIcon />
      </RemoveButton>
    </ToolItem>
  );
};
