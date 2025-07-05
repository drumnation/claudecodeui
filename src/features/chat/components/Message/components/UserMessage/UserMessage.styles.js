import styled from '@emotion/styled';
import tw from 'twin.macro';

export const UserMessageContainer = styled.div`
  ${tw`flex items-end space-x-0 sm:space-x-3 w-full sm:w-auto sm:max-w-[85%] md:max-w-md lg:max-w-lg xl:max-w-xl`}
`;

export const UserMessageBubble = styled.div`
  ${tw`bg-blue-600 text-white rounded-2xl rounded-br-md px-3 sm:px-4 py-2 shadow-sm flex-1 sm:flex-initial`}
`;

export const UserMessageText = styled.div`
  ${tw`text-sm whitespace-pre-wrap break-words`}
`;

export const UserMessageTime = styled.div`
  ${tw`text-xs text-blue-100 mt-1 text-right`}
`;

export const UserAvatar = styled.img`
  ${tw`hidden sm:block w-8 h-8 rounded-full object-cover flex-shrink-0`}
`;