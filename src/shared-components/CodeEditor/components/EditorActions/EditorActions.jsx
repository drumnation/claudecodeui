import React from 'react';
import { Download, Save, Maximize2, Minimize2 } from 'lucide-react';
import {
  ActionsContainer,
  IconButton,
  SaveButton,
  CheckIcon,
  ButtonText,
  FullscreenButton
} from '@/shared-components/CodeEditor/components/EditorActions/EditorActions.styles';

export const EditorActions = ({
  saving,
  saveSuccess,
  isFullscreen,
  onSave,
  onDownload,
  onToggleFullscreen
}) => {
  return (
    <ActionsContainer>
      <IconButton
        onClick={onDownload}
        title="Download file"
      >
        <Download className="w-5 h-5 md:w-4 md:h-4" />
      </IconButton>
      
      <SaveButton
        onClick={onSave}
        disabled={saving}
        success={saveSuccess}
      >
        {saveSuccess ? (
          <>
            <CheckIcon 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </CheckIcon>
            <ButtonText>Saved!</ButtonText>
          </>
        ) : (
          <>
            <Save className="w-5 h-5 md:w-4 md:h-4" />
            <ButtonText>{saving ? 'Saving...' : 'Save'}</ButtonText>
          </>
        )}
      </SaveButton>
      
      <FullscreenButton
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? 
          <Minimize2 className="w-4 h-4" /> : 
          <Maximize2 className="w-4 h-4" />
        }
      </FullscreenButton>
    </ActionsContainer>
  );
};