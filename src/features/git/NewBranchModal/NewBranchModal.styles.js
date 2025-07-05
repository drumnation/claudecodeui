import styled from '@emotion/styled';
import tw from 'twin.macro';

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

export const ModalLabel = styled.label`
  ${tw`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2`}
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

export const ModalActions = styled.div`
  ${tw`flex justify-end space-x-3`}
`;

export const CancelButton = styled.button`
  ${tw`px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md`}
`;

export const CreateButton = styled.button`
  ${tw`px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2`}
  ${props => props.disabled && tw`opacity-50 cursor-not-allowed`}
`;