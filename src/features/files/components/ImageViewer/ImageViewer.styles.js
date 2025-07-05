import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Overlay = styled.div`
  ${tw`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
`;

export const Modal = styled.div`
  ${tw`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden`}
`;

export const Header = styled.div`
  ${tw`flex items-center justify-between p-4 border-b`}
`;

export const Title = styled.h3`
  ${tw`text-lg font-semibold text-gray-900 dark:text-white`}
`;

export const CloseButton = styled.div`
  ${tw`h-8 w-8 p-0`}
`;

export const Content = styled.div`
  ${tw`p-4 flex justify-center items-center bg-gray-50 dark:bg-gray-900 min-h-[400px]`}
`;

export const Image = styled.img`
  ${tw`max-w-full max-h-[70vh] object-contain rounded-lg shadow-md`}
`;

export const ErrorContainer = styled.div`
  ${tw`text-center text-gray-500 dark:text-gray-400`}
  display: ${props => props.show ? 'block' : 'none'};
`;

export const ErrorMessage = styled.p`
  ${tw`text-sm mt-2`}
`;

export const Footer = styled.div`
  ${tw`p-4 border-t bg-gray-50 dark:bg-gray-800`}
`;

export const FilePath = styled.p`
  ${tw`text-sm text-gray-600 dark:text-gray-400`}
`;