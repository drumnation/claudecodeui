import React from 'react';
import {Input} from '@/shared-components/Input/Input';
import {Button} from '@/shared-components/Button/Button';
import {GitBranch, X} from 'lucide-react';
import {
  validateFeatureName,
  isCreateButtonDisabled,
} from './WorktreeModal.logic';
import * as S from './WorktreeModal.styles';
import {WorktreeModalProps} from './WorktreeModal.types';

export const WorktreeModal = ({
  featureName,
  setFeatureName,
  creatingWorktree,
  onCreateWorktree,
  onCancel,
  project,
}: WorktreeModalProps) => {
  const validation = validateFeatureName(featureName);
  const isDisabled = isCreateButtonDisabled(featureName, creatingWorktree);

  return (
    <S.Container>
      {/* Desktop Form */}
      <S.DesktopForm>
        <S.FormHeader>
          <GitBranch className="w-4 h-4" />
          Create Worktree for {project?.name}
        </S.FormHeader>

        <Input
          value={featureName}
          onChange={(e) => setFeatureName(e.target.value)}
          placeholder="feature-branch-name"
          className="text-sm focus:ring-2 focus:ring-primary/20"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isDisabled) onCreateWorktree();
            if (e.key === 'Escape') onCancel();
          }}
        />

        {!validation.isValid && featureName && (
          <div className="text-xs text-destructive">{validation.error}</div>
        )}

        <S.FormActions>
          <Button
            size="sm"
            onClick={onCreateWorktree}
            disabled={isDisabled}
            className="flex-1 h-8 text-xs hover:bg-primary/90 transition-colors"
          >
            {creatingWorktree ? 'Creating...' : 'Create Worktree'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={creatingWorktree}
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
                <GitBranch className="w-3 h-3 text-primary" />
              </S.MobileIconWrapper>
              <div>
                <S.MobileTitle>New Worktree</S.MobileTitle>
                <div className="text-xs text-muted-foreground">
                  {project?.name}
                </div>
              </div>
            </S.MobileHeaderContent>
            <S.MobileCloseButton onClick={onCancel} disabled={creatingWorktree}>
              <X className="w-3 h-3" />
            </S.MobileCloseButton>
          </S.MobileHeader>

          <S.MobileFormContent>
            <Input
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              placeholder="feature-branch-name"
              className="text-sm h-10 rounded-md focus:border-primary transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isDisabled) onCreateWorktree();
                if (e.key === 'Escape') onCancel();
              }}
            />

            {!validation.isValid && featureName && (
              <div className="text-xs text-destructive mt-1">
                {validation.error}
              </div>
            )}

            <S.MobileActions>
              <Button
                onClick={onCancel}
                disabled={creatingWorktree}
                variant="outline"
                className="flex-1 h-9 text-sm rounded-md active:scale-95 transition-transform"
              >
                Cancel
              </Button>
              <Button
                onClick={onCreateWorktree}
                disabled={isDisabled}
                className="flex-1 h-9 text-sm rounded-md bg-primary hover:bg-primary/90 active:scale-95 transition-all"
              >
                {creatingWorktree ? 'Creating...' : 'Create'}
              </Button>
            </S.MobileActions>
          </S.MobileFormContent>

          <S.SafeArea />
        </S.MobileModal>
      </S.MobileOverlay>
    </S.Container>
  );
};
