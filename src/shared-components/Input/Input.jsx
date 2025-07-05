import * as React from 'react';
import { StyledInput } from '@/shared-components/Input/Input.styles';

export const Input = React.forwardRef(({ type, ...props }, ref) => {
  return (
    <StyledInput
      type={type}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';