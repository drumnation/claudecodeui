import * as React from 'react';
import {StyledInput} from '@/shared-components/Input/Input.styles';
import {InputProps} from '@/shared-components/Input/Input.types';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type,
      label,
      error,
      hint,
      size,
      variant,
      icon,
      iconPosition,
      clearable,
      onClear,
      fullWidth,
      ...props
    },
    ref,
  ) => {
    return <StyledInput type={type} ref={ref} {...props} />;
  },
);

Input.displayName = 'Input';
