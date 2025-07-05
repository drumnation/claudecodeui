export const getLoadingSkeletonCount = () => {
  return 3;
};

export const shouldShowLoadMore = (sessions, hasMore) => {
  return sessions.length > 0 && hasMore;
};

export const shouldShowNewSessionButton = (sessions) => {
  return sessions.length >= 0;
};