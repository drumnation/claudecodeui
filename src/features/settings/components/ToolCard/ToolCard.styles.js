import styled from '@emotion/styled';
import tw from 'twin.macro';
import { Button } from '@/shared-components/Button';
import { X } from 'lucide-react';

export const ToolItem = styled.div`
  ${tw`flex items-center justify-between px-3 py-2 rounded-lg`}
  ${({ $variant }) => $variant === 'allowed' 
    ? tw`bg-green-50 dark:bg-green-900/20` 
    : tw`bg-red-50 dark:bg-red-900/20`}
`;

export const ToolName = styled.span`
  ${tw`text-sm font-medium`}
  ${({ $variant }) => $variant === 'allowed' 
    ? tw`text-green-700 dark:text-green-300` 
    : tw`text-red-700 dark:text-red-300`}
`;

export const RemoveButton = styled(Button)`
  ${({ $variant }) => $variant === 'allowed' 
    ? tw`text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300` 
    : tw`text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300`}
`;

export const RemoveIcon = styled(X)`
  ${tw`w-4 h-4`}
`;