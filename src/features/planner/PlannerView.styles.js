import styled from '@emotion/styled';
import tw from 'twin.macro';

export const Container = styled.div`
  ${tw`flex flex-col h-full bg-background dark:bg-gray-900`}
`;

export const Header = styled.div`
  ${tw`flex items-center justify-between px-4 py-3 border-b border-border dark:border-gray-700`}
`;

export const HeaderContent = styled.div`
  ${tw`flex items-center gap-2`}
`;

export const HeaderIcon = styled.div`
  ${tw`w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center`}
`;

export const HeaderTitle = styled.h1`
  ${tw`text-lg font-bold tracking-wider`}
`;

export const TabBar = styled.div`
  ${tw`flex border-b border-border dark:border-gray-700`}
`;

export const Tab = styled.button`
  ${tw`flex-1 py-3 text-sm font-medium transition-colors relative`}
  ${({ active }) => active 
    ? tw`text-foreground` 
    : tw`text-muted-foreground hover:text-foreground`
  }
  
  ${({ active }) => active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--primary);
    }
  `}
`;

export const Content = styled.div`
  ${tw`flex-1 overflow-hidden`}
`;

export const WelcomeScreen = styled.div`
  ${tw`flex flex-col items-center justify-center h-full px-8 text-center`}
`;

export const WelcomeIcon = styled.div`
  ${tw`mb-6`}
`;

export const WelcomeTitle = styled.h2`
  ${tw`text-2xl font-semibold mb-2`}
`;

export const WelcomeDescription = styled.p`
  ${tw`text-muted-foreground mb-8 max-w-md`}
`;

export const NewTaskSection = styled.div`
  ${tw`w-full max-w-sm`}
`;

export const NewTaskLabel = styled.div`
  ${tw`text-sm font-medium mb-3`}
`;

export const NewTaskActions = styled.div`
  ${tw`flex items-center justify-center gap-2`}
`;

export const EmptyState = styled.div`
  ${tw`flex flex-col items-center justify-center h-full`}
`;

export const EmptyTitle = styled.h3`
  ${tw`text-xl font-semibold mb-2`}
`;

export const EmptyDescription = styled.p`
  ${tw`text-muted-foreground`}
`;