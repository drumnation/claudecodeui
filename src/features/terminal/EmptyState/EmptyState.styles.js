import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`h-full flex items-center justify-center`}
`;

export const Content = styled.div`
  ${tw`text-center text-gray-500 dark:text-gray-400`}
`;

export const IconWrapper = styled.div`
  ${tw`w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center`}
`;

export const Icon = styled.svg`
  ${tw`w-8 h-8 text-gray-400`}
`;

export const Title = styled.h3`
  ${tw`text-lg font-semibold mb-2`}
`;

export const Description = styled.p`
  ${tw``}
`;