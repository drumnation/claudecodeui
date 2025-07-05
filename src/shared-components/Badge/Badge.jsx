import React from 'react';
import { StyledBadge } from '@/shared-components/Badge/Badge.styles';

export const Badge = ({ 
  variant = 'default',
  children,
  ...props 
}) => {
  return (
    <StyledBadge variant={variant} {...props}>
      {children}
    </StyledBadge>
  );
};