import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ModalTitle,
  ModalLabel,
  ModalInput,
  ModalHelpText,
  ModalActions,
  CancelButton,
  CreateButton
} from '@/features/git/NewBranchModal/NewBranchModal.styles';

export const NewBranchModal = ({
  show,
  currentBranch,
  newBranchName,
  isCreating,
  onClose,
  onBranchNameChange,
  onCreate
}) => {
  if (!show) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isCreating) {
      onCreate();
    }
  };

  return (
    <Modal>
      <ModalBackdrop onClick={onClose} />
      <ModalContent>
        <ModalBody>
          <ModalTitle>Create New Branch</ModalTitle>
          <div className="mb-4">
            <ModalLabel>Branch Name</ModalLabel>
            <ModalInput
              type="text"
              value={newBranchName}
              onChange={(e) => onBranchNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="feature/new-feature"
              autoFocus
            />
          </div>
          <ModalHelpText>
            This will create a new branch from the current branch ({currentBranch})
          </ModalHelpText>
          <ModalActions>
            <CancelButton onClick={onClose}>
              Cancel
            </CancelButton>
            <CreateButton
              onClick={onCreate}
              disabled={!newBranchName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Create Branch</span>
                </>
              )}
            </CreateButton>
          </ModalActions>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};