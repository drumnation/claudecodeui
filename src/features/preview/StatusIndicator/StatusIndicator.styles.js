import styled from '@emotion/styled';
import tw from 'twin.macro';

export const StatusBadge = styled.div`
  ${tw`gap-1.5 h-10 px-3 flex items-center border border-gray-300 dark:border-gray-600 rounded-md`}
`;

export const StatusDot = styled.div`
  ${tw`w-2 h-2 rounded-full`}
  ${({ status }) => {
    switch (status) {
      case 'running': return tw`bg-green-500 animate-pulse`;
      case 'starting': return tw`bg-yellow-500`;
      case 'stopping': return tw`bg-orange-500`;
      case 'stopped': return tw`bg-gray-500`;
      case 'error': return tw`bg-red-500`;
      default: return tw`bg-gray-500`;
    }
  }}
`;

export const StatusText = styled.span`
  ${tw`text-sm font-medium`}
`;