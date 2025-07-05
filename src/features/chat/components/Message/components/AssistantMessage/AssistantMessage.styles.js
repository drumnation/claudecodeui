import styled from '@emotion/styled';
import tw from 'twin.macro';

// Assistant Message Styles
export const AssistantContainer = styled.div`
  ${tw`w-full`}
`;

export const AssistantHeader = styled.div`
  ${tw`flex items-center space-x-3 mb-2`}
`;

export const ErrorIcon = styled.div`
  ${tw`w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0`}
`;

export const ClaudeIconWrapper = styled.div`
  ${tw`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 p-1`}
`;

export const AssistantName = styled.div`
  ${tw`text-sm font-medium text-gray-900 dark:text-white`}
`;

export const ContentContainer = styled.div`
  ${tw`w-full`}
`;

// Tool Use Styles
export const ToolUseContainer = styled.div`
  ${tw`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 mb-2`}
`;

export const ToolHeader = styled.div`
  ${tw`flex items-center justify-between mb-2`}
`;

export const ToolHeaderLeft = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const ToolIcon = styled.div`
  ${tw`w-5 h-5 bg-blue-600 rounded flex items-center justify-center`}
`;

export const ToolName = styled.span`
  ${tw`font-medium text-blue-900 dark:text-blue-100`}
`;

export const ToolId = styled.span`
  ${tw`text-xs text-blue-600 dark:text-blue-400 font-mono`}
`;

export const SettingsButton = styled.button`
  ${tw`p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors`}
`;

export const ChevronIcon = styled.svg`
  ${tw`w-4 h-4 transition-transform`}
  
  details[open] & {
    transform: rotate(180deg);
  }
`;

// Tool Result Styles
export const ToolResultContainer = styled.div`
  ${tw`mt-3 border-t border-blue-200 dark:border-blue-700 pt-3`}
`;

export const ToolResultHeader = styled.div`
  ${tw`flex items-center gap-2 mb-2`}
`;

export const ToolResultIcon = styled.div(({ isError }) => [
  tw`w-4 h-4 rounded flex items-center justify-center`,
  isError ? tw`bg-red-500` : tw`bg-green-500`
]);

export const ToolResultLabel = styled.span(({ isError }) => [
  tw`text-sm font-medium`,
  isError ? tw`text-red-700 dark:text-red-300` : tw`text-green-700 dark:text-green-300`
]);

export const ToolResultContent = styled.div(({ isError }) => [
  tw`text-sm`,
  isError ? tw`text-red-800 dark:text-red-200` : tw`text-green-800 dark:text-green-200`
]);

export const SuccessMessage = styled.div`
  ${tw`flex items-center gap-2 mb-2`}
`;

export const SuccessText = styled.span`
  ${tw`font-medium`}
`;

export const FileCreateButton = styled.button`
  ${tw`text-xs font-mono bg-green-100 dark:bg-green-800/30 px-2 py-1 rounded text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline cursor-pointer`}
`;

export const WriteSuccessContainer = styled.div`
  ${tw`text-green-700 dark:text-green-300`}
`;

export const WriteSuccessHeader = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const WriteSuccessNote = styled.p`
  ${tw`text-xs mt-1 text-green-600 dark:text-green-400`}
`;

export const FileContentDetails = styled.details`
  /* Using 'open' prop */
`;

export const FileContentSummary = styled.summary`
  ${tw`text-sm text-green-700 dark:text-green-300 cursor-pointer hover:text-green-800 dark:hover:text-green-200 mb-2 flex items-center gap-2`}
`;

export const FileContentWrapper = styled.div`
  ${tw`mt-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden`}
`;

export const FileContentText = styled.div`
  ${tw`text-xs font-mono p-3 whitespace-pre-wrap break-words overflow-hidden`}
`;

export const LongOutputDetails = styled.details`
  /* Using 'open' prop */
`;

export const LongOutputSummary = styled.summary`
  ${tw`text-sm text-green-700 dark:text-green-300 cursor-pointer hover:text-green-800 dark:hover:text-green-200 mb-2 flex items-center gap-2`}
`;

