import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { ClaudeLogo } from '@/shared-components/ClaudeLogo';
import TodoList from '@/features/chat/components/TodoList';
import * as logic from '@/features/chat/components/Message/components/AssistantMessage/AssistantMessage.logic';
import * as S from '@/features/chat/components/Message/components/AssistantMessage/AssistantMessage.styles';

// Import tool components
import BashTool from '@/features/chat/components/Tools/BashTool/BashTool';
import EditTool from '@/features/chat/components/Tools/EditTool/EditTool';
import WriteTool from '@/features/chat/components/Tools/WriteTool/WriteTool';
import TodoWriteTool from '@/features/chat/components/Tools/TodoWriteTool/TodoWriteTool';
import ReadTool from '@/features/chat/components/Tools/ReadTool/ReadTool';
import DefaultTool from '@/features/chat/components/Tools/DefaultTool/DefaultTool';

const AssistantMessage = memo(({
  message,
  isGrouped,
  onFileOpen,
  onShowSettings,
  autoExpandTools,
  showRawParameters,
  createDiff
}) => {
  const renderToolUseContent = () => {
    const commonProps = {
      toolInput: message.toolInput,
      autoExpandTools,
      showRawParameters,
      renderDefaultTool: () => <DefaultTool toolInput={message.toolInput} autoExpandTools={autoExpandTools} />
    };

    switch (message.toolName) {
      case 'Edit':
        return <EditTool {...commonProps} onFileOpen={onFileOpen} createDiff={createDiff} />;
      case 'Write':
        return <WriteTool {...commonProps} onFileOpen={onFileOpen} createDiff={createDiff} />;
      case 'TodoWrite':
        return <TodoWriteTool {...commonProps} />;
      case 'Bash':
        return <BashTool {...commonProps} />;
      case 'Read':
        return <ReadTool {...commonProps} />;
      default:
        return <DefaultTool toolInput={message.toolInput} autoExpandTools={autoExpandTools} />;
    }
  };

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

  return (
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
});

AssistantMessage.displayName = 'AssistantMessage';

export default AssistantMessage;