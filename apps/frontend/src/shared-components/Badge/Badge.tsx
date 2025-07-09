import React from 'react';
import {StyledBadge} from '@/shared-components/Badge/Badge.styles';
import {BadgeProps} from '@/shared-components/Badge/Badge.types';

export const Badge: React.FC<BadgeProps> = ({
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
