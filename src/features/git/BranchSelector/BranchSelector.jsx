import React from 'react';
import { GitBranch, Check, ChevronDown, Plus } from 'lucide-react';
import {
  BranchSelectorContainer,
  BranchButton,
  BranchDropdown,
  BranchList,
  BranchItem
} from '@/features/git/BranchSelector/BranchSelector.styles';

export const BranchSelector = ({
  currentBranch,
  branches,
  showDropdown,
  onToggleDropdown,
  onSwitchBranch,
  onCreateNewBranch,
  dropdownRef
}) => {
  return (
    <BranchSelectorContainer ref={dropdownRef}>
      <BranchButton onClick={onToggleDropdown}>
        <GitBranch className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium">{currentBranch}</span>
        <ChevronDown 
          className={`w-3 h-3 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
        />
      </BranchButton>
      
      {showDropdown && (
        <BranchDropdown>
          <BranchList>
            {branches.map(branch => (
              <BranchItem
                key={branch}
                onClick={() => onSwitchBranch(branch)}
                isActive={branch === currentBranch}
              >
                <div className="flex items-center space-x-2">
                  {branch === currentBranch && (
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  )}
                  <span className={branch === currentBranch ? 'font-medium' : ''}>
                    {branch}
                  </span>
                </div>
              </BranchItem>
            ))}
          </BranchList>
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <BranchItem onClick={onCreateNewBranch}>
              <div className="flex items-center space-x-2">
                <Plus className="w-3 h-3" />
                <span>Create new branch</span>
              </div>
            </BranchItem>
          </div>
        </BranchDropdown>
      )}
    </BranchSelectorContainer>
  );
};