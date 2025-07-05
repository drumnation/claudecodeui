import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import TodoList from '../../../TodoList';
import ClaudeLogo from '../../../ClaudeLogo';
import { useMessage } from './Message.hook';
import * as logic from './Message.logic';
import * as S from './Message.styles';

const Message = memo(({
  message,
  index,
  prevMessage,
  createDiff,
  onFileOpen,
  onShowSettings,
  autoExpandTools,
  showRawParameters
}) => {
  const isGrouped = logic.isMessageGrouped(prevMessage, message);
  const { messageRef, isExpanded, setIsExpanded } = useMessage({ 
    autoExpandTools, 
    message 
  });

  const renderUserMessage = () => (
    <S.UserMessageContainer>
      <S.UserMessageBubble>
        <S.UserMessageText>{message.content}</S.UserMessageText>
        <S.UserMessageTime>{logic.formatTimestamp(message.timestamp)}</S.UserMessageTime>
      </S.UserMessageBubble>
      {!isGrouped && (
        <S.UserAvatar src="/icons/user.jpg" alt="User" />
      )}
    </S.UserMessageContainer>
  );

  const renderToolUseContent = () => {
    if (message.toolName === 'Edit') {
      return renderEditTool();
    }
    if (message.toolName === 'Write') {
      return renderWriteTool();
    }
    if (message.toolName === 'TodoWrite') {
      return renderTodoWriteTool();
    }
    if (message.toolName === 'Bash') {
      return renderBashTool();
    }
    if (message.toolName === 'Read') {
      return renderReadTool();
    }
    return renderDefaultTool();
  };

  const renderEditTool = () => {
    const input = logic.parseToolInput(message.toolInput);
    if (!input || !input.file_path || !input.old_string || !input.new_string) {
      return renderDefaultTool();
    }

    return (
      <S.DetailsContainer open={autoExpandTools}>
        <S.DetailsSummary>
          <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </S.ChevronIcon>
          📝 View edit diff for 
          <S.FileButton 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFileOpen && onFileOpen(input.file_path, {
                old_string: input.old_string,
                new_string: input.new_string
              });
            }}
          >
            {logic.extractFilenameFromPath(input.file_path)}
          </S.FileButton>
        </S.DetailsSummary>
        <S.DiffContainer>
          <S.DiffWrapper>
            <S.DiffHeader>
              <S.DiffFilePath 
                onClick={() => onFileOpen && onFileOpen(input.file_path, {
                  old_string: input.old_string,
                  new_string: input.new_string
                })}
              >
                {input.file_path}
              </S.DiffFilePath>
              <S.DiffLabel>Diff</S.DiffLabel>
            </S.DiffHeader>
            <S.DiffContent>
              {createDiff(input.old_string, input.new_string).map((diffLine, i) => (
                <S.DiffLine key={i}>
                  <S.DiffLineNumber type={diffLine.type}>
                    {diffLine.type === 'removed' ? '-' : '+'}
                  </S.DiffLineNumber>
                  <S.DiffLineContent type={diffLine.type}>
                    {diffLine.content}
                  </S.DiffLineContent>
                </S.DiffLine>
              ))}
            </S.DiffContent>
          </S.DiffWrapper>
          {showRawParameters && (
            <S.RawParametersDetails open={autoExpandTools}>
              <S.RawParametersSummary>View raw parameters</S.RawParametersSummary>
              <S.RawParametersContent>{message.toolInput}</S.RawParametersContent>
            </S.RawParametersDetails>
          )}
        </S.DiffContainer>
      </S.DetailsContainer>
    );
  };

  const renderWriteTool = () => {
    const input = logic.parseToolInput(message.toolInput);
    if (!input || !input.file_path || input.content === undefined) {
      return renderDefaultTool();
    }

    return (
      <S.DetailsContainer open={autoExpandTools}>
        <S.DetailsSummary>
          <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </S.ChevronIcon>
          📄 Creating new file: 
          <S.FileButton 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFileOpen && onFileOpen(input.file_path, {
                old_string: '',
                new_string: input.content
              });
            }}
          >
            {logic.extractFilenameFromPath(input.file_path)}
          </S.FileButton>
        </S.DetailsSummary>
        <S.DiffContainer>
          <S.DiffWrapper>
            <S.DiffHeader>
              <S.DiffFilePath 
                onClick={() => onFileOpen && onFileOpen(input.file_path, {
                  old_string: '',
                  new_string: input.content
                })}
              >
                {input.file_path}
              </S.DiffFilePath>
              <S.DiffLabel>New File</S.DiffLabel>
            </S.DiffHeader>
            <S.DiffContent>
              {createDiff('', input.content).map((diffLine, i) => (
                <S.DiffLine key={i}>
                  <S.DiffLineNumber type={diffLine.type}>
                    {diffLine.type === 'removed' ? '-' : '+'}
                  </S.DiffLineNumber>
                  <S.DiffLineContent type={diffLine.type}>
                    {diffLine.content}
                  </S.DiffLineContent>
                </S.DiffLine>
              ))}
            </S.DiffContent>
          </S.DiffWrapper>
          {showRawParameters && (
            <S.RawParametersDetails open={autoExpandTools}>
              <S.RawParametersSummary>View raw parameters</S.RawParametersSummary>
              <S.RawParametersContent>{message.toolInput}</S.RawParametersContent>
            </S.RawParametersDetails>
          )}
        </S.DiffContainer>
      </S.DetailsContainer>
    );
  };

  const renderTodoWriteTool = () => {
    const input = logic.parseToolInput(message.toolInput);
    if (!input || !input.todos || !Array.isArray(input.todos)) {
      return renderDefaultTool();
    }

    return (
      <S.DetailsContainer open={autoExpandTools}>
        <S.DetailsSummary>
          <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </S.ChevronIcon>
          Updating Todo List
        </S.DetailsSummary>
        <S.DiffContainer>
          <TodoList todos={input.todos} />
          {showRawParameters && (
            <S.RawParametersDetails open={autoExpandTools}>
              <S.RawParametersSummary>View raw parameters</S.RawParametersSummary>
              <S.RawParametersContent>{message.toolInput}</S.RawParametersContent>
            </S.RawParametersDetails>
          )}
        </S.DiffContainer>
      </S.DetailsContainer>
    );
  };

  const renderBashTool = () => {
    const input = logic.parseToolInput(message.toolInput);
    if (!input || !input.command) {
      return renderDefaultTool();
    }

    return (
      <S.DetailsContainer open={autoExpandTools}>
        <S.DetailsSummary>
          <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </S.ChevronIcon>
          Running command
        </S.DetailsSummary>
        <S.TerminalContainer>
          <S.Terminal>
            <S.TerminalHeader>
              <S.TerminalIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </S.TerminalIcon>
              <S.TerminalLabel>Terminal</S.TerminalLabel>
            </S.TerminalHeader>
            <S.TerminalCommand>$ {input.command}</S.TerminalCommand>
          </S.Terminal>
          {input.description && (
            <S.CommandDescription>{input.description}</S.CommandDescription>
          )}
          {showRawParameters && (
            <S.RawParametersDetails>
              <S.RawParametersSummary>View raw parameters</S.RawParametersSummary>
              <S.RawParametersContent>{message.toolInput}</S.RawParametersContent>
            </S.RawParametersDetails>
          )}
        </S.TerminalContainer>
      </S.DetailsContainer>
    );
  };

  const renderReadTool = () => {
    const input = logic.parseToolInput(message.toolInput);
    if (!input || !input.file_path) {
      return renderDefaultTool();
    }

    const { relativePath, filename } = logic.getRelevantPathParts(input.file_path);

    return (
      <S.DetailsContainer open={autoExpandTools}>
        <S.FileReadSummary>
          <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </S.ChevronIcon>
          <S.FileIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </S.FileIcon>
          <S.FilePath>{relativePath}</S.FilePath>
          <S.FileName>{filename}</S.FileName>
        </S.FileReadSummary>
        {showRawParameters && (
          <S.DiffContainer>
            <S.RawParametersDetails>
              <S.RawParametersSummary>View raw parameters</S.RawParametersSummary>
              <S.RawParametersContent>{message.toolInput}</S.RawParametersContent>
            </S.RawParametersDetails>
          </S.DiffContainer>
        )}
      </S.DetailsContainer>
    );
  };

  const renderDefaultTool = () => (
    <S.DetailsContainer open={autoExpandTools}>
      <S.DetailsSummary>
        <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </S.ChevronIcon>
        View input parameters
      </S.DetailsSummary>
      <S.RawParametersContent>{message.toolInput}</S.RawParametersContent>
    </S.DetailsContainer>
  );

  const renderToolResult = () => {
    if (!message.toolResult) return null;

    const content = String(message.toolResult.content || '');
    const isError = message.toolResult.isError;

    // Special handling for TodoWrite/TodoRead results
    if (logic.isTodoResult(message.toolName, content)) {
      const todos = logic.parseTodoResult(content);
      if (todos && Array.isArray(todos)) {
        return (
          <S.ToolResultContainer>
            <S.ToolResultHeader>
              <S.ToolResultIcon isError={false}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </S.ToolResultIcon>
              <S.ToolResultLabel isError={false}>Tool Result</S.ToolResultLabel>
            </S.ToolResultHeader>
            <S.ToolResultContent isError={false}>
              <div>
                <S.SuccessMessage>
                  <S.SuccessText>Current Todo List</S.SuccessText>
                </S.SuccessMessage>
                <TodoList todos={todos} isResult={true} />
              </div>
            </S.ToolResultContent>
          </S.ToolResultContainer>
        );
      }
      if (content.includes('Todos have been modified successfully')) {
        return (
          <S.ToolResultContainer>
            <S.ToolResultHeader>
              <S.ToolResultIcon isError={false}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </S.ToolResultIcon>
              <S.ToolResultLabel isError={false}>Tool Result</S.ToolResultLabel>
            </S.ToolResultHeader>
            <S.ToolResultContent isError={false}>
              <div>
                <S.SuccessMessage>
                  <S.SuccessText>Todo list has been updated successfully</S.SuccessText>
                </S.SuccessMessage>
              </div>
            </S.ToolResultContent>
          </S.ToolResultContainer>
        );
      }
    }

    // Special handling for interactive prompts
    if (content.includes('Do you want to proceed?') && message.toolName === 'Bash') {
      const promptData = logic.parseInteractivePrompt(content);
      return (
        <S.ToolResultContainer>
          <S.ToolResultHeader>
            <S.ToolResultIcon isError={isError}>
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isError ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </S.ToolResultIcon>
            <S.ToolResultLabel isError={isError}>
              {isError ? 'Tool Error' : 'Tool Result'}
            </S.ToolResultLabel>
          </S.ToolResultHeader>
          <S.ToolResultContent isError={isError}>
            <div className="space-y-3">
              {promptData.beforePrompt && (
                <S.BeforePromptContent>
                  <S.BeforePromptPre>{promptData.beforePrompt}</S.BeforePromptPre>
                </S.BeforePromptContent>
              )}
              <S.InteractivePromptContainer>
                <S.InteractivePromptContent>
                  <S.InteractivePromptIcon>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </S.InteractivePromptIcon>
                  <S.InteractivePromptBody>
                    <S.InteractivePromptTitle>Interactive Prompt</S.InteractivePromptTitle>
                    <S.InteractivePromptText>{promptData.questionLine}</S.InteractivePromptText>
                    <S.InteractiveOptionsContainer>
                      {promptData.options.map((option) => (
                        <S.InteractiveOption 
                          key={option.number} 
                          isSelected={promptData.selectedOption === option.number}
                          disabled
                        >
                          <S.InteractiveOptionContent>
                            <S.InteractiveOptionNumber isSelected={promptData.selectedOption === option.number}>
                              {option.number}
                            </S.InteractiveOptionNumber>
                            <S.InteractiveOptionText>{option.text}</S.InteractiveOptionText>
                            {promptData.selectedOption === option.number && (
                              <S.InteractiveCheckmark fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </S.InteractiveCheckmark>
                            )}
                          </S.InteractiveOptionContent>
                        </S.InteractiveOption>
                      ))}
                    </S.InteractiveOptionsContainer>
                    {promptData.selectedOption && (
                      <S.InteractivePromptFooter>
                        <S.InteractivePromptFooterTitle>
                          ✓ Claude selected option {promptData.selectedOption}
                        </S.InteractivePromptFooterTitle>
                        <S.InteractivePromptFooterText>
                          In the CLI, you would select this option interactively using arrow keys or by typing the number.
                        </S.InteractivePromptFooterText>
                      </S.InteractivePromptFooter>
                    )}
                  </S.InteractivePromptBody>
                </S.InteractivePromptContent>
              </S.InteractivePromptContainer>
            </div>
          </S.ToolResultContent>
        </S.ToolResultContainer>
      );
    }

    // Handle file edit/create success messages
    const fileEditPath = logic.extractFileEditInfo(content);
    if (fileEditPath) {
      return (
        <S.ToolResultContainer>
          <S.ToolResultHeader>
            <S.ToolResultIcon isError={false}>
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </S.ToolResultIcon>
            <S.ToolResultLabel isError={false}>Tool Result</S.ToolResultLabel>
          </S.ToolResultHeader>
          <S.ToolResultContent isError={false}>
            <div>
              <S.SuccessMessage>
                <S.SuccessText>File updated successfully</S.SuccessText>
              </S.SuccessMessage>
              <S.FileCreateButton onClick={() => onFileOpen && onFileOpen(fileEditPath)}>
                {fileEditPath}
              </S.FileCreateButton>
            </div>
          </S.ToolResultContent>
        </S.ToolResultContainer>
      );
    }

    const fileCreatePath = logic.extractFileCreateInfo(content);
    if (fileCreatePath) {
      return (
        <S.ToolResultContainer>
          <S.ToolResultHeader>
            <S.ToolResultIcon isError={false}>
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </S.ToolResultIcon>
            <S.ToolResultLabel isError={false}>Tool Result</S.ToolResultLabel>
          </S.ToolResultHeader>
          <S.ToolResultContent isError={false}>
            <div>
              <S.SuccessMessage>
                <S.SuccessText>File created successfully</S.SuccessText>
              </S.SuccessMessage>
              <S.FileCreateButton onClick={() => onFileOpen && onFileOpen(fileCreatePath)}>
                {fileCreatePath}
              </S.FileCreateButton>
            </div>
          </S.ToolResultContent>
        </S.ToolResultContainer>
      );
    }

    // Special handling for Write tool - hide content if it's just the file content
    if (message.toolName === 'Write' && !isError) {
      return (
        <S.ToolResultContainer>
          <S.ToolResultHeader>
            <S.ToolResultIcon isError={false}>
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </S.ToolResultIcon>
            <S.ToolResultLabel isError={false}>Tool Result</S.ToolResultLabel>
          </S.ToolResultHeader>
          <S.WriteSuccessContainer>
            <S.WriteSuccessHeader>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <S.SuccessText>File written successfully</S.SuccessText>
            </S.WriteSuccessHeader>
            <S.WriteSuccessNote>
              The file content is displayed in the diff view above
            </S.WriteSuccessNote>
          </S.WriteSuccessContainer>
        </S.ToolResultContainer>
      );
    }

    // Handle file content display
    if (content.includes('cat -n') && content.includes('→')) {
      return (
        <S.ToolResultContainer>
          <S.ToolResultHeader>
            <S.ToolResultIcon isError={isError}>
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isError ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </S.ToolResultIcon>
            <S.ToolResultLabel isError={isError}>
              {isError ? 'Tool Error' : 'Tool Result'}
            </S.ToolResultLabel>
          </S.ToolResultHeader>
          <S.ToolResultContent isError={isError}>
            <S.FileContentDetails open={autoExpandTools}>
              <S.FileContentSummary>
                <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </S.ChevronIcon>
                View file content
              </S.FileContentSummary>
              <S.FileContentWrapper>
                <S.FileContentText>{content}</S.FileContentText>
              </S.FileContentWrapper>
            </S.FileContentDetails>
          </S.ToolResultContent>
        </S.ToolResultContainer>
      );
    }

    // Handle long output
    if (content.length > 300) {
      return (
        <S.ToolResultContainer>
          <S.ToolResultHeader>
            <S.ToolResultIcon isError={isError}>
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isError ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </S.ToolResultIcon>
            <S.ToolResultLabel isError={isError}>
              {isError ? 'Tool Error' : 'Tool Result'}
            </S.ToolResultLabel>
          </S.ToolResultHeader>
          <S.ToolResultContent isError={isError}>
            <S.LongOutputDetails open={autoExpandTools}>
              <S.LongOutputSummary>
                <S.ChevronIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </S.ChevronIcon>
                View full output ({content.length} chars)
              </S.LongOutputSummary>
              <S.ProseContent>
                <ReactMarkdown>{content}</ReactMarkdown>
              </S.ProseContent>
            </S.LongOutputDetails>
          </S.ToolResultContent>
        </S.ToolResultContainer>
      );
    }

    // Default result display
    return (
      <S.ToolResultContainer>
        <S.ToolResultHeader>
          <S.ToolResultIcon isError={isError}>
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isError ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </S.ToolResultIcon>
          <S.ToolResultLabel isError={isError}>
            {isError ? 'Tool Error' : 'Tool Result'}
          </S.ToolResultLabel>
        </S.ToolResultHeader>
        <S.ToolResultContent isError={isError}>
          <S.ProseContent>
            <ReactMarkdown>{content}</ReactMarkdown>
          </S.ProseContent>
        </S.ToolResultContent>
      </S.ToolResultContainer>
    );
  };

  const renderInteractivePrompt = () => {
    const { questionLine, options } = logic.parseInteractiveMenuOptions(message.content);

    return (
      <S.InteractivePromptContainer>
        <S.InteractivePromptContent>
          <S.InteractivePromptIcon>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </S.InteractivePromptIcon>
          <S.InteractivePromptBody>
            <S.InteractivePromptTitle>Interactive Prompt</S.InteractivePromptTitle>
            <S.InteractivePromptText>{questionLine}</S.InteractivePromptText>
            <S.InteractiveOptionsContainer>
              {options.map((option) => (
                <S.InteractiveOption 
                  key={option.number} 
                  isSelected={option.isSelected}
                  disabled
                >
                  <S.InteractiveOptionContent>
                    <S.InteractiveOptionNumber isSelected={option.isSelected}>
                      {option.number}
                    </S.InteractiveOptionNumber>
                    <S.InteractiveOptionText>{option.text}</S.InteractiveOptionText>
                    {option.isSelected && (
                      <S.InteractiveArrow>❯</S.InteractiveArrow>
                    )}
                  </S.InteractiveOptionContent>
                </S.InteractiveOption>
              ))}
            </S.InteractiveOptionsContainer>
            <S.InteractivePromptFooter>
              <S.InteractivePromptFooterTitle>
                ⏳ Waiting for your response in the CLI
              </S.InteractivePromptFooterTitle>
              <S.InteractivePromptFooterText>
                Please select an option in your terminal where Claude is running.
              </S.InteractivePromptFooterText>
            </S.InteractivePromptFooter>
          </S.InteractivePromptBody>
        </S.InteractivePromptContent>
      </S.InteractivePromptContainer>
    );
  };

  const renderAssistantContent = () => {
    if (message.isToolUse) {
      return (
        <S.ToolUseContainer>
          <S.ToolHeader>
            <S.ToolHeaderLeft>
              <S.ToolIcon>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </S.ToolIcon>
              <S.ToolName>Using {message.toolName}</S.ToolName>
              <S.ToolId>{message.toolId}</S.ToolId>
            </S.ToolHeaderLeft>
            {onShowSettings && (
              <S.SettingsButton
                onClick={(e) => {
                  e.stopPropagation();
                  onShowSettings();
                }}
                title="Tool Settings"
              >
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </S.SettingsButton>
            )}
          </S.ToolHeader>
          {message.toolInput && renderToolUseContent()}
          {renderToolResult()}
        </S.ToolUseContainer>
      );
    }

    if (message.isInteractivePrompt) {
      return renderInteractivePrompt();
    }

    return (
      <S.RegularMessageContent>
        {message.type === 'assistant' ? (
          <S.AssistantProseContent>
            <ReactMarkdown
              components={{
                code: ({node, inline, className, children, ...props}) => {
                  return inline ? (
                    <S.InlineCode className="not-prose" {...props}>{children}</S.InlineCode>
                  ) : (
                    <S.CodeBlockWrapper>
                      <S.CodeBlock {...props}>{children}</S.CodeBlock>
                    </S.CodeBlockWrapper>
                  );
                },
                blockquote: ({children}) => (
                  <S.Blockquote>{children}</S.Blockquote>
                ),
                a: ({href, children}) => (
                  <S.Link href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </S.Link>
                ),
                p: ({children}) => (
                  <S.Paragraph>{children}</S.Paragraph>
                )
              }}
            >
              {String(message.content || '')}
            </ReactMarkdown>
          </S.AssistantProseContent>
        ) : (
          <S.ErrorMessageContent>{message.content}</S.ErrorMessageContent>
        )}
      </S.RegularMessageContent>
    );
  };

  const renderAssistantMessage = () => (
    <S.AssistantContainer>
      {!isGrouped && (
        <S.AssistantHeader>
          {message.type === 'error' ? (
            <S.ErrorIcon>!</S.ErrorIcon>
          ) : (
            <S.ClaudeIconWrapper>
              <ClaudeLogo className="w-full h-full" />
            </S.ClaudeIconWrapper>
          )}
          <S.AssistantName>
            {message.type === 'error' ? 'Error' : 'Claude'}
          </S.AssistantName>
        </S.AssistantHeader>
      )}
      <S.ContentContainer>
        {renderAssistantContent()}
        <S.MessageTimestamp isGrouped={isGrouped}>
          {logic.formatTimestamp(message.timestamp)}
        </S.MessageTimestamp>
      </S.ContentContainer>
    </S.AssistantContainer>
  );

  return (
    <S.MessageWrapper
      ref={messageRef}
      type={message.type}
      isGrouped={isGrouped}
      isUser={message.type === 'user'}
      className={`chat-message ${message.type} ${isGrouped ? 'grouped' : ''}`}
    >
      {message.type === 'user' ? renderUserMessage() : renderAssistantMessage()}
    </S.MessageWrapper>
  );
});

Message.displayName = 'Message';

export default Message;