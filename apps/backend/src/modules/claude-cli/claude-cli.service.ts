import {ChildProcess, spawn} from 'child_process';
import fetch from 'node-fetch';
import type {
  SpawnClaudeOptions,
  ClaudeResponse,
  ClaudeStatusData,
  WebSocketMessage,
} from './claude-cli.types.js';
import {
  sessionManager,
  parseStatusMessage,
  isStatusMessage,
  isInteractivePrompt,
  buildClaudeArgs,
  formatCommandForLogging,
} from './claude-cli.utils.js';

// Dependencies interface for dependency injection
interface ClaudeServiceDeps {
  sendMessage: (message: WebSocketMessage) => void;
  apiPort?: number;
}

// Process spawning function
export const createClaudeProcess = (
  command: string | undefined,
  options: SpawnClaudeOptions,
  onData: (data: Buffer, type: 'stdout' | 'stderr') => void,
  onClose: (code: number | null) => void,
  onError: (error: Error) => void,
): ChildProcess => {
  const {cwd} = options;
  const args = buildClaudeArgs(command, options);
  const workingDir = cwd ?? process.cwd();

  console.log('Spawning Claude CLI:', formatCommandForLogging('claude', args));
  console.log('Working directory:', workingDir);
  console.log(
    'Session info - Input sessionId:',
    options.sessionId,
    'Resume:',
    options.resume,
  );

  const claudeProcess = spawn('claude', args, {
    cwd: workingDir,
    env: {
      ...process.env,
      CI: 'false',
      COLORTERM: 'truecolor',
      FORCE_COLOR: '3',
      TERM: 'xterm-256color',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  claudeProcess.stdout.on('data', (data) => onData(data, 'stdout'));
  claudeProcess.stderr.on('data', (data) => onData(data, 'stderr'));
  claudeProcess.on('close', onClose);
  claudeProcess.on('error', onError);

  // Handle stdin
  if (command) {
    claudeProcess.stdin.end();
  } else if (command !== undefined) {
    claudeProcess.stdin.write(command + '\n');
    claudeProcess.stdin.end();
  }

  return claudeProcess;
};

// Process output handler
export const handleProcessOutput = (
  data: Buffer,
  type: 'stdout' | 'stderr',
  buffer: {value: string},
  state: {capturedSessionId?: string; sessionCreatedSent: boolean},
  options: SpawnClaudeOptions,
  deps: ClaudeServiceDeps,
): void => {
  const rawOutput = data.toString();
  console.log(`📤 Claude CLI ${type}:`, rawOutput);

  if (type === 'stderr' && isStatusMessage(rawOutput)) {
    handleStatusMessage(rawOutput, deps);
    return;
  }

  if (type === 'stderr') {
    deps.sendMessage({
      type: 'claude-error',
      error: rawOutput,
    });
    return;
  }

  // Handle stdout
  buffer.value += rawOutput;
  const lines = buffer.value.split('\n');
  const endsWithNewline = rawOutput.endsWith('\n');

  if (!endsWithNewline && lines.length > 0) {
    buffer.value = lines.pop() ?? '';
  } else {
    buffer.value = '';
  }

  // Process complete lines
  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const response: ClaudeResponse = JSON.parse(line);
      console.log('📄 Parsed JSON response:', response);

      // Handle session ID capture
      if (response.session_id && !state.capturedSessionId) {
        handleSessionIdCapture(response.session_id, state, options, deps);
      }

      // Track user messages
      if (response.message && response.message.role === 'user') {
        handleUserMessage(state.capturedSessionId ?? options.sessionId, deps);
      }

      // Handle different response types
      if (
        response.type === 'status' ||
        response.type === 'progress' ||
        (response.type === 'system' && response.subtype === 'status')
      ) {
        deps.sendMessage({
          type: 'claude-status',
          data: response,
        });
      } else {
        deps.sendMessage({
          type: 'claude-response',
          data: response,
        });
      }
    } catch {
      handleNonJsonOutput(line, deps);
    }
  }

  // Handle buffer content
  handleBufferContent(
    buffer.value,
    state.capturedSessionId ?? options.sessionId,
    deps,
  );
};

// Helper functions
const handleSessionIdCapture = (
  sessionId: string,
  state: {capturedSessionId?: string; sessionCreatedSent: boolean},
  options: SpawnClaudeOptions,
  deps: ClaudeServiceDeps,
): void => {
  state.capturedSessionId = sessionId;
  console.log('📝 Captured session ID:', sessionId);

  if (!options.sessionId && !state.sessionCreatedSent) {
    state.sessionCreatedSent = true;
    deps.sendMessage({
      type: 'session-created',
      sessionId: sessionId,
    });
  }
};

const handleUserMessage = (
  sessionId: string | undefined,
  deps: ClaudeServiceDeps,
): void => {
  if (!sessionId) return;

  const newCount = sessionManager.incrementMessageCount(sessionId);

  if (!sessionManager.isManuallyEdited(sessionId)) {
    const updateInterval = parseInt(
      process.env['SESSION_SUMMARY_UPDATE_INTERVAL'] ?? '3',
    );
    const updateDelay = parseInt(
      process.env['SESSION_SUMMARY_UPDATE_DELAY'] ?? '2000',
    );

    if (updateInterval > 0 && newCount > 0 && newCount % updateInterval === 0) {
      console.log(
        `📊 User message count reached ${newCount}, updating session summary...`,
      );
      setTimeout(() => {
        void generateSessionSummary(sessionId, deps, true);
      }, updateDelay);
    }
  }
};

const handleStatusMessage = (text: string, deps: ClaudeServiceDeps): void => {
  console.log('🔔 Status message detected:', text);
  const {action, tokens} = parseStatusMessage(text);

  deps.sendMessage({
    type: 'claude-status',
    data: {
      can_interrupt: text.includes('esc to interrupt'),
      message: action + '...',
      raw: text,
      tokens: tokens,
    } as ClaudeStatusData,
  });
};

const handleNonJsonOutput = (line: string, deps: ClaudeServiceDeps): void => {
  console.log('📄 Non-JSON response:', line);

  if (isStatusMessage(line)) {
    handleStatusMessage(line, deps);
  } else {
    deps.sendMessage({
      type: 'claude-output',
      data: line,
    });
  }
};

const handleBufferContent = (
  buffer: string,
  sessionId: string | undefined,
  deps: ClaudeServiceDeps,
): void => {
  if (!buffer) return;

  if (isInteractivePrompt(buffer)) {
    console.log('🔔 Interactive prompt detected:', buffer);
    deps.sendMessage({
      type: 'claude-interactive-prompt',
      data: buffer,
      sessionId: sessionId,
    });
  } else if (isStatusMessage(buffer)) {
    handleStatusMessage(buffer, deps);
  }
};

// Session summary generation
export const generateSessionSummary = async (
  sessionId: string,
  deps: ClaudeServiceDeps,
  forceUpdate = false,
): Promise<void> => {
  try {
    console.log(`🤖 Checking if summary needed for session ${sessionId}`);

    const projectName = sessionId.split('-').slice(0, -1).join('-');
    const port = deps.apiPort ?? process.env['PORT'] ?? 3000;

    // Check existing summary
    const sessionsResponse = await fetch(
      `http://localhost:${port}/api/projects/${projectName}/sessions?limit=50`,
    );

    if (!sessionsResponse.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const sessionsData = await sessionsResponse.json();
    const session = sessionsData.sessions?.find((s: any) => s.id === sessionId);

    if (!forceUpdate && session?.summary && session.summary !== 'New Session') {
      console.log(`✅ Session already has summary: ${session.summary}`);
      return;
    }

    console.log(
      `🤖 Generating summary for session ${sessionId}${forceUpdate ? ' (forced update)' : ''}`,
    );

    // Fetch messages
    const response = await fetch(
      `http://localhost:${port}/api/projects/${projectName}/sessions/${sessionId}/messages`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch session messages');
    }

    const data = await response.json();
    let messagesToSummarize = data.messages;

    if (forceUpdate) {
      messagesToSummarize = data.messages.slice(-10);
    }

    // Generate summary
    const summaryResponse = await fetch(
      `http://localhost:${port}/api/generate-session-summary`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({messages: messagesToSummarize}),
      },
    );

    if (!summaryResponse.ok) {
      throw new Error('Failed to generate summary');
    }

    const summaryData = await summaryResponse.json();

    if (summaryData.summary && summaryData.summary !== 'New Session') {
      await fetch(
        `http://localhost:${port}/api/projects/${projectName}/sessions/${sessionId}/summary`,
        {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({summary: summaryData.summary}),
        },
      );

      console.log(`✅ Session summary updated: ${summaryData.summary}`);

      deps.sendMessage({
        type: 'session-summary-updated',
        sessionId: sessionId,
        summary: summaryData.summary,
      });
    }
  } catch (error) {
    console.error('Error generating session summary:', error);
  }
};

// Abort session
export const abortClaudeSession = (sessionId: string): boolean => {
  const process = sessionManager.getProcess(sessionId);
  if (process) {
    console.log(`🛑 Aborting Claude session: ${sessionId}`);
    process.kill('SIGTERM');
    sessionManager.deleteProcess(sessionId);
    return true;
  }
  return false;
};
