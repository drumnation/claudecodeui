import styled from '@emotion/styled';
import tw from 'twin.macro';

export const SessionsWrapper = styled.div`
  ${tw`space-y-1`}
`;

export const LoadingSkeletons = styled.div`
  ${tw`space-y-1`}
`;

export const SessionSkeleton = styled.div`
  ${tw`p-2 rounded-md`}
`;

export const SkeletonContent = styled.div`
  ${tw`flex items-start gap-2`}
`;

export const SkeletonDot = styled.div`
  ${tw`w-3 h-3 bg-muted rounded-full animate-pulse mt-0.5`}
`;

export const SkeletonBars = styled.div`
  ${tw`flex-1 space-y-1`}
`;

export const SkeletonBar = styled.div`
  ${tw`h-3 bg-muted rounded animate-pulse`}
  ${props => props.width && `width: ${props.width};`}
`;

export const SkeletonBarSmall = styled.div`
  ${tw`h-2 bg-muted rounded animate-pulse w-1/2`}
`;

export const EmptyState = styled.div`
  ${tw`py-2 px-3 text-left`}
`;

export const EmptyText = styled.p`
  ${tw`text-xs text-muted-foreground`}
`;

export const LoadMoreButton = styled.div`
  ${tw`w-full mt-2`}
`;

export const LoadMoreContent = styled.div`
  ${tw`flex items-center justify-center gap-2`}
`;

export const Spinner = styled.div`
  ${tw`w-3 h-3 animate-spin rounded-full border border-muted-foreground border-t-transparent`}
`;

export const NewSessionMobile = styled.div`
  ${tw`md:hidden px-3 pb-2`}
`;

export const NewSessionButton = styled.button`
  ${tw`w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md flex items-center justify-center gap-2 font-medium text-xs active:scale-[0.98] transition-all duration-150`}
`;