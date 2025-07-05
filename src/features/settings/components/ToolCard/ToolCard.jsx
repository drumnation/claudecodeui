import React from 'react';
import { ToolItem, ToolName, RemoveButton, RemoveIcon } from './ToolCard.styles';

export const ToolCard = ({ tool, variant, onRemove }) => {
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