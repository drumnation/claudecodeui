import React from "react";
import { GitBranch, ChevronDown, Check, Plus } from "lucide-react";

interface GitBranchSelectorProps {
  currentBranch: string;
  branches: string[];
  showBranchDropdown: boolean;
  onToggleDropdown: () => void;
  onSwitchBranch: (branch: string) => void;
  onCreateBranch: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export function GitBranchSelector({
  currentBranch,
  branches,
  showBranchDropdown,
  onToggleDropdown,
  onSwitchBranch,
  onCreateBranch,
  dropdownRef
}: GitBranchSelectorProps) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggleDropdown}
        className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        data-testid="branch-selector"
      >
        <GitBranch className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium">{currentBranch}</span>
        <ChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform ${
            showBranchDropdown ? "rotate-180" : ""
          }`}
        />
      </button>

      {showBranchDropdown && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1 max-h-64 overflow-y-auto">
            {branches.map((branch) => (
              <button
                key={branch}
                onClick={() => onSwitchBranch(branch)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  branch === currentBranch
                    ? "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {branch === currentBranch && (
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  )}
                  <span className={branch === currentBranch ? "font-medium" : ""}>
                    {branch}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={onCreateBranch}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              data-testid="create-branch-button"
            >
              <Plus className="w-3 h-3" />
              <span>Create new branch</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
