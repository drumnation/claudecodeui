import styled from '@emotion/styled';
import tw from 'twin.macro';

export const InputAreaContainer = styled.div`
  ${tw`p-2 sm:p-4 md:p-6 flex-shrink-0`}
  ${({ isInputFocused }) => isInputFocused ? tw`pb-2 sm:pb-4 md:pb-6` : tw`pb-16 sm:pb-4 md:pb-6`}
`;

export const StyledForm = styled.form`
  ${tw`relative max-w-4xl mx-auto`}
`;

export const InputWrapper = styled.div`
  ${tw`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600`}
  ${tw`focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 focus-within:border-blue-500`}
  ${tw`transition-all duration-200`}
  
  ${({ isExpanded }) => isExpanded && `
    box-shadow: 0 -5px 15px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.05);
    
    @media (prefers-color-scheme: dark) {
      box-shadow: 0 -5px 15px -3px rgba(0, 0, 0, 0.3), 0 -4px 6px -2px rgba(0, 0, 0, 0.2);
    }
  `}
`;

export const StyledTextarea = styled.textarea`
  ${tw`w-full px-4 sm:px-6 py-3 sm:py-4 pr-28 sm:pr-40 bg-transparent rounded-2xl`}
  ${tw`focus:outline-none text-gray-900 dark:text-gray-100`}
  ${tw`placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50`}
  ${tw`resize-none min-h-[40px] sm:min-h-[56px] max-h-[40vh] sm:max-h-[300px] overflow-y-auto`}
  ${tw`text-sm sm:text-base transition-all duration-200`}
  
  height: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 8px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 3px;
    transition: background-color 0.2s;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }
  
  &::placeholder {
    color: rgb(156 163 175) !important;
    opacity: 1 !important;
  }
  
  &::-webkit-input-placeholder {
    color: rgb(156 163 175) !important;
    opacity: 1 !important;
  }
  
  .dark & {
    scrollbar-color: rgba(107, 114, 128, 0.3) transparent;
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(107, 114, 128, 0.3);
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(107, 114, 128, 0.5);
    }
    
    &::placeholder {
      color: rgb(75 85 99) !important;
      opacity: 1 !important;
      -webkit-text-fill-color: rgb(75 85 99) !important;
    }
    
    &::-webkit-input-placeholder {
      color: rgb(75 85 99) !important;
      opacity: 1 !important;
      -webkit-text-fill-color: rgb(75 85 99) !important;
    }
  }
`;

export const ClearButton = styled.button`
  ${tw`absolute -left-0.5 -top-3 sm:right-28 sm:left-auto sm:top-1/2 sm:-translate-y-1/2`}
  ${tw`w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600`}
  ${tw`border border-gray-300 dark:border-gray-600 rounded-full`}
  ${tw`flex items-center justify-center transition-all duration-200 z-10 shadow-sm`}
`;

export const ClearButtonIcon = styled.svg`
  ${tw`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300 transition-colors`}
  
  ${ClearButton}:hover & {
    ${tw`text-gray-800 dark:text-gray-100`}
  }
`;

export const MicButtonWrapper = styled.div`
  ${tw`absolute right-16 sm:right-16 top-1/2 transform -translate-y-1/2`}
`;

export const SendButton = styled.button`
  ${tw`absolute right-2 top-1/2 transform -translate-y-1/2`}
  ${tw`w-12 h-12 sm:w-12 sm:h-12`}
  ${tw`bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
  ${tw`rounded-full flex items-center justify-center transition-colors`}
  ${tw`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800`}
`;

export const SendButtonIcon = styled.svg`
  ${tw`w-4 h-4 sm:w-5 sm:h-5 text-white transform rotate-90`}
`;

export const CommandMenuWrapper = styled.div`
  ${tw`absolute bottom-full left-0 right-0 mb-2`}
`;

export const FileDropdown = styled.div`
  ${tw`absolute bottom-full left-0 right-0 mb-2`}
  ${tw`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600`}
  ${tw`rounded-lg shadow-lg max-h-48 overflow-y-auto z-50`}
`;

export const FileDropdownItem = styled.div`
  ${tw`px-4 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0`}
  
  ${({ isSelected }) => isSelected 
    ? tw`bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300`
    : tw`hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`
  }
`;

export const FileDropdownItemName = styled.div`
  ${tw`font-medium text-sm`}
`;

export const FileDropdownItemPath = styled.div`
  ${tw`text-xs text-gray-500 dark:text-gray-400 font-mono`}
`;

export const HintTextDesktop = styled.div`
  ${tw`text-xs text-gray-500 dark:text-gray-400 text-center mt-2 hidden sm:block`}
`;

export const HintTextMobile = styled.div`
  ${tw`text-xs text-gray-500 dark:text-gray-400 text-center mt-2 sm:hidden transition-opacity duration-200`}
  ${({ isInputFocused }) => isInputFocused ? tw`opacity-100` : tw`opacity-0`}
`;