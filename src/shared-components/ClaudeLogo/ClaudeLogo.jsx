import React from 'react';
import { StyledLogo } from '@/shared-components/ClaudeLogo/ClaudeLogo.styles';
import { useClaudeLogo } from '@/shared-components/ClaudeLogo/ClaudeLogo.hook';

export const ClaudeLogo = ({ size = 'medium', className, ...props }) => {
  const { logoSize } = useClaudeLogo(size);
  
  return (
    <StyledLogo 
      src="/icons/claude-ai-icon.svg" 
      alt="Claude" 
      size={logoSize}
      className={className}
      {...props}
    />
  );
};