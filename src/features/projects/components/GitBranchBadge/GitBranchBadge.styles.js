import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Badge = styled.span`
  ${tw`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border`}
  
  ${props => props.variant === 'modified' && tw`
    bg-amber-50 text-amber-700 border-amber-200
    dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800
  `}
  
  ${props => props.variant === 'untracked' && tw`
    bg-blue-50 text-blue-700 border-blue-200
    dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800
  `}
  
  ${props => props.variant === 'default' && tw`
    bg-emerald-50 text-emerald-700 border-emerald-200
    dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800
  `}
`;

export const Icon = styled.span`
  ${tw`flex-shrink-0`}
`;

export const Text = styled.span`
  ${tw`truncate max-w-40`}
`;