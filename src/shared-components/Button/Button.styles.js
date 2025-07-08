import styled from '@emotion/styled';
import tw from 'twin.macro';

// Base button styles
const baseStyles = tw`
  inline-flex
  items-center
  justify-center
  gap-2
  whitespace-nowrap
  rounded-md
  text-sm
  font-medium
  transition-colors
  focus-visible:outline-none
  focus-visible:ring-1
  focus-visible:ring-ring
  disabled:pointer-events-none
  disabled:opacity-50
  [&_svg]:pointer-events-none
  [&_svg]:size-4
  [&_svg]:shrink-0
`;

// Variant styles - support both Tailwind and Emotion themes
const variantStyles = {
  default: (theme) => theme ? `
    background-color: ${theme.colors?.primary || '#3b82f6'};
    color: white;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    &:hover {
      background-color: ${theme.colors?.primaryDark || '#2563eb'};
    }
  ` : tw`
    bg-primary
    text-primary-foreground
    shadow
    hover:bg-primary/90
  `,
  destructive: (theme) => theme ? `
    background-color: ${theme.colors?.error || '#ef4444'};
    color: white;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    &:hover {
      background-color: #dc2626;
    }
  ` : tw`
    bg-destructive
    text-destructive-foreground
    shadow-sm
    hover:bg-destructive/90
  `,
  outline: (theme) => theme ? `
    border: 1px solid ${theme.colors?.border || '#e5e7eb'};
    background-color: ${theme.colors?.background || '#ffffff'};
    color: ${theme.colors?.text || '#111827'};
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    &:hover {
      background-color: ${theme.colors?.surface || '#f9fafb'};
    }
  ` : tw`
    border
    border-input
    bg-background
    shadow-sm
    hover:bg-accent
    hover:text-accent-foreground
  `,
  secondary: (theme) => theme ? `
    background-color: ${theme.colors?.surface || '#f9fafb'};
    color: ${theme.colors?.text || '#111827'};
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    &:hover {
      background-color: ${theme.colors?.border || '#e5e7eb'};
    }
  ` : tw`
    bg-secondary
    text-secondary-foreground
    shadow-sm
    hover:bg-secondary/80
  `,
  ghost: (theme) => theme ? `
    color: ${theme.colors?.text || '#111827'};
    &:hover {
      background-color: ${theme.colors?.surface || '#f9fafb'};
    }
  ` : tw`
    hover:bg-accent
    hover:text-accent-foreground
  `,
  link: (theme) => theme ? `
    color: ${theme.colors?.primary || '#3b82f6'};
    text-decoration-line: underline;
    text-underline-offset: 4px;
    &:hover {
      text-decoration: none;
    }
  ` : tw`
    text-primary
    underline-offset-4
    hover:underline
  `,
};

// Size styles
const sizeStyles = {
  default: tw`h-9 px-4 py-2`,
  small: tw`h-8 rounded-md px-3 text-xs`,
  sm: tw`h-8 rounded-md px-3 text-xs`,
  lg: tw`h-10 rounded-md px-8`,
  icon: tw`h-9 w-9`,
};

// Styled button component
export const StyledButton = styled.button`
  ${baseStyles}
  
  /* Apply variant styles */
  ${({ variant = 'default', theme }) => {
    const variantFn = variantStyles[variant];
    return typeof variantFn === 'function' ? variantFn(theme) : variantFn;
  }}
  
  /* Apply size styles */
  ${({ size = 'default' }) => sizeStyles[size]}
  
  /* Apply any additional custom styles */
  ${({ customStyles }) => customStyles}
`;