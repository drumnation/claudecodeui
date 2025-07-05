// Button variants configuration
export const BUTTON_VARIANTS = {
  default: 'default',
  destructive: 'destructive',
  outline: 'outline',
  secondary: 'secondary',
  ghost: 'ghost',
  link: 'link',
};

// Button sizes configuration
export const BUTTON_SIZES = {
  default: 'default',
  sm: 'sm',
  lg: 'lg',
  icon: 'icon',
};

// Default values
export const DEFAULT_VARIANT = BUTTON_VARIANTS.default;
export const DEFAULT_SIZE = BUTTON_SIZES.default;

// Helper function to get button props
export const getButtonProps = ({ variant, size, className, ...props }) => {
  return {
    variant: variant || DEFAULT_VARIANT,
    size: size || DEFAULT_SIZE,
    className,
    ...props,
  };
};