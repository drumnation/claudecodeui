export const getLoadingSkeletonCount = () => {
  return 3;
};

export const shouldShowLoadMore = (sessions: any, hasMore: any) => {
  return sessions.length > 0 && hasMore;
};

export const shouldShowNewSessionButton = (sessions: any) => {
  return sessions.length >= 0;
};
