import styled from '@emotion/styled';
import tw from 'twin.macro';
import { Button } from '@/shared-components/Button';
import { Plus } from 'lucide-react';

export const ToolInputWrapper = styled.div`
  ${tw`flex gap-2 items-center`}
`;

export const ToolInput = styled.input`
  ${tw`flex-1 h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
`;

export const AddButton = styled(Button)`
  ${tw`h-10 px-4 touch-manipulation`}
`;

export const PlusIcon = styled(Plus)`
  ${tw`w-4 h-4 mr-2 sm:mr-0`}
`;

export const ButtonText = styled.span`
  ${tw`sm:hidden`}
`;