import styled from '@emotion/styled';
import tw from 'twin.macro';

export const GitPanelContainer = styled.div`
  ${tw`h-full flex flex-col bg-white dark:bg-gray-900`}
`;

export const GitPanelHeader = styled.div`
  ${tw`flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700`}
`;

export const BranchSelectorContainer = styled.div`
  ${tw`relative`}
`;

export const BranchButton = styled.button`
  ${tw`flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors`}
`;

export const BranchDropdown = styled.div`
  ${tw`absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50`}
`;

export const BranchList = styled.div`
  ${tw`py-1 max-h-64 overflow-y-auto`}
`;

export const BranchItem = styled.button`
  ${tw`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700`}
  ${props => props.isActive && tw`bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
  ${props => !props.isActive && tw`text-gray-700 dark:text-gray-300`}
`;

export const RefreshButton = styled.button`
  ${tw`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded`}
  ${props => props.disabled && tw`opacity-50 cursor-not-allowed`}
`;

export const TabContainer = styled.div`
  ${tw`flex border-b border-gray-200 dark:border-gray-700`}
`;

export const TabButton = styled.button`
  ${tw`flex-1 px-4 py-2 text-sm font-medium transition-colors`}
  ${props => props.isActive 
    ? tw`text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400`
    : tw`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`
  }
`;

export const TabContent = styled.div`
  ${tw`flex items-center justify-center gap-2`}
`;

export const CommitSection = styled.div`
  ${tw`px-4 py-3 border-b border-gray-200 dark:border-gray-700`}
`;

export const CommitTextareaContainer = styled.div`
  ${tw`relative`}
`;

export const CommitTextarea = styled.textarea`
  ${tw`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 resize-none pr-20`}
  &:focus {
    ${tw`outline-none ring-2 ring-blue-500`}
  }
`;

export const CommitButtonGroup = styled.div`
  ${tw`absolute right-2 top-2 flex gap-1`}
`;

export const CommitActionsContainer = styled.div`
  ${tw`flex items-center justify-between mt-2`}
`;

export const FileCountText = styled.span`
  ${tw`text-xs text-gray-500`}
`;

export const CommitButton = styled.button`
  ${tw`px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1`}
  ${props => props.disabled && tw`opacity-50 cursor-not-allowed`}
`;

export const FileSelectionBar = styled.div`
  ${tw`px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between`}
`;

export const FileSelectionText = styled.span`
  ${tw`text-xs text-gray-600 dark:text-gray-400`}
`;

export const SelectionActions = styled.div`
  ${tw`flex gap-2`}
`;

export const SelectionButton = styled.button`
  ${tw`text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300`}
`;

export const Divider = styled.span`
  ${tw`text-gray-300 dark:text-gray-600`}
`;

export const LegendToggle = styled.div`
  ${tw`border-b border-gray-200 dark:border-gray-700`}
`;

export const LegendButton = styled.button`
  ${tw`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1`}
`;

export const LegendContent = styled.div`
  ${tw`px-4 py-3 bg-gray-50 dark:bg-gray-800 text-xs`}
`;

export const LegendGrid = styled.div`
  ${props => props.isMobile 
    ? tw`grid grid-cols-2 gap-3 justify-items-center`
    : tw`flex justify-center gap-6`
  }
`;

export const LegendItem = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const StatusBadge = styled.span`
  ${tw`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-xs border`}
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

export const FileListContainer = styled.div`
  ${tw`flex-1 overflow-y-auto`}
  ${props => props.isMobile && tw`pb-20`}
`;

export const EmptyStateContainer = styled.div`
  ${tw`flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400`}
`;

export const EmptyStateIcon = styled.div`
  ${tw`w-12 h-12 mb-2 opacity-50`}
`;

export const EmptyStateText = styled.p`
  ${tw`text-sm`}
`;

export const LoadingContainer = styled.div`
  ${tw`flex items-center justify-center h-32`}
`;

export const Modal = styled.div`
  ${tw`fixed inset-0 z-50 flex items-center justify-center p-4`}
`;

export const ModalBackdrop = styled.div`
  ${tw`fixed inset-0 bg-black bg-opacity-50`}
`;

export const ModalContent = styled.div`
  ${tw`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full`}
`;

export const ModalBody = styled.div`
  ${tw`p-6`}
`;

export const ModalTitle = styled.h3`
  ${tw`text-lg font-semibold mb-4`}
`;

export const ModalActions = styled.div`
  ${tw`flex justify-end space-x-3`}
`;

export const ModalInput = styled.input`
  ${tw`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700`}
  &:focus {
    ${tw`outline-none ring-2 ring-blue-500`}
  }
`;

export const ModalHelpText = styled.div`
  ${tw`text-xs text-gray-500 dark:text-gray-400 mb-4`}
`;

export const IconButton = styled.button`
  ${tw`p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`}
  ${props => props.disabled && tw`opacity-50 cursor-not-allowed`}
`;