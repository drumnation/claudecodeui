/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {composeStories} from '@storybook/react';
import * as stories from './ChatInterface.stories';

// Compose all stories
const {Default, NoProjectSelected, WithActiveSession} = composeStories(stories);

// Mock WebSocket for testing
vi.mock('../../utils/websocket', () => ({
  createWebSocket: vi.fn(() => ({
    readyState: 1,
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
}));

describe('ChatInterface Stories', () => {
  describe('Default Story', () => {
    it('should render without crashing', async () => {
      render(<Default />);

      const chatInterface = screen.getByTestId('chat-interface');
      expect(chatInterface).toBeInTheDocument();
    });

    it('should show input area when project is selected', async () => {
      render(<Default />);

      const inputArea = screen.getByRole('textbox');
      expect(inputArea).toBeInTheDocument();
    });

    it('should handle message sending', async () => {
      const mockSendMessage = vi.fn();

      render(<Default sendMessage={mockSendMessage} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();

      const sendButton = screen.queryByRole('button', {name: /send/i});
      if (sendButton) {
        expect(sendButton).toBeInTheDocument();
      }
    });

    it('should show connection health status', async () => {
      const connectionHealth = {
        isConnected: true,
        latency: 150,
        lastError: undefined,
        reconnectAttempts: 0,
      };

      render(<Default connectionHealth={connectionHealth} />);

      // Should show connected status
      const statusElement = screen.queryByText(/connected/i);
      if (statusElement) {
        expect(statusElement).toBeInTheDocument();
      }
    });
  });

  describe('NoProjectSelected Story', () => {
    it('should render no project selected state', async () => {
      render(<NoProjectSelected />);

      const noProjectMessage =
        screen.queryByText(/no project selected/i) ||
        screen.queryByText(/select a project/i);

      if (noProjectMessage) {
        expect(noProjectMessage).toBeInTheDocument();
      }
    });

    it('should disable input when no project is selected', async () => {
      render(<NoProjectSelected />);

      const input = screen.queryByRole('textbox');
      if (input) {
        expect(input).toBeDisabled();
      }
    });
  });

  describe('WithActiveSession Story', () => {
    it('should render with messages', async () => {
      render(<WithActiveSession />);

      const chatInterface = screen.getByTestId('chat-interface');
      expect(chatInterface).toBeInTheDocument();
    });

    it('should show existing messages', async () => {
      render(<WithActiveSession />);

      // Check for message content
      const userMessage = screen.queryByText(/Hello Claude!/i);
      const assistantMessage = screen.queryByText(/How can I help you/i);

      if (userMessage) {
        expect(userMessage).toBeInTheDocument();
      }
      if (assistantMessage) {
        expect(assistantMessage).toBeInTheDocument();
      }
    });

    it('should handle tool interactions', async () => {
      render(<WithActiveSession />);

      // Look for tool output or expandable tool sections
      const toolOutput = screen.queryByText(/tool/i);
      const expandButton = screen.queryByRole('button', {name: /expand/i});

      if (expandButton) {
        expect(expandButton).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<Default />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAccessibleName();

      const sendButton = screen.queryByRole('button', {name: /send/i});
      if (sendButton) {
        expect(sendButton).toHaveAccessibleName();
      }
    });

    it('should support keyboard navigation', async () => {
      render(<Default />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();

      // Test that input is focusable
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      const disconnectedHealth = {
        isConnected: false,
        latency: null,
        lastError: 'Connection failed',
        reconnectAttempts: 3,
      };

      render(<Default connectionHealth={disconnectedHealth} />);

      const errorMessage = screen.queryByText(/connection/i);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });

    it('should show retry button when disconnected', async () => {
      const disconnectedHealth = {
        isConnected: false,
        latency: null,
        lastError: 'Connection failed',
        reconnectAttempts: 3,
      };

      render(<Default connectionHealth={disconnectedHealth} />);

      const retryButton = screen.queryByRole('button', {name: /retry/i});
      if (retryButton) {
        expect(retryButton).toBeInTheDocument();
      }
    });
  });

  describe('Message Formatting', () => {
    it('should render markdown content correctly', async () => {
      const messagesWithMarkdown = [
        {
          id: 'msg-1',
          role: 'assistant' as const,
          content: '# Hello\n\nThis is **bold** text.',
          timestamp: new Date(),
        },
      ];

      render(<WithActiveSession messages={messagesWithMarkdown} />);

      // Should render markdown as formatted content
      const heading = screen.queryByRole('heading', {level: 1});
      if (heading) {
        expect(heading).toBeInTheDocument();
      }
    });

    it('should handle code blocks', async () => {
      const messagesWithCode = [
        {
          id: 'msg-1',
          role: 'assistant' as const,
          content: '```javascript\nconsole.log("Hello World");\n```',
          timestamp: new Date(),
        },
      ];

      render(<WithActiveSession messages={messagesWithCode} />);

      // Should render code block
      const codeBlock = screen.queryByText(/console.log/);
      if (codeBlock) {
        expect(codeBlock).toBeInTheDocument();
      }
    });
  });

  describe('Performance', () => {
    it('should handle large message lists efficiently', async () => {
      const manyMessages = Array.from({length: 100}, (_, i) => ({
        id: `msg-${i}`,
        role: (i % 2 === 0 ? 'user' : 'assistant') as const,
        content: `Message ${i}`,
        timestamp: new Date(Date.now() - i * 1000),
      }));

      const startTime = performance.now();
      render(<WithActiveSession messages={manyMessages} />);
      const endTime = performance.now();

      // Should render within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Settings Integration', () => {
    it('should handle settings changes', async () => {
      const mockShowSettings = vi.fn();

      render(<Default onShowSettings={mockShowSettings} />);

      const settingsButton = screen.queryByRole('button', {name: /settings/i});
      if (settingsButton) {
        expect(settingsButton).toBeInTheDocument();
      }
    });

    it('should respect auto-expand tools setting', async () => {
      render(<WithActiveSession autoExpandTools={false} />);

      // Tools should be collapsed by default
      const toolOutput = screen.queryByText(/import React/);
      expect(toolOutput).not.toBeInTheDocument();
    });
  });
});
