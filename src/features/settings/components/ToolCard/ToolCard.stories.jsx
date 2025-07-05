import React from 'react';
import { ToolCard } from './ToolCard';

export default {
  title: 'Features/Settings/Components/ToolCard',
  component: ToolCard,
  tags: ['autodocs'],
  argTypes: {
    tool: {
      control: 'text',
      description: 'The tool name to display',
    },
    variant: {
      control: 'select',
      options: ['allowed', 'blocked'],
      description: 'Visual variant of the card',
    },
    onRemove: {
      action: 'removed',
      description: 'Handler for when the remove button is clicked',
    },
  },
};

export const AllowedTool = {
  args: {
    tool: 'ReadFile',
    variant: 'allowed',
  },
};

export const BlockedTool = {
  args: {
    tool: 'ExecuteCommand',
    variant: 'blocked',
  },
};

export const LongToolName = {
  args: {
    tool: 'VeryLongToolNameThatMightCauseLayoutIssues',
    variant: 'allowed',
  },
};

export const Multiple = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <ToolCard tool="ReadFile" variant="allowed" onRemove={console.log} />
      <ToolCard tool="WriteFile" variant="allowed" onRemove={console.log} />
      <ToolCard tool="ExecuteCommand" variant="blocked" onRemove={console.log} />
      <ToolCard tool="DeleteFile" variant="blocked" onRemove={console.log} />
    </div>
  ),
};