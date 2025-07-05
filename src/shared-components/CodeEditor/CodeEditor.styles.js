import styled from '@emotion/styled';
import tw from 'twin.macro';

// Main container styles
export const EditorOverlay = styled.div`
  ${tw`fixed inset-0 z-50`}
  ${tw`md:bg-black/50 md:flex md:items-center md:justify-center`}
  ${({ isFullscreen }) => isFullscreen ? tw`md:p-0` : tw`md:p-4`}
`;

export const EditorContainer = styled.div`
  ${tw`shadow-2xl flex flex-col`}
  ${tw`w-full h-full`}
  ${tw`md:rounded-lg md:shadow-2xl`}
  
  ${({ isFullscreen }) => isFullscreen 
    ? tw`md:w-full md:h-full md:rounded-none` 
    : tw`md:w-full md:max-w-6xl md:h-[80vh] md:max-h-[80vh]`
  }
  
  background-color: ${({ isDarkMode }) => isDarkMode ? '#111827' : '#ffffff'} !important;
  
  &:hover {
    background-color: ${({ isDarkMode }) => isDarkMode ? '#111827' : '#ffffff'} !important;
  }
`;

// Loading state styles
export const LoadingContainer = styled.div`
  ${tw`w-full h-full md:rounded-lg md:w-auto md:h-auto p-8`}
  ${tw`flex items-center justify-center`}
  
  background-color: ${({ isDarkMode }) => isDarkMode ? '#111827' : '#ffffff'} !important;
  
  &:hover {
    background-color: ${({ isDarkMode }) => isDarkMode ? '#111827' : '#ffffff'} !important;
  }
`;

export const LoadingContent = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const LoadingSpinner = styled.div`
  ${tw`animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600`}
`;

export const LoadingText = styled.span`
  ${tw`text-gray-900 dark:text-white`}
`;

// Header styles
export const Header = styled.div`
  ${tw`flex items-center justify-between p-4`}
  ${tw`border-b border-gray-200 dark:border-gray-700`}
  ${tw`flex-shrink-0 min-w-0`}
`;

export const HeaderLeft = styled.div`
  ${tw`flex items-center gap-3 min-w-0 flex-1`}
`;

export const FileIcon = styled.div`
  ${tw`w-8 h-8 bg-blue-600 rounded`}
  ${tw`flex items-center justify-center flex-shrink-0`}
`;

export const FileIconText = styled.span`
  ${tw`text-white text-sm font-mono`}
`;

export const FileInfo = styled.div`
  ${tw`min-w-0 flex-1`}
`;

export const FileNameRow = styled.div`
  ${tw`flex items-center gap-2 min-w-0`}
`;

export const FileName = styled.h3`
  ${tw`font-medium text-gray-900 dark:text-white truncate`}
`;

export const DiffBadge = styled.span`
  ${tw`text-xs bg-blue-100 dark:bg-blue-900/30`}
  ${tw`text-blue-600 dark:text-blue-400`}
  ${tw`px-2 py-1 rounded whitespace-nowrap`}
`;

export const FilePath = styled.p`
  ${tw`text-sm text-gray-500 dark:text-gray-400 truncate`}
`;

export const HeaderActions = styled.div`
  ${tw`flex items-center gap-1 md:gap-2 flex-shrink-0`}
`;

// Button styles
export const IconButton = styled.button`
  ${tw`p-2 md:p-2 rounded-md`}
  ${tw`text-gray-600 dark:text-gray-400`}
  ${tw`hover:text-gray-900 dark:hover:text-white`}
  ${tw`hover:bg-gray-100 dark:hover:bg-gray-800`}
  ${tw`min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0`}
  ${tw`flex items-center justify-center`}
`;

export const SaveButton = styled.button`
  ${tw`px-3 py-2 text-white rounded-md`}
  ${tw`disabled:opacity-50 flex items-center gap-2`}
  ${tw`transition-colors min-h-[44px] md:min-h-0`}
  
  background-color: ${({ success }) => success ? '#16a34a' : '#2563eb'};
  
  &:hover {
    background-color: ${({ success }) => success ? '#15803d' : '#1d4ed8'};
  }
`;

export const ThemeToggle = styled.button`
  ${tw`p-2 md:p-2 rounded-md`}
  ${tw`text-gray-600 dark:text-gray-400`}
  ${tw`hover:text-gray-900 dark:hover:text-white`}
  ${tw`hover:bg-gray-100 dark:hover:bg-gray-800`}
  ${tw`min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0`}
  ${tw`flex items-center justify-center`}
`;

export const ThemeIcon = styled.span`
  ${tw`text-lg md:text-base`}
`;

export const FullscreenButton = styled.button`
  ${tw`hidden md:flex p-2`}
  ${tw`text-gray-600 dark:text-gray-400`}
  ${tw`hover:text-gray-900 dark:hover:text-white`}
  ${tw`rounded-md hover:bg-gray-100 dark:hover:bg-gray-800`}
  ${tw`items-center justify-center`}
`;

// Editor area styles
export const EditorWrapper = styled.div`
  ${tw`flex-1 overflow-hidden`}
`;

// Footer styles
export const Footer = styled.div`
  ${tw`flex items-center justify-between p-3`}
  ${tw`border-t border-gray-200 dark:border-gray-700`}
  ${tw`bg-gray-50 dark:bg-gray-800 flex-shrink-0`}
`;

export const FooterLeft = styled.div`
  ${tw`flex items-center gap-4 text-sm`}
  ${tw`text-gray-600 dark:text-gray-400`}
`;

export const FooterRight = styled.div`
  ${tw`text-sm text-gray-500 dark:text-gray-400`}
`;

// Icon styles for buttons
export const CheckIcon = styled.svg`
  ${tw`w-5 h-5 md:w-4 md:h-4`}
`;

export const ButtonText = styled.span`
  ${tw`hidden sm:inline`}
`;

// Style tag content generator
export const generateStyleTag = (isDarkMode) => `
  .code-editor-loading {
    background-color: ${isDarkMode ? '#111827' : '#ffffff'} !important;
  }
  .code-editor-loading:hover {
    background-color: ${isDarkMode ? '#111827' : '#ffffff'} !important;
  }
  .code-editor-modal {
    background-color: ${isDarkMode ? '#111827' : '#ffffff'} !important;
  }
  .code-editor-modal:hover {
    background-color: ${isDarkMode ? '#111827' : '#ffffff'} !important;
  }
`;