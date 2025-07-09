export interface NewBranchModalProps {
  show: boolean;
  currentBranch: string;
  newBranchName: string;
  isCreating: boolean;
  onClose: () => void;
  onBranchNameChange: (name: string) => void;
  onCreate: () => void;
}
