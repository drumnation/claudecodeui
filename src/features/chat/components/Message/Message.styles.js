import styled from '@emotion/styled';
import tw from 'twin.macro';

export const MessageWrapper = styled.div`
  ${({ type, isGrouped, isUser }) => {
    const baseStyles = [
      isUser && tw`flex justify-end px-3 sm:px-0`,
      !isUser && tw`px-3 sm:px-0`
    ];
    
    return baseStyles;
  }}
  
  /* Apply the chat-message class styles */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  
  ${({ type }) => type && `
    /* Type-specific styles can be added here if needed */
  `}
  
  ${({ isGrouped }) => isGrouped && `
    /* Grouped message styles */
    margin-top: 0.25rem;
  `}
`;

// Assistant Message Styles - moved to AssistantMessage component

// Tool Use Styles - moved to AssistantMessage component

export const DetailsContainer = styled.details`
  ${tw`mt-2`}
`;

export const DetailsSummary = styled.summary`
  ${tw`text-sm text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-2`}
`;

// All styles related to AssistantMessage have been moved to the AssistantMessage component