import styled from '@emotion/styled';
import tw from 'twin.macro';

export const TaskContainer = styled.div`
  ${tw`bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20`}
  ${tw`border border-purple-200 dark:border-purple-800 rounded-xl p-4 sm:p-6 mb-4`}
  ${tw`shadow-lg shadow-purple-100/50 dark:shadow-purple-900/50`}
  ${tw`transition-all duration-300 hover:shadow-xl hover:shadow-purple-200/50 dark:hover:shadow-purple-800/50`}
`;

export const TaskHeader = styled.div`
  ${tw`flex items-start gap-4 mb-4`}
`;

export const TaskIconWrapper = styled.div`
  ${tw`w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0`}
  ${tw`shadow-lg shadow-purple-500/30`}
`;

export const TaskIcon = styled.svg`
  ${tw`w-6 h-6 text-white`}
`;

export const TaskHeaderContent = styled.div`
  ${tw`flex-1`}
`;

export const TaskLabel = styled.div`
  ${tw`text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1`}
`;

export const TaskTitle = styled.h3`
  ${tw`text-xl font-bold text-gray-900 dark:text-white`}
`;

export const TaskDescription = styled.div`
  ${tw`text-sm text-gray-600 dark:text-gray-300 mt-1`}
`;

export const TaskContent = styled.div`
  ${tw`space-y-4`}
`;

export const PromptSection = styled.div`
  ${tw`bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-900`}
`;

export const PromptHeader = styled.div`
  ${tw`flex items-center justify-between mb-3`}
`;

export const PromptLabel = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const PromptIcon = styled.svg`
  ${tw`w-4 h-4 text-purple-600 dark:text-purple-400`}
`;

export const PromptLabelText = styled.span`
  ${tw`text-sm font-semibold text-purple-700 dark:text-purple-300`}
`;

export const ExpandButton = styled.button`
  ${tw`text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300`}
  ${tw`flex items-center gap-1 transition-colors`}
`;

export const ChevronIcon = styled.svg`
  ${tw`w-4 h-4 transition-transform duration-200`}
  ${({ isExpanded }) => isExpanded && tw`rotate-180`}
`;

export const PromptContent = styled.div`
  ${tw`text-sm text-gray-700 dark:text-gray-300 font-mono`}
  ${tw`whitespace-pre-wrap break-words overflow-hidden`}
  ${tw`bg-gray-50 dark:bg-gray-900 p-3 rounded-md`}
  ${tw`border border-gray-200 dark:border-gray-700`}
  
  ${({ isCollapsed }) => isCollapsed && `
    max-height: 120px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(to bottom, transparent, rgb(249 250 251));
    }
    
    .dark &::after {
      background: linear-gradient(to bottom, transparent, rgb(17 24 39));
    }
  `}
`;

export const TaskMetadata = styled.div`
  ${tw`flex items-center gap-4 mt-4 pt-4 border-t border-purple-100 dark:border-purple-800`}
`;

export const MetadataItem = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const MetadataIcon = styled.svg`
  ${tw`w-4 h-4 text-purple-500 dark:text-purple-400`}
`;

export const MetadataText = styled.span`
  ${tw`text-xs text-gray-600 dark:text-gray-400`}
`;

export const FilesSection = styled.div`
  ${tw`mt-4`}
`;

export const FilesHeader = styled.div`
  ${tw`flex items-center gap-2 mb-2`}
`;

export const FilesIcon = styled.svg`
  ${tw`w-4 h-4 text-purple-600 dark:text-purple-400`}
`;

export const FilesLabel = styled.span`
  ${tw`text-sm font-semibold text-purple-700 dark:text-purple-300`}
`;

export const FilesList = styled.ul`
  ${tw`space-y-1`}
`;

export const FileItem = styled.li`
  ${tw`flex items-center gap-2 text-sm`}
`;

export const FileIcon = styled.svg`
  ${tw`w-3 h-3 text-purple-500 dark:text-purple-400`}
`;

export const FileName = styled.span`
  ${tw`text-gray-700 dark:text-gray-300 font-mono text-xs`}
`;

export const RequirementsSection = styled.div`
  ${tw`mt-4`}
`;

export const RequirementsHeader = styled.div`
  ${tw`flex items-center gap-2 mb-2`}
`;

export const RequirementsIcon = styled.svg`
  ${tw`w-4 h-4 text-purple-600 dark:text-purple-400`}
`;

export const RequirementsLabel = styled.span`
  ${tw`text-sm font-semibold text-purple-700 dark:text-purple-300`}
`;

export const RequirementsList = styled.ul`
  ${tw`space-y-1`}
`;

export const RequirementItem = styled.li`
  ${tw`flex items-start gap-2 text-sm`}
`;

export const CheckIcon = styled.svg`
  ${tw`w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0`}
`;

export const RequirementText = styled.span`
  ${tw`text-gray-700 dark:text-gray-300`}
`;