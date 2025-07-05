import styled from '@emotion/styled';
import tw from 'twin.macro';

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