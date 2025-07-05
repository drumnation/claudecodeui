export const getSessionCountDisplay = (sessions, hasMore) => {
  const count = sessions.length;
  const displayCount = hasMore && count >= 5 ? `${count}+` : count;
  return `${displayCount} session${displayCount === 1 ? '' : 's'}`;
};

export const shouldShowDeleteButton = (sessionCount) => {
  return sessionCount === 0;
};

export const getProjectIconColor = (hasActiveSession, isExpanded) => {
  if (hasActiveSession) {
    return 'text-green-600 dark:text-green-500';
  }
  if (isExpanded) {
    return 'text-primary';
  }
  return 'text-muted-foreground';
};