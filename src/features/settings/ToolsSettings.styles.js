import styled from '@emotion/styled';
import tw from 'twin.macro';

// Main modal container
export const ModalBackdrop = styled.div`
  ${tw`fixed inset-0 flex items-center justify-center z-[100] md:p-4`}
  background-color: var(--background);
  background-color: rgba(var(--background-rgb), 0.95);
`;

export const ModalContainer = styled.div`
  ${tw`w-full md:max-w-4xl h-full md:h-[90vh] flex flex-col`}
  ${tw`bg-background border border-border md:rounded-lg shadow-xl`}
`;

// Header
export const ModalHeader = styled.div`
  ${tw`flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0`}
`;

export const HeaderTitle = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const HeaderIcon = styled.div`
  ${tw`w-5 h-5 md:w-6 md:h-6 text-blue-600`}
`;

export const Title = styled.h2`
  ${tw`text-lg md:text-xl font-semibold text-foreground`}
`;

// Content area
export const ModalContent = styled.div`
  ${tw`flex-1 overflow-y-auto`}
`;

export const ContentInner = styled.div`
  ${tw`p-4 md:p-6 space-y-6 md:space-y-8`}
  padding-bottom: env(safe-area-inset-bottom);
`;

// Section components
export const Section = styled.div`
  ${tw`space-y-4`}
`;

export const SectionHeader = styled.div`
  ${tw`flex items-center gap-3`}
`;

export const SectionTitle = styled.h3`
  ${tw`text-lg font-medium text-foreground`}
`;

export const SectionDescription = styled.p`
  ${tw`text-sm text-muted-foreground`}
`;

// Theme toggle
export const ThemeToggleContainer = styled.div`
  ${tw`bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4`}
`;

export const ThemeToggleWrapper = styled.div`
  ${tw`flex items-center justify-between`}
`;

export const ThemeToggleInfo = styled.div``;

export const ThemeToggleLabel = styled.div`
  ${tw`font-medium text-foreground`}
`;

export const ThemeToggleDescription = styled.div`
  ${tw`text-sm text-muted-foreground`}
`;

export const ThemeToggleButton = styled.button`
  ${tw`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200`}
  ${tw`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
  ${({ $isDarkMode }) => $isDarkMode ? tw`bg-gray-700` : tw`bg-gray-200`}
`;

export const ThemeToggleThumb = styled.span`
  ${tw`inline-block h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-200`}
  ${tw`flex items-center justify-center`}
  ${({ $isDarkMode }) => $isDarkMode ? tw`translate-x-7` : tw`translate-x-1`}
`;

// Permission settings
export const PermissionContainer = styled.div`
  ${tw`bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4`}
`;

export const PermissionLabel = styled.label`
  ${tw`flex items-center gap-3`}
`;

export const PermissionCheckbox = styled.input`
  ${tw`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500`}
`;

export const PermissionInfo = styled.div``;

export const PermissionTitle = styled.div`
  ${tw`font-medium text-orange-900 dark:text-orange-100`}
`;

export const PermissionDescription = styled.div`
  ${tw`text-sm text-orange-700 dark:text-orange-300`}
`;

// Tool input area
export const ToolInputWrapper = styled.div`
  ${tw`flex flex-col sm:flex-row gap-2`}
`;

export const ToolInput = styled.input`
  ${tw`flex-1 h-10`}
  ${tw`px-3 py-2 text-base`}
  ${tw`bg-background text-foreground`}
  ${tw`border border-input rounded-md`}
  ${tw`focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
  ${tw`disabled:cursor-not-allowed disabled:opacity-50`}
  font-size: 16px;
  -webkit-tap-highlight-color: transparent;
`;

// Quick add tools
export const QuickAddContainer = styled.div`
  ${tw`space-y-2`}
`;

export const QuickAddLabel = styled.p`
  ${tw`text-sm font-medium text-gray-700 dark:text-gray-300`}
`;

export const QuickAddGrid = styled.div`
  ${tw`grid grid-cols-2 sm:flex sm:flex-wrap gap-2`}
`;

// Tool list
export const ToolList = styled.div`
  ${tw`space-y-2`}
`;

export const ToolItem = styled.div`
  ${tw`flex items-center justify-between rounded-lg p-3`}
  ${({ $variant }) => {
    if ($variant === 'allowed') {
      return tw`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800`;
    }
    return tw`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800`;
  }}
`;

export const ToolName = styled.span`
  ${tw`font-mono text-sm`}
  ${({ $variant }) => {
    if ($variant === 'allowed') {
      return tw`text-green-800 dark:text-green-200`;
    }
    return tw`text-red-800 dark:text-red-200`;
  }}
`;

export const EmptyState = styled.div`
  ${tw`text-center py-8 text-gray-500 dark:text-gray-400`}
`;

// Help section
export const HelpContainer = styled.div`
  ${tw`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4`}
`;

export const HelpTitle = styled.h4`
  ${tw`font-medium text-blue-900 dark:text-blue-100 mb-2`}
`;

export const HelpList = styled.ul`
  ${tw`text-sm text-blue-800 dark:text-blue-200 space-y-1`}
`;

export const HelpCode = styled.code`
  ${tw`bg-blue-100 dark:bg-blue-800 px-1 rounded`}
`;

// Footer
export const ModalFooter = styled.div`
  ${tw`flex flex-col sm:flex-row sm:items-center sm:justify-between`}
  ${tw`p-4 md:p-6 border-t border-border flex-shrink-0 gap-3`}
  padding-bottom: env(safe-area-inset-bottom);
`;

export const FooterStatus = styled.div`
  ${tw`flex items-center justify-center sm:justify-start gap-2 order-2 sm:order-1`}
`;

export const FooterActions = styled.div`
  ${tw`flex items-center gap-3 order-1 sm:order-2`}
`;

export const StatusMessage = styled.div`
  ${tw`text-sm flex items-center gap-1`}
  ${({ $variant }) => {
    if ($variant === 'success') {
      return tw`text-green-600 dark:text-green-400`;
    }
    return tw`text-red-600 dark:text-red-400`;
  }}
`;

export const StatusIcon = styled.svg`
  ${tw`w-4 h-4`}
  fill: currentColor;
`;

export const LoadingSpinner = styled.div`
  ${tw`w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent`}
`;

export const ButtonText = styled.div`
  ${tw`flex items-center gap-2`}
`;