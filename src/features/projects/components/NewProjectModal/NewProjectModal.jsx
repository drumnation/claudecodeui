import React from 'react';
import { Input } from '@/shared-components/Input/Input';
import { Button } from '@/shared-components/Button/Button';
import { FolderPlus, X } from 'lucide-react';
import * as S from './NewProjectModal.styles';

export const NewProjectModal = ({
  newProjectPath,
  setNewProjectPath,
  creatingProject,
  onCreateProject,
  onCancel
}) => {
  return (
    <S.Container>
      {/* Desktop Form */}
      <S.DesktopForm>
        <S.FormHeader>
          <FolderPlus className="w-4 h-4" />
          Create New Project
        </S.FormHeader>
        <Input
          value={newProjectPath}
          onChange={(e) => setNewProjectPath(e.target.value)}
          placeholder="/path/to/project or relative/path"
          className="text-sm focus:ring-2 focus:ring-primary/20"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCreateProject();
            if (e.key === 'Escape') onCancel();
          }}
        />
        <S.FormActions>
          <Button
            size="sm"
            onClick={onCreateProject}
            disabled={!newProjectPath.trim() || creatingProject}
            className="flex-1 h-8 text-xs hover:bg-primary/90 transition-colors"
          >
            {creatingProject ? 'Creating...' : 'Create Project'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={creatingProject}
            className="h-8 text-xs hover:bg-accent transition-colors"
          >
            Cancel
          </Button>
        </S.FormActions>
      </S.DesktopForm>
      
      {/* Mobile Form - Simple Overlay */}
      <S.MobileOverlay>
        <S.MobileModal>
          <S.MobileHeader>
            <S.MobileHeaderContent>
              <S.MobileIconWrapper>
                <FolderPlus className="w-3 h-3 text-primary" />
              </S.MobileIconWrapper>
              <div>
                <S.MobileTitle>New Project</S.MobileTitle>
              </div>
            </S.MobileHeaderContent>
            <S.MobileCloseButton
              onClick={onCancel}
              disabled={creatingProject}
            >
              <X className="w-3 h-3" />
            </S.MobileCloseButton>
          </S.MobileHeader>
          
          <S.MobileFormContent>
            <Input
              value={newProjectPath}
              onChange={(e) => setNewProjectPath(e.target.value)}
              placeholder="/path/to/project or relative/path"
              className="text-sm h-10 rounded-md focus:border-primary transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCreateProject();
                if (e.key === 'Escape') onCancel();
              }}
            />
            
            <S.MobileActions>
              <Button
                onClick={onCancel}
                disabled={creatingProject}
                variant="outline"
                className="flex-1 h-9 text-sm rounded-md active:scale-95 transition-transform"
              >
                Cancel
              </Button>
              <Button
                onClick={onCreateProject}
                disabled={!newProjectPath.trim() || creatingProject}
                className="flex-1 h-9 text-sm rounded-md bg-primary hover:bg-primary/90 active:scale-95 transition-all"
              >
                {creatingProject ? 'Creating...' : 'Create'}
              </Button>
            </S.MobileActions>
          </S.MobileFormContent>
          
          <S.SafeArea />
        </S.MobileModal>
      </S.MobileOverlay>
    </S.Container>
  );
};