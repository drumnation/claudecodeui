import React from 'react';
import { ScrollArea } from '@/shared-components/ScrollArea/ScrollArea';

export default {
  title: 'Shared Components/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    showScrollbar: {
      control: { type: 'select' },
      options: ['hover', 'always', 'never'],
      description: 'When to show the scrollbar',
    },
    scrollbarWidth: {
      control: { type: 'range', min: 4, max: 20, step: 2 },
      description: 'Width of the scrollbar in pixels',
    },
  },
};

const LongContent = () => (
  <>
    {Array.from({ length: 50 }, (_, i) => (
      <div key={i} style={{ padding: '8px', borderBottom: '1px solid #e5e5e5' }}>
        Item {i + 1} - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </div>
    ))}
  </>
);

export const Default = {
  args: {
    showScrollbar: 'hover',
    scrollbarWidth: 10,
  },
  render: (args) => (
    <ScrollArea {...args} style={{ width: '300px', height: '400px', border: '1px solid #ccc' }}>
      <LongContent />
    </ScrollArea>
  ),
};

export const AlwaysVisible = {
  args: {
    showScrollbar: 'always',
    scrollbarWidth: 10,
  },
  render: (args) => (
    <ScrollArea {...args} style={{ width: '300px', height: '400px', border: '1px solid #ccc' }}>
      <LongContent />
    </ScrollArea>
  ),
};

export const CustomWidth = {
  args: {
    showScrollbar: 'always',
    scrollbarWidth: 16,
  },
  render: (args) => (
    <ScrollArea {...args} style={{ width: '300px', height: '400px', border: '1px solid #ccc' }}>
      <LongContent />
    </ScrollArea>
  ),
};

export const ShortContent = {
  args: {
    showScrollbar: 'hover',
    scrollbarWidth: 10,
  },
  render: (args) => (
    <ScrollArea {...args} style={{ width: '300px', height: '400px', border: '1px solid #ccc' }}>
      <div style={{ padding: '20px' }}>
        <h3>Short Content</h3>
        <p>This content doesn't need scrolling.</p>
        <p>The scrollbar should not appear.</p>
      </div>
    </ScrollArea>
  ),
};

export const Nested = {
  args: {
    showScrollbar: 'hover',
    scrollbarWidth: 10,
  },
  render: (args) => (
    <ScrollArea {...args} style={{ width: '500px', height: '400px', border: '1px solid #ccc' }}>
      <div style={{ padding: '20px' }}>
        <h3>Outer ScrollArea</h3>
        <p>This is the outer scroll area with nested content.</p>
        
        <ScrollArea 
          {...args} 
          style={{ 
            width: '100%', 
            height: '200px', 
            border: '1px solid #999', 
            marginTop: '20px' 
          }}
        >
          <div style={{ padding: '10px' }}>
            <h4>Nested ScrollArea</h4>
            <LongContent />
          </div>
        </ScrollArea>
        
        <p style={{ marginTop: '20px' }}>More content in the outer area...</p>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>Outer content line {i + 1}</p>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const WithImages = {
  args: {
    showScrollbar: 'hover',
    scrollbarWidth: 10,
  },
  render: (args) => (
    <ScrollArea {...args} style={{ width: '400px', height: '500px', border: '1px solid #ccc' }}>
      <div style={{ padding: '20px' }}>
        <h3>Gallery</h3>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <img 
              src={`https://picsum.photos/350/200?random=${i}`} 
              alt={`Random image ${i + 1}`}
              style={{ width: '100%', borderRadius: '8px' }}
            />
            <p style={{ marginTop: '8px' }}>Image {i + 1} caption</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};