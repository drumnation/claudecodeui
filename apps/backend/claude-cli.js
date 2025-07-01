const { spawn } = require('child_process');
const fetch = require('node-fetch');

let activeClaudeProcesses = new Map(); // Track active processes by session ID
let sessionMessageCounts = new Map(); // Track message counts for continuous summary updates
let manuallyEditedSessions = new Set(); // Track sessions with manually edited summaries

async function spawnClaude(command, options = {}, ws) {
  return new Promise(async (resolve, reject) => {
    const { sessionId, projectPath, cwd, resume, toolsSettings } = options;
    let capturedSessionId = sessionId; // Track session ID throughout the process
    let sessionCreatedSent = false; // Track if we've already sent session-created event
    
    // Use tools settings passed from frontend, or defaults
    const settings = toolsSettings || {
      allowedTools: [],
      disallowedTools: [],
      skipPermissions: false
    };
  
    // Build Claude CLI command - start with print/resume flags first
    const args = [];
    
    // Add print flag with command if we have a command
    if (command && command.trim()) {
      args.push('--print', command);
    }
    
    // Add resume flag if resuming
    if (resume && sessionId) {
      args.push('--resume', sessionId);
    }
    
    // Add basic flags
    args.push('--output-format', 'stream-json', '--verbose');
    
    // Add model for new sessions
    if (!resume) {
      args.push('--model', 'sonnet');
    }
    
    // Add tools settings flags
    if (settings.skipPermissions) {
      args.push('--dangerously-skip-permissions');
      console.log('⚠️  Using --dangerously-skip-permissions (skipping other tool settings)');
    } else {
      // Only add allowed/disallowed tools if not skipping permissions
      // Add allowed tools
      if (settings.allowedTools && settings.allowedTools.length > 0) {
        for (const tool of settings.allowedTools) {
          args.push('--allowedTools', tool);
          console.log('✅ Allowing tool:', tool);
        }
      }
      
      // Add disallowed tools
      if (settings.disallowedTools && settings.disallowedTools.length > 0) {
        for (const tool of settings.disallowedTools) {
          args.push('--disallowedTools', tool);
          console.log('❌ Disallowing tool:', tool);
        }
      }
    }
    
    // Use cwd (actual project directory) instead of projectPath (Claude's metadata directory)
    const workingDir = cwd || process.cwd();
    console.log('Spawning Claude CLI:', 'claude', args.map(arg => {
      const cleanArg = arg.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      return cleanArg.includes(' ') ? `"${cleanArg}"` : cleanArg;
    }).join(' '));
    console.log('Working directory:', workingDir);
    console.log('Session info - Input sessionId:', sessionId, 'Resume:', resume);
    console.log('🔍 Full command args:', args);
    
    const claudeProcess = spawn('claude', args, {
      cwd: workingDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        FORCE_COLOR: '3',
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        CI: 'false' // Some CLIs check this to determine if they're in a TTY
      }
    });
    
    // Store process reference for potential abort
    const processKey = capturedSessionId || sessionId || Date.now().toString();
    activeClaudeProcesses.set(processKey, claudeProcess);
    
    // Buffer for incomplete lines (e.g., prompts without newlines)
    let stdoutBuffer = '';
    
    // Handle stdout (streaming JSON responses)
    claudeProcess.stdout.on('data', (data) => {
      const rawOutput = data.toString();
      console.log('📤 Claude CLI stdout:', rawOutput);
      
      // Add to buffer
      stdoutBuffer += rawOutput;
      
      // Split by newlines but keep track of whether the last chunk ends with a newline
      const lines = stdoutBuffer.split('\n');
      const endsWithNewline = rawOutput.endsWith('\n');
      
      // If it doesn't end with a newline, the last "line" is incomplete - save it for later
      if (!endsWithNewline && lines.length > 0) {
        stdoutBuffer = lines.pop(); // Remove and save the incomplete line
      } else {
        stdoutBuffer = ''; // Clear buffer if we have complete lines
      }
      
      // Process complete lines
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const response = JSON.parse(line);
          console.log('📄 Parsed JSON response:', response);
          
          // Capture session ID if it's in the response
          if (response.session_id && !capturedSessionId) {
            capturedSessionId = response.session_id;
            console.log('📝 Captured session ID:', capturedSessionId);
            
            // Update process key with captured session ID
            if (processKey !== capturedSessionId) {
              activeClaudeProcesses.delete(processKey);
              activeClaudeProcesses.set(capturedSessionId, claudeProcess);
            }
            
            // Send session-created event only once for new sessions
            if (!sessionId && !sessionCreatedSent) {
              sessionCreatedSent = true;
              ws.send(JSON.stringify({
                type: 'session-created',
                sessionId: capturedSessionId
              }));
            }
          }
          
          // Track user messages for continuous summary updates
          if (response.message && response.message.role === 'user') {
            const currentSessionId = capturedSessionId || sessionId;
            if (currentSessionId) {
              const currentCount = sessionMessageCounts.get(currentSessionId) || 0;
              const newCount = currentCount + 1;
              sessionMessageCounts.set(currentSessionId, newCount);
              
              // Update summary based on configuration (skip if manually edited)
              if (!manuallyEditedSessions.has(currentSessionId)) {
                const updateInterval = parseInt(process.env.SESSION_SUMMARY_UPDATE_INTERVAL || '3');
                const updateDelay = parseInt(process.env.SESSION_SUMMARY_UPDATE_DELAY || '2000');
                
                if (updateInterval > 0 && newCount > 0 && newCount % updateInterval === 0) {
                  console.log(`📊 User message count reached ${newCount}, updating session summary...`);
                  // Trigger summary update in the background
                  setTimeout(() => {
                    generateSessionSummary(currentSessionId, ws, true);
                  }, updateDelay); // Delay slightly to ensure message is saved
                }
              } else {
                console.log(`🔒 Skipping auto-update for manually edited session ${currentSessionId}`);
              }
            }
          }
          
          // Check if this is a status/progress message
          if (response.type === 'status' || response.type === 'progress' || 
              (response.type === 'system' && response.subtype === 'status')) {
            console.log('🔔 Detected status message:', response);
            // Send status update to frontend
            ws.send(JSON.stringify({
              type: 'claude-status',
              data: response
            }));
          } else {
            // Send parsed response to WebSocket
            ws.send(JSON.stringify({
              type: 'claude-response',
              data: response
            }));
          }
        } catch (parseError) {
          console.log('📄 Non-JSON response:', line);
          
          // Check for status messages in non-JSON output
          if (line.includes('✻') || line.includes('✹') || line.includes('✸') || line.includes('✶') ||
              line.includes('⚒') || line.includes('tokens') || line.includes('esc to interrupt')) {
            console.log('🔔 Status message detected in line:', line);
            
            // Parse the status message
            const tokensMatch = line.match(/⚒\s*(\d+)\s*tokens/);
            const tokens = tokensMatch ? parseInt(tokensMatch[1]) : 0;
            
            // Extract the main action (e.g., "Toggling", "Working", etc.)
            const actionMatch = line.match(/[✻✹✸✶]\s*(\w+)/);
            const action = actionMatch ? actionMatch[1] : 'Working';
            
            ws.send(JSON.stringify({
              type: 'claude-status',
              data: {
                message: action + '...',
                tokens: tokens,
                can_interrupt: line.includes('esc to interrupt'),
                raw: line
              }
            }));
          } else {
            // If not a status message, send as raw text
            ws.send(JSON.stringify({
              type: 'claude-output',
              data: line
            }));
          }
        }
      }
      
      // Check if we have a prompt in the buffer (doesn't end with newline)
      // Look for interactive prompt patterns
      if (stdoutBuffer && (
        stdoutBuffer.includes('Do you want to') ||
        stdoutBuffer.includes('?') ||
        stdoutBuffer.includes('>') ||
        stdoutBuffer.includes('❯') ||
        stdoutBuffer.match(/\d+\.\s+\w+/) // Matches "1. Yes" pattern
      )) {
        console.log('🔔 Interactive prompt detected:', stdoutBuffer);
        
        // Send the prompt immediately as an interactive prompt
        ws.send(JSON.stringify({
          type: 'claude-interactive-prompt',
          data: stdoutBuffer,
          sessionId: capturedSessionId || sessionId
        }));
      }
      
      // Check for status messages like "✻ Toggling… (23s · ⚒ 783 tokens · esc to interrupt)"
      if (stdoutBuffer && (
        stdoutBuffer.includes('✻') || 
        stdoutBuffer.includes('✹') || 
        stdoutBuffer.includes('✸') || 
        stdoutBuffer.includes('✶') ||
        stdoutBuffer.includes('⚒') ||
        stdoutBuffer.includes('tokens') ||
        stdoutBuffer.includes('esc to interrupt')
      )) {
        console.log('🔔 Status message in buffer:', stdoutBuffer);
        
        // Parse the status message
        const tokensMatch = stdoutBuffer.match(/⚒\s*(\d+)\s*tokens/);
        const tokens = tokensMatch ? parseInt(tokensMatch[1]) : 0;
        
        // Extract the main action (e.g., "Toggling", "Working", etc.)
        const actionMatch = stdoutBuffer.match(/[✻✹✸✶]\s*(\w+)/);
        const action = actionMatch ? actionMatch[1] : 'Working';
        
        ws.send(JSON.stringify({
          type: 'claude-status',
          data: {
            message: action + '...',
            tokens: tokens,
            can_interrupt: stdoutBuffer.includes('esc to interrupt'),
            raw: stdoutBuffer
          }
        }));
      }
    });
    
    // Handle stderr
    claudeProcess.stderr.on('data', (data) => {
      const stderrText = data.toString();
      console.error('Claude CLI stderr:', stderrText);
      
      // Check if this is a status message on stderr
      if (stderrText.includes('✻') || stderrText.includes('✹') || stderrText.includes('✸') || stderrText.includes('✶') ||
          stderrText.includes('⚒') || stderrText.includes('tokens') || stderrText.includes('esc to interrupt')) {
        console.log('🔔 Status message detected in stderr:', stderrText);
        
        // Parse the status message
        const tokensMatch = stderrText.match(/⚒\s*(\d+)\s*tokens/);
        const tokens = tokensMatch ? parseInt(tokensMatch[1]) : 0;
        
        // Extract the main action (e.g., "Toggling", "Working", etc.)
        const actionMatch = stderrText.match(/[✻✹✸✶]\s*(\w+)/);
        const action = actionMatch ? actionMatch[1] : 'Working';
        
        ws.send(JSON.stringify({
          type: 'claude-status',
          data: {
            message: action + '...',
            tokens: tokens,
            can_interrupt: stderrText.includes('esc to interrupt'),
            raw: stderrText
          }
        }));
      } else {
        // Only send as error if it's not a status message
        ws.send(JSON.stringify({
          type: 'claude-error',
          error: stderrText
        }));
      }
    });
    
    // Handle process completion
    claudeProcess.on('close', (code) => {
      console.log(`Claude CLI process exited with code ${code}`);
      
      // Clean up process reference
      const finalSessionId = capturedSessionId || sessionId || processKey;
      activeClaudeProcesses.delete(finalSessionId);
      sessionMessageCounts.delete(finalSessionId); // Clean up message count
      manuallyEditedSessions.delete(finalSessionId); // Clean up manual edit flag
      
      ws.send(JSON.stringify({
        type: 'claude-complete',
        exitCode: code,
        isNewSession: !sessionId && !!command // Flag to indicate this was a new session
      }));
      
      // Generate session summary for new sessions
      if (!sessionId && capturedSessionId && code === 0) {
        generateSessionSummary(capturedSessionId, ws);
      }
      
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Claude CLI exited with code ${code}`));
      }
    });
    
    // Handle process errors
    claudeProcess.on('error', (error) => {
      console.error('Claude CLI process error:', error);
      
      // Clean up process reference on error
      const finalSessionId = capturedSessionId || sessionId || processKey;
      activeClaudeProcesses.delete(finalSessionId);
      
      ws.send(JSON.stringify({
        type: 'claude-error',
        error: error.message
      }));
      
      reject(error);
    });
    
    // Handle stdin for interactive mode
    if (command) {
      // For --print mode with arguments, we don't need to write to stdin
      claudeProcess.stdin.end();
    } else {
      // For interactive mode, we need to write the command to stdin if provided later
      // Keep stdin open for interactive session
      if (command !== undefined) {
        claudeProcess.stdin.write(command + '\n');
        claudeProcess.stdin.end();
      }
      // If no command provided, stdin stays open for interactive use
    }
  });
}

// Function to generate session summary
async function generateSessionSummary(sessionId, ws, forceUpdate = false) {
  try {
    console.log(`🤖 Checking if summary needed for session ${sessionId}`);
    
    // Get project name from session ID
    const projectName = sessionId.split('-').slice(0, -1).join('-');
    
    // First, check if session already has a summary
    const sessionsResponse = await fetch(`http://localhost:${process.env.PORT || 3000}/api/projects/${projectName}/sessions?limit=50`);
    if (!sessionsResponse.ok) {
      throw new Error('Failed to fetch sessions');
    }
    
    const sessionsData = await sessionsResponse.json();
    const session = sessionsData.sessions?.find(s => s.id === sessionId);
    
    // If session already has a summary that's not "New Session" and we're not forcing update, skip generation
    if (!forceUpdate && session && session.summary && session.summary !== 'New Session') {
      console.log(`✅ Session already has summary: ${session.summary}`);
      return;
    }
    
    console.log(`🤖 Generating summary for session ${sessionId}${forceUpdate ? ' (forced update)' : ''}`);
    
    // Fetch session messages
    const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/projects/${projectName}/sessions/${sessionId}/messages`);
    if (!response.ok) {
      throw new Error('Failed to fetch session messages');
    }
    
    const data = await response.json();
    
    // For continuous updates, focus on the last few messages
    let messagesToSummarize = data.messages;
    if (forceUpdate) {
      // Take the last 5 user messages for continuous updates
      messagesToSummarize = data.messages.slice(-10);
    }
    
    // Generate summary using Claude/OpenAI
    const summaryResponse = await fetch(`http://localhost:${process.env.PORT || 3000}/api/generate-session-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: messagesToSummarize }),
    });
    
    if (!summaryResponse.ok) {
      throw new Error('Failed to generate summary');
    }
    
    const summaryData = await summaryResponse.json();
    
    if (summaryData.summary && summaryData.summary !== 'New Session') {
      // Update session summary
      await fetch(`http://localhost:${process.env.PORT || 3000}/api/projects/${projectName}/sessions/${sessionId}/summary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: summaryData.summary }),
      });
      
      console.log(`✅ Session summary updated: ${summaryData.summary}`);
      
      // Notify frontend about the summary update
      ws.send(JSON.stringify({
        type: 'session-summary-updated',
        sessionId: sessionId,
        summary: summaryData.summary
      }));
    }
  } catch (error) {
    console.error('Error generating session summary:', error);
  }
}

function abortClaudeSession(sessionId) {
  const process = activeClaudeProcesses.get(sessionId);
  if (process) {
    console.log(`🛑 Aborting Claude session: ${sessionId}`);
    process.kill('SIGTERM');
    activeClaudeProcesses.delete(sessionId);
    return true;
  }
  return false;
}

// Mark a session as manually edited to prevent automatic updates
function markSessionAsManuallyEdited(sessionId) {
  if (sessionId) {
    manuallyEditedSessions.add(sessionId);
  }
}

// Clear manual edit flag for a session
function clearManualEditFlag(sessionId) {
  if (sessionId) {
    manuallyEditedSessions.delete(sessionId);
  }
}

module.exports = {
  spawnClaude,
  abortClaudeSession,
  markSessionAsManuallyEdited,
  clearManualEditFlag
};