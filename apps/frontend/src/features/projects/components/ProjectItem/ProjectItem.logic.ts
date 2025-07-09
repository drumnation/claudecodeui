export const getSessionCountDisplay = (sessions: any, hasMore: any) => {
  const count = sessions.length;
  const displayCount = hasMore && count >= 5 ? `${count}+` : count;
  return `${displayCount} session${displayCount === 1 ? '' : 's'}`;
};

export const shouldShowDeleteButton = (sessionCount: any) => {
  return sessionCount === 0;
};

export const getProjectIconColor = (hasActiveSession: any, isExpanded: any) => {
  if (hasActiveSession) {
    return 'text-green-600 dark:text-green-500';
  }
  if (isExpanded) {
    return 'text-primary';
  }
  return 'text-muted-foreground';
};
