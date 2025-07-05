export const isSessionActive = (lastActivity, currentTime) => {
  const sessionDate = new Date(lastActivity);
  const diffInMinutes = Math.floor((currentTime - sessionDate) / (1000 * 60));
  return diffInMinutes < 10;
};

export const getSessionIconColor = (isSelected, isActive) => {
  if (isSelected) return 'text-primary';
  if (isActive) return 'text-green-600 dark:text-green-500';
  return 'text-muted-foreground';
};

export const getSessionBorderColor = (isSelected, isActive) => {
  if (isSelected) return 'border-primary/20';
  if (isActive) return 'border-green-500/30';
  return 'border-border/30';
};

export const getSessionBackgroundColor = (isSelected, isActive) => {
  if (isSelected) return 'bg-primary/5';
  if (isActive) return 'bg-green-50/5 dark:bg-green-900/5';
  return '';
};