import React, {useState} from 'react';
import {useLogger} from '@kit/logger/react';
import {Input} from '@/shared-components/Input/Input';
import {Button} from '@/shared-components/Button/Button';
import {FolderPlus, X, FolderOpen, Edit3} from 'lucide-react';
import {DirectoryBrowser} from './DirectoryBrowser';
import * as S from './NewProjectModal.styles';
import {NewProjectModalProps} from './NewProjectModal.types';

export const NewProjectModal = ({
  newProjectPath,
  setNewProjectPath,
  creatingProject,
  onCreateProject,
  onCancel,
}: NewProjectModalProps) => {
  const logger = useLogger({component: 'NewProjectModal'});
  const [useBrowser, setUseBrowser] = useState(false);

  React.useEffect(() => {
    logger.debug('Modal opened');
    return () => {
      logger.debug('Modal closed');
    };
  }, []);

  const handlePathSelect = (path: string) => {
    setNewProjectPath(path);
    setUseBrowser(false);
  };

  const toggleInputMode = () => {
    setUseBrowser(!useBrowser);
  };

  return (
    <S.Container>
      {/* Desktop Form */}
      <S.DesktopForm>
        <S.FormHeader>
          <FolderPlus className="w-4 h-4" />
          Create New Project
          <div className="ml-auto flex gap-1">
            <Button
              size="sm"
              variant={useBrowser ? 'default' : 'outline'}
              onClick={toggleInputMode}
              className="h-6 px-2 text-xs"
            >
              <FolderOpen className="w-3 h-3 mr-1" />
              Browse
            </Button>
            <Button
              size="sm"
              variant={!useBrowser ? 'default' : 'outline'}
              onClick={toggleInputMode}
              className="h-6 px-2 text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Type
            </Button>
          </div>
        </S.FormHeader>

        {useBrowser ? (
          <DirectoryBrowser
            onSelectPath={handlePathSelect}
            selectedPath={newProjectPath}
          />
        ) : (
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
        )}

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
      <S.MobileOverlay
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
      >
        <S.MobileModal
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logger.debug('Close button clicked');
                onCancel();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled={creatingProject}
            >
              <X className="w-3 h-3" />
            </S.MobileCloseButton>
          </S.MobileHeader>

          <S.MobileFormContent>
            {/* Mobile mode toggle */}
            <div className="flex gap-1 mb-3">
              <Button
                size="sm"
                variant={useBrowser ? 'default' : 'outline'}
                onClick={toggleInputMode}
                className="flex-1 h-7 text-xs"
              >
                <FolderOpen className="w-3 h-3 mr-1" />
                Browse
              </Button>
              <Button
                size="sm"
                variant={!useBrowser ? 'default' : 'outline'}
                onClick={toggleInputMode}
                className="flex-1 h-7 text-xs"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Type
              </Button>
            </div>

            {useBrowser ? (
              <DirectoryBrowser
                onSelectPath={handlePathSelect}
                selectedPath={newProjectPath}
              />
            ) : (
              <Input
                value={newProjectPath}
                onChange={(e) => setNewProjectPath(e.target.value)}
                placeholder="/path/to/project or relative/path"
                className="text-sm h-10 rounded-md focus:border-primary transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onCreateProject();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancel();
                  }
                }}
              />
            )}

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
