import {RefObject} from 'react';

export interface BranchSelectorProps {
  currentBranch: string;
  branches: string[];
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onSwitchBranch: (branch: string) => void;
  onCreateNewBranch: () => void;
  dropdownRef: RefObject<HTMLDivElement>;
}
