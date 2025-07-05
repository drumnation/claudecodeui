import React from 'react';
import { ToolInputSection } from './ToolInputSection';

export default {
  title: 'Features/Settings/Components/ToolInputSection',
  component: ToolInputSection,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current input value',
    },
    onChange: {
      action: 'changed',
      description: 'Handler for input value changes',
    },
    onAdd: {
      action: 'added',
      description: 'Handler for when the add button is clicked',
    },
    onKeyPress: {
      action: 'keyPressed',
      description: 'Handler for key press events',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
  },
};

export const Default = {
  args: {
    value: '',
    placeholder: 'Enter tool name',
  },
};

export const WithValue = {
  args: {
    value: 'ReadFile',
    placeholder: 'Enter tool name',
  },
};

export const Disabled = {
  args: {
    value: '',
    placeholder: 'Enter tool name',
  },
};

export const Interactive = {
  render: function Component() {
    const [value, setValue] = React.useState('');
    const [tools, setTools] = React.useState([]);

    const handleAdd = (tool) => {
      if (tool) {
        setTools([...tools, tool]);
        setValue('');
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleAdd(value);
      }
    };

    return (
      <div>
        <ToolInputSection
          value={value}
          onChange={setValue}
          onAdd={handleAdd}
          onKeyPress={handleKeyPress}
          placeholder="Enter tool name and press Enter"
        />
        {tools.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <strong>Added tools:</strong>
            <ul style={{ marginTop: '8px' }}>
              {tools.map((tool, index) => (
                <li key={index}>{tool}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};