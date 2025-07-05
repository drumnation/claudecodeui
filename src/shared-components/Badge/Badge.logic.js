// Badge business logic
// Empty for now - add logic functions as needed

export const BADGE_VARIANTS = {
  DEFAULT: 'default',
  SECONDARY: 'secondary',
  DESTRUCTIVE: 'destructive',
  OUTLINE: 'outline',
};

export const isValidVariant = (variant) => {
  return Object.values(BADGE_VARIANTS).includes(variant);
};