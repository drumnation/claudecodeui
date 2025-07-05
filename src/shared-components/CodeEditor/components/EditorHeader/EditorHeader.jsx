import React from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import {
  Header,
  HeaderLeft,
  FileIcon,
  FileIconText,
  FileInfo,
  FileNameRow,
  FileName,
  DiffBadge,
  FilePath,
  HeaderActions,
  IconButton,
  ThemeToggle,
  ThemeIcon
} from '@/shared-components/CodeEditor/components/EditorHeader/EditorHeader.styles';

export const EditorHeader = ({ 
  file, 
  showDiff, 
  isDarkMode,
  onToggleDiff,
  onToggleTheme,
  onClose,
  children 
}) => {
  const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <Header>
      <HeaderLeft>
        <FileIcon>
          <FileIconText>{fileExtension}</FileIconText>
        </FileIcon>
        <FileInfo>
          <FileNameRow>
            <FileName>{file.name}</FileName>
            {file.diffInfo && (
              <DiffBadge>📝 Has changes</DiffBadge>
            )}
          </FileNameRow>
          <FilePath>{file.path}</FilePath>
        </FileInfo>
      </HeaderLeft>
      
      <HeaderActions>
        {file.diffInfo && (
          <IconButton
            onClick={onToggleDiff}
            title={showDiff ? "Hide diff highlighting" : "Show diff highlighting"}
          >
            {showDiff ? <EyeOff className="w-5 h-5 md:w-4 md:h-4" /> : <Eye className="w-5 h-5 md:w-4 md:h-4" />}
          </IconButton>
        )}
        
        <ThemeToggle onClick={onToggleTheme} title="Toggle theme">
          <ThemeIcon>{isDarkMode ? '☀️' : '🌙'}</ThemeIcon>
        </ThemeToggle>
        
        {children}
        
        <IconButton onClick={onClose} title="Close">
          <X className="w-6 h-6 md:w-4 md:h-4" />
        </IconButton>
      </HeaderActions>
    </Header>
  );
};