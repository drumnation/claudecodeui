import TodoList from './TodoList';

const ToolRenderer = ({ 
  message, 
  autoExpandTools, 
  onFileOpen, 
  showRawParams, 
  createDiff 
}) => {
  const { toolName, toolInput } = message;

  // Edit Tool - Show diff view
  if (toolInput && toolName === 'Edit') {
    try {
      const input = JSON.parse(toolInput);
      if (input.file_path && input.old_string && input.new_string) {
        return (
          <details className="mt-2" open={autoExpandTools}>
            <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              📝 View edit diff for 
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFileOpen && onFileOpen(input.file_path, {
                    old_string: input.old_string,
                    new_string: input.new_string
                  });
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-mono"
              >
                {input.file_path.split('/').pop()}
              </button>
            </summary>
            <div className="mt-3">
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => onFileOpen && onFileOpen(input.file_path, {
                      old_string: input.old_string,
                      new_string: input.new_string
                    })}
                    className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate underline cursor-pointer"
                  >
                    {input.file_path}
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Diff
                  </span>
                </div>
                <div className="text-xs font-mono">
                  {createDiff(input.old_string, input.new_string).map((diffLine, i) => (
                    <div key={i} className="flex">
                      <span className={`w-8 text-center border-r ${
                        diffLine.type === 'removed' 
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                      }`}>
                        {diffLine.type === 'removed' ? '-' : '+'}
                      </span>
                      <span className={`px-2 py-0.5 flex-1 whitespace-pre-wrap ${
                        diffLine.type === 'removed'
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      }`}>
                        {diffLine.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        );
      }
    } catch (e) {
      // Fall through to default handling
    }
  }

  // Write Tool - Show new file content
  if (toolName === 'Write') {
    try {
      const input = JSON.parse(toolInput);
      if (input.file_path && input.content) {
        return (
          <details className="mt-2" open={autoExpandTools}>
            <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              📄 View new file content for 
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFileOpen && onFileOpen(input.file_path);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-mono"
              >
                {input.file_path.split('/').pop()}
              </button>
            </summary>
            <div className="mt-3">
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => onFileOpen && onFileOpen(input.file_path)}
                    className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate underline cursor-pointer"
                  >
                    {input.file_path}
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    New File
                  </span>
                </div>
                <div className="p-3 max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-mono">
                    {input.content}
                  </pre>
                </div>
              </div>
            </div>
          </details>
        );
      }
    } catch (e) {
      // Fall through to default handling
    }
  }

  // TodoWrite Tool - Show todo list
  if (toolName === 'TodoWrite') {
    try {
      const input = JSON.parse(toolInput);
      if (input.todos && Array.isArray(input.todos)) {
        return (
          <details className="mt-2" open={autoExpandTools}>
            <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              📋 Update todo list ({input.todos.length} items)
            </summary>
            <div className="mt-3">
              <TodoList todos={input.todos} />
            </div>
          </details>
        );
      }
    } catch (e) {
      // Fall through to default handling
    }
  }

  // Bash Tool - Show command
  if (toolName === 'Bash') {
    try {
      const input = JSON.parse(toolInput);
      if (input.command) {
        return (
          <details className="mt-2" open={autoExpandTools}>
            <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              💻 Execute command: 
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                {input.command.length > 50 ? input.command.substring(0, 50) + '...' : input.command}
              </code>
            </summary>
            <div className="mt-3 space-y-2">
              <div className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-3 font-mono text-sm">
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Terminal</span>
                </div>
                <div className="whitespace-pre-wrap break-all text-green-400">
                  $ {input.command}
                </div>
              </div>
              {input.description && (
                <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                  {input.description}
                </div>
              )}
            </div>
          </details>
        );
      }
    } catch (e) {
      // Fall through to default handling
    }
  }

  // Read Tool - Show file path
  if (toolName === 'Read') {
    try {
      const input = JSON.parse(toolInput);
      if (input.file_path) {
        return (
          <details className="mt-2" open={autoExpandTools}>
            <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              📖 Read file: 
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFileOpen && onFileOpen(input.file_path);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-mono"
              >
                {input.file_path.split('/').pop()}
              </button>
            </summary>
            <div className="mt-3">
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <button 
                  onClick={() => onFileOpen && onFileOpen(input.file_path)}
                  className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline cursor-pointer"
                >
                  {input.file_path}
                </button>
                {input.offset && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Starting from line {input.offset}
                    {input.limit && ` (${input.limit} lines)`}
                  </div>
                )}
              </div>
            </div>
          </details>
        );
      }
    } catch (e) {
      // Fall through to default handling
    }
  }

  // Task Tool - Show task description and prompt
  if (toolName === 'Task') {
    try {
      const input = JSON.parse(toolInput);
      if (input.description || input.prompt) {
        return (
          <details className="mt-2" open={autoExpandTools}>
            <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              🤖 Launch Agent: 
              <span className="font-medium">
                {input.description || 'Research Task'}
              </span>
            </summary>
            <div className="mt-3">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                {input.description && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">
                      Task Description:
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300 bg-white/50 dark:bg-black/20 rounded px-2 py-1">
                      {input.description}
                    </div>
                  </div>
                )}
                {input.prompt && (
                  <div>
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Agent Instructions:
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 bg-white/50 dark:bg-black/20 rounded px-2 py-1 max-h-40 overflow-y-auto">
                      {input.prompt}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </details>
        );
      }
    } catch (e) {
      // Fall through to default handling
    }
  }

  // Default tool rendering - show raw parameters if requested
  if (showRawParams && toolInput) {
    return (
      <details className="mt-2">
        <summary className="text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2">
          <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          🔧 {toolName} - View parameters
        </summary>
        <div className="mt-3">
          <pre className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 overflow-x-auto whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {toolInput}
          </pre>
        </div>
      </details>
    );
  }

  return null;
};

// Tool Result Renderer
export const ToolResultRenderer = ({ message }) => {
  const { toolResult, toolName } = message;

  if (!toolResult) return null;

  return (
    <div className="mt-3 border-t border-blue-200 dark:border-blue-700 pt-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-4 h-4 rounded flex items-center justify-center ${
          toolResult.isError 
            ? 'bg-red-500' 
            : 'bg-green-500'
        }`}>
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {toolResult.isError ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>
        <span className={`text-sm font-medium ${
          toolResult.isError 
            ? 'text-red-700 dark:text-red-300' 
            : 'text-green-700 dark:text-green-300'
        }`}>
          {toolResult.isError ? 'Tool Error' : 'Tool Result'}
        </span>
      </div>
      
      <div className={`text-sm ${
        toolResult.isError 
          ? 'text-red-800 dark:text-red-200' 
          : 'text-green-800 dark:text-green-200'
      }`}>
        {(() => {
          const content = String(toolResult.content || '');
          
          // Special handling for TodoWrite/TodoRead results
          if ((toolName === 'TodoWrite' || toolName === 'TodoRead') &&
              (content.includes('Todos have been modified successfully') || 
               content.includes('Todo list') || 
               (content.startsWith('[') && content.includes('"content"') && content.includes('"status"')))) {
            try {
              // Try to parse if it looks like todo JSON data
              let todos = null;
              if (content.startsWith('[')) {
                todos = JSON.parse(content);
              } else if (content.includes('Todos have been modified successfully')) {
                // For TodoWrite success messages, we don't have the data in the result
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Todo list has been updated successfully</span>
                    </div>
                  </div>
                );
              }
              
              if (todos && Array.isArray(todos)) {
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium">Current Todo List</span>
                    </div>
                    <TodoList todos={todos} isResult={true} />
                  </div>
                );
              }
            } catch (e) {
              // Fall through to regular handling
            }
          }
          
          // Special handling for Task tool results
          if (toolName === 'Task') {
            return (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-600 dark:text-purple-400">🤖</span>
                  <span className="font-medium text-purple-800 dark:text-purple-200">Agent Report</span>
                </div>
                <div className="text-purple-700 dark:text-purple-300 whitespace-pre-wrap">
                  {content}
                </div>
              </div>
            );
          }
          
          // Bash tool - terminal-style output
          if (toolName === 'Bash') {
            return (
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{content}</pre>
              </div>
            );
          }
          
          // Default handling
          return (
            <div className="whitespace-pre-wrap font-mono text-sm">
              {content}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ToolRenderer;