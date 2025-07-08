import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';
import { GitBranch, Box } from 'lucide-react';

// Desktop badge - inline with project metadata
const Badge = styled.span`
  ${tw`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium
       bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}
`;

// Mobile micro badge - absolute positioned
const MicroBadge = styled.span`
  ${tw`absolute top-1 right-1 bg-yellow-100 text-yellow-800 
       dark:bg-yellow-900 dark:text-yellow-200
       rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold`}
`;

// Language badge styling
const LanguageBadge = styled.span`
  ${tw`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium
       bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}
`;

// Monorepo badge styling
const MonorepoBadge = styled.span`
  ${tw`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium
       bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`}
`;

export const WorktreeBadge = ({ branch, isMobile = false }) => {
  const title = branch ? `Worktree branch: ${branch}` : 'Git Worktree';
  
  if (isMobile) {
    return (
      <MicroBadge title={title}>
        <GitBranch className="w-3 h-3" />
      </MicroBadge>
    );
  }
  
  return (
    <Badge title={title}>
      <GitBranch className="w-3 h-3" />
    </Badge>
  );
};

export const ProjectLanguageBadge = ({ language }) => {
  // Always show language badge for debugging
  if (!language) return null;
  
  // Shorten language names for badges
  const displayLanguage = language
    .replace('JavaScript/TypeScript', 'JS/TS')
    .replace('Dart/Flutter', 'Flutter')
    .replace('Java/Kotlin', 'Java')
    .replace('C#/.NET', '.NET')
    .replace('Documentation', 'Docs')
    .replace('TypeScript', 'TS')
    .replace('JavaScript', 'JS')
    .replace('Python', 'Py');
  
  // Use different color for certain types
  if (language === 'Logs' || language === 'Documentation') {
    return (
      <LanguageBadge 
        title={`Type: ${language}`}
        style={{ 
          backgroundColor: 'var(--gray-100)', 
          color: 'var(--gray-800)',
          opacity: 0.8 
        }}
      >
        {displayLanguage}
      </LanguageBadge>
    );
  }
  
  return (
    <LanguageBadge title={`Language: ${language}`}>
      {displayLanguage}
    </LanguageBadge>
  );
};

export const ProjectMonorepoBadge = ({ isMonorepo }) => {
  if (!isMonorepo) return null;
  
  return (
    <MonorepoBadge title="Part of a monorepo">
      <Box className="w-3 h-3" />
    </MonorepoBadge>
  );
};