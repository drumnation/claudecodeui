import React from "react";
import { useLogger } from "@kit/logger/react";

export interface ClaudeLogoProps {
  className?: string;
}

const ClaudeLogo: React.FC<ClaudeLogoProps> = ({ className = "w-5 h-5" }) => {
  const logger = useLogger({ scope: 'ClaudeLogo' });

  const handleImageError = () => {
    logger.warn('Claude logo image failed to load', { 
      className,
      imagePath: '/icons/claude-ai-icon.svg'
    });
  };

  return (
    <img 
      src="/icons/claude-ai-icon.svg" 
      alt="Claude" 
      className={className}
      onError={handleImageError}
    />
  );
};

export { ClaudeLogo };