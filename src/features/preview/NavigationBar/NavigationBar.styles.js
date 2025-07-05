import styled from '@emotion/styled';
import tw from 'twin.macro';

export const NavigationContainer = styled.div`
  ${tw`flex items-center gap-2 p-2`}
`;

export const UrlForm = styled.form`
  ${tw`flex-1 flex gap-2`}
`;

export const UrlInput = styled.input`
  ${tw`
    flex h-8 w-full rounded-md border border-input bg-card dark:bg-gray-700 
    px-3 py-1 text-sm shadow-sm transition-colors 
    placeholder:text-muted-foreground 
    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
    disabled:cursor-not-allowed disabled:opacity-50 
    dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500
  `}
`;