export const ProseContent = styled.div`
  ${tw`mt-2 prose prose-sm max-w-none prose-green dark:prose-invert`}
`;

// Interactive Prompt Styles
export const InteractivePromptContainer = styled.div`
  ${tw`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4`}
`;

export const InteractivePromptContent = styled.div`
  ${tw`flex items-start gap-3`}
`;

export const InteractivePromptIcon = styled.div`
  ${tw`w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
`;

export const InteractivePromptBody = styled.div`
  ${tw`flex-1`}
`;

export const InteractivePromptTitle = styled.h4`
  ${tw`font-semibold text-amber-900 dark:text-amber-100 text-base mb-2`}
`;

export const InteractivePromptText = styled.p`
  ${tw`text-sm text-amber-800 dark:text-amber-200 mb-4`}
`;

export const InteractiveOptionsContainer = styled.div`
  ${tw`space-y-2 mb-4`}
`;

export const InteractiveOption = styled.button(({ isSelected }) => [
  tw`w-full text-left px-4 py-3 rounded-lg border-2 transition-all cursor-not-allowed`,
  isSelected 
    ? tw`bg-amber-600 dark:bg-amber-700 text-white border-amber-600 dark:border-amber-700 shadow-md opacity-75`
    : tw`bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-sm opacity-75`
]);

export const InteractiveOptionContent = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const InteractiveOptionNumber = styled.span(({ isSelected }) => [
  tw`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`,
  isSelected ? tw`bg-white/20` : tw`bg-amber-100 dark:bg-amber-800/50`
]);

export const InteractiveOptionText = styled.span`
  ${tw`text-sm sm:text-base font-medium flex-1`}
`;

export const InteractiveCheckmark = styled.svg`
  ${tw`w-5 h-5 flex-shrink-0`}
`;

export const InteractiveArrow = styled.span`
  ${tw`text-lg`}
`;

export const InteractivePromptFooter = styled.div`
  ${tw`bg-amber-100 dark:bg-amber-800/30 rounded-lg p-3`}
`;

export const InteractivePromptFooterTitle = styled.p`
  ${tw`text-amber-900 dark:text-amber-100 text-sm font-medium mb-1`}
`;

export const InteractivePromptFooterText = styled.p`
  ${tw`text-amber-800 dark:text-amber-200 text-xs`}
`;

// Regular Message Content Styles
export const RegularMessageContent = styled.div`
  ${tw`text-sm text-gray-700 dark:text-gray-300`}
`;

export const AssistantProseContent = styled.div`
  ${tw`prose prose-sm max-w-none dark:prose-invert prose-gray`}
  
  & code {
    background-color: transparent !important;
    padding: 0 !important;
  }
`;

export const InlineCode = styled.strong`
  ${tw`text-blue-600 dark:text-blue-400 font-bold`}
`;

export const CodeBlockWrapper = styled.div`
  ${tw`bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-hidden my-2`}
`;

export const CodeBlock = styled.code`
  ${tw`text-gray-800 dark:text-gray-200 text-sm font-mono block whitespace-pre-wrap break-words`}
`;

export const Blockquote = styled.blockquote`
  ${tw`border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2`}
`;

export const Link = styled.a`
  ${tw`text-blue-600 dark:text-blue-400 hover:underline`}
`;

export const Paragraph = styled.div`
  ${tw`mb-2 last:mb-0`}
`;

export const ErrorMessageContent = styled.div`
  ${tw`whitespace-pre-wrap`}
`;

export const MessageTimestamp = styled.div(({ isGrouped }) => [
  tw`text-xs text-gray-500 dark:text-gray-400 mt-1`,
  isGrouped && tw`opacity-0 group-hover:opacity-100`
]);

// Before Prompt Content (for interactive prompts)
export const BeforePromptContent = styled.div`
  ${tw`bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-3 font-mono text-xs overflow-x-auto`}
`;

export const BeforePromptPre = styled.pre`
  ${tw`whitespace-pre-wrap break-words`}
`;