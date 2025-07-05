// QuickSettingsPanel.styles.js
import styled from '@emotion/styled';
import tw from 'twin.macro';

export const PullTabContainer = styled.div`
  ${tw`fixed z-50 transition-all duration-150 ease-out`}
  ${({ isMobile }) => isMobile ? tw`bottom-44` : tw`top-1/2 -translate-y-1/2`}
  ${({ isOpen }) => isOpen ? tw`right-64` : tw`right-0`}
`;

export const PullTabButton = styled.button`
  ${tw`
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700 
    rounded-l-md p-2 
    hover:bg-gray-100 dark:hover:bg-gray-700 
    transition-colors shadow-lg
  `}
`;

export const TabIcon = styled.div`
  ${tw`h-5 w-5 text-gray-600 dark:text-gray-400`}
`;

export const PanelContainer = styled.div`
  ${tw`
    fixed top-0 right-0 h-full w-64 
    bg-white dark:bg-gray-900 
    border-l border-gray-200 dark:border-gray-700 
    shadow-xl transform transition-transform duration-150 ease-out z-40
  `}
  ${({ isOpen }) => isOpen ? tw`translate-x-0` : tw`translate-x-full`}
  ${({ isMobile }) => isMobile && tw`h-screen`}
`;

export const PanelContent = styled.div`
  ${tw`h-full flex flex-col`}
`;

export const PanelHeader = styled.div`
  ${tw`
    p-4 border-b border-gray-200 dark:border-gray-700 
    bg-gray-50 dark:bg-gray-900
  `}
`;

export const PanelTitle = styled.h3`
  ${tw`
    text-lg font-semibold text-gray-900 dark:text-white 
    flex items-center gap-2
  `}
`;

export const HeaderIcon = styled.div`
  ${tw`h-5 w-5 text-gray-600 dark:text-gray-400`}
`;

export const SettingsContent = styled.div`
  ${tw`
    flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 
    bg-white dark:bg-gray-900
  `}
  ${({ isMobile }) => isMobile && tw`pb-20`}
`;

export const SettingSection = styled.div`
  ${tw`space-y-2`}
`;

export const SectionTitle = styled.h4`
  ${tw`
    text-xs font-semibold uppercase tracking-wider 
    text-gray-500 dark:text-gray-400 mb-2
  `}
`;

export const SettingItem = styled.label`
  ${tw`
    flex items-center justify-between p-3 rounded-lg 
    bg-gray-50 dark:bg-gray-800 
    hover:bg-gray-100 dark:hover:bg-gray-700 
    cursor-pointer transition-colors 
    border border-transparent 
    hover:border-gray-300 dark:hover:border-gray-600
  `}
`;

export const RadioSettingItem = styled.label`
  ${tw`
    flex items-start p-3 rounded-lg 
    bg-gray-50 dark:bg-gray-800 
    hover:bg-gray-100 dark:hover:bg-gray-700 
    cursor-pointer transition-colors 
    border border-transparent 
    hover:border-gray-300 dark:hover:border-gray-600
  `}
`;

export const SettingLabel = styled.span`
  ${tw`
    flex items-center gap-2 text-sm 
    text-gray-900 dark:text-white
  `}
`;

export const SettingIcon = styled.div`
  ${tw`h-4 w-4 text-gray-600 dark:text-gray-400`}
`;

export const Checkbox = styled.input`
  ${tw`
    h-4 w-4 rounded 
    border-gray-300 dark:border-gray-600 
    text-blue-600 dark:text-blue-500 
    focus:ring-blue-500 dark:focus:ring-blue-400 
    dark:bg-gray-800 dark:checked:bg-blue-600
  `}
`;

export const RadioButton = styled.input`
  ${tw`
    mt-0.5 h-4 w-4 
    border-gray-300 dark:border-gray-600 
    text-blue-600 dark:text-blue-500 
    focus:ring-blue-500 dark:focus:ring-blue-400 
    dark:bg-gray-800 dark:checked:bg-blue-600
  `}
`;

export const RadioContent = styled.div`
  ${tw`ml-3 flex-1`}
`;

export const RadioLabel = styled.span`
  ${tw`
    flex items-center gap-2 text-sm font-medium 
    text-gray-900 dark:text-white
  `}
`;

export const RadioDescription = styled.p`
  ${tw`text-xs text-gray-500 dark:text-gray-400 mt-1`}
`;

export const Backdrop = styled.div`
  ${tw`
    fixed inset-0 bg-background/80 backdrop-blur-sm z-30 
    transition-opacity duration-150 ease-out
  `}
`;