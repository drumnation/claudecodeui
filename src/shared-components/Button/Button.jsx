import React, { forwardRef } from 'react';
import { StyledButton } from '@/shared-components/Button/Button.styles';
import { getButtonProps, DEFAULT_VARIANT, DEFAULT_SIZE } from '@/shared-components/Button/Button.logic';
import { useButton } from '@/shared-components/Button/Button.hook';

export const Button = forwardRef(
  (
    {
      children,
      variant = DEFAULT_VARIANT,
      size = DEFAULT_SIZE,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    const { handleClick } = useButton();
    const buttonProps = getButtonProps({ variant, size, className, ...props });

    return (
      <StyledButton
        ref={ref}
        variant={buttonProps.variant}
        size={buttonProps.size}
        onClick={(e) => handleClick(onClick, e)}
        className={className}
        {...props}
      >
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';