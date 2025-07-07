// Mock Claude CLI response fixtures for testing

export const claudeResponses = {
  // Successful authentication with Claude Max subscription
  successfulAuth: {
    type: 'system',
    subtype: 'init',
    cwd: '/test/project',
    session_id: 'test-session-123',
    model: 'claude-sonnet-4-20250514',
    apiKeySource: 'none', // This indicates Claude Max subscription
    permissionMode: 'bypassPermissions'
  },

  // Authentication failure with API key
  authFailure: {
    type: 'assistant',
    message: {
      id: 'error-msg-123',
      role: 'assistant',
      content: [{ type: 'text', text: 'Credit balance is too low' }],
      stop_reason: 'stop_sequence'
    },
    session_id: 'failed-session-123'
  },

  // Successful message response
  messageResponse: {
    type: 'assistant',
    message: {
      id: 'msg-success-123',
      type: 'message',
      role: 'assistant',
      model: 'claude-sonnet-4-20250514',
      content: [{ type: 'text', text: 'Hello! How can I help you today?' }],
      stop_reason: null,
      usage: {
        input_tokens: 4,
        output_tokens: 12,
        cache_read_input_tokens: 25296
      }
    },
    session_id: 'test-session-123'
  },

  // Tool use response
  toolUseResponse: {
    type: 'assistant',
    message: {
      id: 'tool-msg-123',
      role: 'assistant',
      content: [
        {
          type: 'tool_use',
          id: 'tool-123',
          name: 'Read',
          input: { file_path: '/test/file.js' }
        }
      ]
    },
    session_id: 'test-session-123'
  },

  // Tool result
  toolResult: {
    type: 'tool_result',
    tool_use_id: 'tool-123',
    content: 'console.log("Hello, world!");',
    session_id: 'test-session-123'
  },

  // Status update
  statusUpdate: {
    type: 'status',
    subtype: 'progress',
    message: 'Reading file...',
    tokens: 150,
    can_interrupt: true,
    session_id: 'test-session-123'
  },

  // Session completion
  sessionComplete: {
    type: 'result',
    subtype: 'success',
    is_error: false,
    duration_ms: 2001,
    num_turns: 1,
    result: 'Task completed successfully',
    session_id: 'test-session-123',
    total_cost_usd: 0.0447954
  }
};

export const claudeErrors = {
  // ENOENT error when Claude CLI not found
  claudeNotFound: {
    code: 'ENOENT',
    message: 'spawn claude ENOENT',
    path: 'claude'
  },

  // Permission denied error
  permissionDenied: {
    code: 'EACCES',
    message: 'spawn claude EACCES',
    path: 'claude'
  },

  // Authentication error with API key
  apiKeyError: {
    type: 'result',
    subtype: 'success',
    is_error: true,
    result: 'Credit balance is too low',
    session_id: 'error-session-123'
  }
};

// Helper to create streaming responses (multiple messages)
export function createStreamingResponse(messages) {
  return messages.map(msg => JSON.stringify(msg)).join('\\n') + '\\n';
}

// Helper to create a complete successful session flow
export function createSuccessfulSessionFlow(sessionId = 'test-session-123') {
  return [
    { ...claudeResponses.successfulAuth, session_id: sessionId },
    { ...claudeResponses.messageResponse, session_id: sessionId },
    { ...claudeResponses.sessionComplete, session_id: sessionId }
  ];
}

// Helper to create authentication failure flow
export function createAuthFailureFlow(sessionId = 'failed-session-123') {
  return [
    { ...claudeResponses.successfulAuth, session_id: sessionId, apiKeySource: 'ANTHROPIC_API_KEY' },
    { ...claudeResponses.authFailure, session_id: sessionId },
    {
      type: 'result',
      subtype: 'success',
      is_error: true,
      result: 'Credit balance is too low',
      session_id: sessionId
    }
  ];
}