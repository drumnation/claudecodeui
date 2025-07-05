import styled from '@emotion/styled';
import tw from 'twin.macro';

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

export const IconButton = styled.button`
  ${tw`p-2 md:p-2 rounded-md`}
  ${tw`text-gray-600 dark:text-gray-400`}
  ${tw`hover:text-gray-900 dark:hover:text-white`}
  ${tw`hover:bg-gray-100 dark:hover:bg-gray-800`}
  ${tw`min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0`}
  ${tw`flex items-center justify-center`}
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