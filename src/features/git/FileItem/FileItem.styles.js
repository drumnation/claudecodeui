import styled from '@emotion/styled';
import tw from 'twin.macro';

export const FileItemContainer = styled.div`
  ${tw`border-b border-gray-200 dark:border-gray-700 last:border-0`}
`;

export const FileItemHeader = styled.div`
  ${tw`flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800`}
`;

export const FileItemCheckbox = styled.input`
  ${tw`mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:checked:bg-blue-600`}
`;

export const FileItemContent = styled.div`
  ${tw`flex items-center flex-1 cursor-pointer`}
`;

export const ExpandButton = styled.div`
  ${tw`mr-2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded`}
`;

export const FilePath = styled.span`
  ${tw`flex-1 text-sm truncate`}
`;

export const StatusBadge = styled.span`
  ${tw`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold border`}
  ${props => {
    switch(props.status) {
      case 'M':
        return tw`bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800`;
      case 'A':
        return tw`bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800`;
      case 'D':
        return tw`bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800`;
      default:
        return tw`bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600`;
    }
  }}
`;

export const DiffContainer = styled.div`
  ${tw`bg-gray-50 dark:bg-gray-900`}
`;

export const DiffControls = styled.div`
  ${tw`flex justify-end p-2 border-b border-gray-200 dark:border-gray-700`}
`;

export const WrapToggleButton = styled.button`
  ${tw`text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`}
`;

export const DiffContent = styled.div`
  ${tw`max-h-96 overflow-y-auto p-2`}
`;

export const DiffLine = styled.div`
  ${tw`font-mono text-xs`}
  ${props => props.wrapText ? tw`whitespace-pre-wrap break-all` : tw`whitespace-pre overflow-x-auto`}
  ${props => {
    if (props.isAddition) return tw`bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300`;
    if (props.isDeletion) return tw`bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300`;
    if (props.isHeader) return tw`bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300`;
    return tw`text-gray-600 dark:text-gray-400`;
  }}
`;