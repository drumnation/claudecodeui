import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AssistantMessage from '@/features/chat/components/Message/components/AssistantMessage/AssistantMessage';

describe('AssistantMessage', () => {
  const defaultProps = {
    message: {
      type: 'assistant',
      content: 'Hello, how can I help you?',
      timestamp: new Date().toISOString()
    },
    isGrouped: false,
    onFileOpen: vi.fn(),
    onShowSettings: vi.fn(),
    autoExpandTools: false,
    showRawParameters: false,
    createDiff: vi.fn()
  };

  it('renders assistant message with content', () => {
    render(<AssistantMessage {...defaultProps} />);
    expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
    expect(screen.getByText('Claude')).toBeInTheDocument();
  });

  it('renders error message when type is error', () => {
    const errorProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        type: 'error',
        content: 'An error occurred'
      }
    };
    render(<AssistantMessage {...errorProps} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('hides header when message is grouped', () => {
    render(<AssistantMessage {...defaultProps} isGrouped={true} />);
    expect(screen.queryByText('Claude')).not.toBeInTheDocument();
  });

  it('renders tool use content', () => {
    const toolProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        isToolUse: true,
        toolName: 'Edit',
        toolId: 'tool-123',
        toolInput: { file_path: '/test.js', old_string: 'foo', new_string: 'bar' }
      }
    };
    render(<AssistantMessage {...toolProps} />);
    expect(screen.getByText('Using Edit')).toBeInTheDocument();
    expect(screen.getByText('tool-123')).toBeInTheDocument();
  });

  it('renders interactive prompt', () => {
    const promptProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        isInteractivePrompt: true,
        content: 'Do you want to proceed?\n1. Yes\n2. No'
      }
    };
    render(<AssistantMessage {...promptProps} />);
    expect(screen.getByText('Interactive Prompt')).toBeInTheDocument();
    expect(screen.getByText('Do you want to proceed?')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders tool result with success', () => {
    const toolResultProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        isToolUse: true,
        toolName: 'Edit',
        toolResult: {
          content: 'The file /test.js has been updated.',
          isError: false
        }
      }
    };
    render(<AssistantMessage {...toolResultProps} />);
    expect(screen.getByText('Tool Result')).toBeInTheDocument();
    expect(screen.getByText('File updated successfully')).toBeInTheDocument();
  });

  it('renders tool result with error', () => {
    const toolErrorProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        isToolUse: true,
        toolName: 'Edit',
        toolResult: {
          content: 'File not found',
          isError: true
        }
      }
    };
    render(<AssistantMessage {...toolErrorProps} />);
    expect(screen.getByText('Tool Error')).toBeInTheDocument();
    expect(screen.getByText('File not found')).toBeInTheDocument();
  });

  it('handles settings button click', () => {
    const toolProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        isToolUse: true,
        toolName: 'Edit'
      }
    };
    render(<AssistantMessage {...toolProps} />);
    
    const settingsButton = screen.getByTitle('Tool Settings');
    fireEvent.click(settingsButton);
    
    expect(defaultProps.onShowSettings).toHaveBeenCalled();
  });

  it('renders markdown content with custom components', () => {
    const markdownProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        content: '**Bold text** and `inline code` and [link](https://example.com)'
      }
    };
    render(<AssistantMessage {...markdownProps} />);
    
    expect(screen.getByText('Bold text')).toBeInTheDocument();
    expect(screen.getByText('inline code')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('href', 'https://example.com');
  });

  it('renders timestamp', () => {
    const now = new Date();
    const timestampProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        timestamp: now.toISOString()
      }
    };
    render(<AssistantMessage {...timestampProps} />);
    
    expect(screen.getByText(now.toLocaleTimeString())).toBeInTheDocument();
  });

  it('renders todo list results', () => {
    const todoProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        isToolUse: true,
        toolName: 'TodoRead',
        toolResult: {
          content: '[{"id":"1","content":"Test todo","status":"pending","priority":"high"}]',
          isError: false
        }
      }
    };
    render(<AssistantMessage {...todoProps} />);
    
    expect(screen.getByText('Current Todo List')).toBeInTheDocument();
  });

  it('handles file open callback', () => {
    const fileProps = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        isToolUse: true,
        toolName: 'Edit',
        toolResult: {
          content: 'The file /test.js has been updated.',
          isError: false
        }
      }
    };
    render(<AssistantMessage {...fileProps} />);
    
    const fileButton = screen.getByText('/test.js');
    fireEvent.click(fileButton);
    
    expect(defaultProps.onFileOpen).toHaveBeenCalledWith('/test.js');
  });
});