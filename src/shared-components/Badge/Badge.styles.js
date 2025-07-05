import styled from '@emotion/styled';
import tw from 'twin.macro';

const baseStyles = tw`
  inline-flex
  items-center
  rounded-md
  border
  px-2.5
  py-0.5
  text-xs
  font-semibold
  transition-colors
  focus:outline-none
  focus:ring-2
  focus:ring-offset-2
`;

export const StyledBadge = styled.div`
  ${baseStyles}
  
  ${({ variant }) => {
    switch (variant) {
      case 'secondary':
        return tw`
          border-transparent
          bg-secondary
          text-secondary-foreground
          hover:bg-secondary/80
        `;
      case 'destructive':
        return tw`
          border-transparent
          bg-destructive
          text-destructive-foreground
          shadow
          hover:bg-destructive/80
        `;
      case 'outline':
        return tw`
          text-foreground
        `;
      case 'default':
      default:
        return tw`
          border-transparent
          bg-primary
          text-primary-foreground
          shadow
          hover:bg-primary/80
        `;
    }
  }}
`;