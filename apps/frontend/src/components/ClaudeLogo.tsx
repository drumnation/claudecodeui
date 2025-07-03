import React from "react";

export interface ClaudeLogoProps {
  className?: string;
}

const ClaudeLogo: React.FC<ClaudeLogoProps> = ({ className = "w-5 h-5" }) => {
  return (
    <img src="/icons/claude-ai-icon.svg" alt="Claude" className={className} />
  );
};

export { ClaudeLogo };
