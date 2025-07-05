import styled from '@emotion/styled';
import tw from 'twin.macro';

export const ScrollAreaContainer = styled.div`
  ${tw`relative overflow-hidden`}
`;

export const ScrollAreaViewport = styled.div`
  ${tw`h-full w-full rounded-[inherit] overflow-auto`}
`;

export const ScrollAreaScrollbar = styled.div`
  ${tw`absolute right-0 top-0 h-full w-2.5 transition-opacity`}
  ${({ $show }) => ($show ? tw`opacity-100` : tw`opacity-0`)}
`;

export const ScrollAreaThumb = styled.div`
  ${tw`relative w-full bg-gray-400 rounded-full transition-colors hover:bg-gray-500`}
  ${({ $height }) => `height: ${$height}%;`}
  ${({ $top }) => `top: ${$top}%;`}
`;