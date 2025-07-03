import React, { useCallback } from "react";
import {
  RefreshCw,
  FileText,
  History,
  GitCommit,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Info,
  AlertCircle,
  Check,
} from "lucide-react";
import { GitBranchSelector } from "./components/GitBranchSelector";
import { GitCommitInput } from "./components/GitCommitInput";
import { GitFileList } from "./components/GitFileList";
import { useGitPanel } from "./GitPanel.hook";
import { gitApiService, gitUtils } from "./GitPanel.logic";
import type { GitPanelProps } from "./GitPanel.types";

export function GitPanel({ selectedProject, isMobile }: GitPanelProps) {
  const {
    gitStatus,
    gitDiff,
    isLoading,
    commitMessage,
    setCommitMessage,
    expandedFiles,
    setExpandedFiles,
    selectedFiles,
    setSelectedFiles,
    isCommitting,
    setIsCommitting,
    currentBranch,
    setCurrentBranch,
    branches,
    setBranches,
    wrapText,
    setWrapText,
    showLegend,
    setShowLegend,
    showBranchDropdown,
    setShowBranchDropdown,
    showNewBranchModal,
    setShowNewBranchModal,
    newBranchName,
    setNewBranchName,
    isCreatingBranch,
    setIsCreatingBranch,
    activeView,
    setActiveView,
    recentCommits,
    expandedCommits,
    setExpandedCommits,
    commitDiffs,
    setCommitDiffs,
    isGeneratingMessage,
    setIsGeneratingMessage,
    showStashModal,
    setShowStashModal,
    pendingBranch,
    setPendingBranch,
    isStashing,
    setIsStashing,
    textareaRef,
    dropdownRef,
    fetchGitStatus,
    fetchBranches,
    fetchRecentCommits,
    fetchCommitDiff,
    logger,
  } = useGitPanel({ selectedProject });

  // Event handlers
  const handleToggleFileExpanded = useCallback((filePath: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  }, [setExpandedFiles]);

  const handleToggleFileSelected = useCallback((filePath: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  }, [setSelectedFiles]);

  const handleToggleCommitExpanded = useCallback((commitHash: string) => {
    setExpandedCommits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commitHash)) {
        newSet.delete(commitHash);
      } else {
        newSet.add(commitHash);
        if (!commitDiffs[commitHash]) {
          fetchCommitDiff(commitHash);
        }
      }
      return newSet;
    });
  }, [setExpandedCommits, commitDiffs, fetchCommitDiff]);

  const handleSwitchBranch = useCallback(async (branchName: string, forceCheckout = false) => {
    if (!selectedProject) return;
    
    try {
      const result = await gitApiService.switchBranch(selectedProject.fullPath, branchName, forceCheckout);
      
      if (result.success) {
        setCurrentBranch(branchName);
        setShowBranchDropdown(false);
        setPendingBranch(null);
        setShowStashModal(false);
        fetchGitStatus();
      } else {
        if (result.error?.includes("uncommitted changes")) {
          setPendingBranch(branchName);
          setShowStashModal(true);
        } else {
          logger.error("Failed to switch branch", { error: result.error });
          alert(`Failed to switch branch: ${result.error}`);
        }
      }
    } catch (error) {
      logger.error("Error switching branch", {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      alert("Error switching branch. Please check console for details.");
    }
  }, [selectedProject, setCurrentBranch, setShowBranchDropdown, setPendingBranch, setShowStashModal, fetchGitStatus, logger]);

  const handleCreateBranch = useCallback(async () => {
    if (!newBranchName.trim() || !selectedProject) return;

    setIsCreatingBranch(true);
    try {
      const result = await gitApiService.createBranch(selectedProject.fullPath, newBranchName.trim());
      
      if (result.success) {
        setCurrentBranch(newBranchName.trim());
        setShowNewBranchModal(false);
        setShowBranchDropdown(false);
        setNewBranchName("");
        fetchBranches();
        fetchGitStatus();
      } else {
        logger.error("Failed to create branch", { error: result.error });
      }
    } catch (error) {
      logger.error("Error creating branch", {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
    } finally {
      setIsCreatingBranch(false);
    }
  }, [newBranchName, selectedProject, setIsCreatingBranch, setCurrentBranch, setShowNewBranchModal, setShowBranchDropdown, setNewBranchName, fetchBranches, fetchGitStatus, logger]);

  const handleCommit = useCallback(async () => {
    if (!commitMessage.trim() || selectedFiles.size === 0 || !selectedProject) return;

    setIsCommitting(true);
    try {
      const result = await gitApiService.commitChanges(
        selectedProject.fullPath,
        commitMessage,
        Array.from(selectedFiles)
      );
      
      if (result.success) {
        setCommitMessage("");
        setSelectedFiles(new Set());
        fetchGitStatus();
      } else {
        logger.error("Commit failed", { error: result.error });
      }
    } catch (error) {
      logger.error("Error committing changes", {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
    } finally {
      setIsCommitting(false);
    }
  }, [commitMessage, selectedFiles, selectedProject, setIsCommitting, setCommitMessage, setSelectedFiles, fetchGitStatus, logger]);

  const handleGenerateCommitMessage = useCallback(async () => {
    if (!selectedProject) return;
    
    setIsGeneratingMessage(true);
    try {
      const message = await gitApiService.generateCommitMessage(
        selectedProject.fullPath,
        Array.from(selectedFiles)
      );
      
      if (message) {
        setCommitMessage(message);
      } else {
        logger.error("Failed to generate commit message");
      }
    } catch (error) {
      logger.error("Error generating commit message", {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
    } finally {
      setIsGeneratingMessage(false);
    }
  }, [selectedProject, selectedFiles, setIsGeneratingMessage, setCommitMessage, logger]);

  const handleStashAndSwitch = useCallback(async () => {
    if (!pendingBranch || !selectedProject) return;

    setIsStashing(true);
    try {
      const result = await gitApiService.stashChanges(
        selectedProject.fullPath,
        `Auto-stash before switching to ${pendingBranch}`
      );
      
      if (result.success) {
        await handleSwitchBranch(pendingBranch, true);
      } else {
        logger.error("Failed to stash changes", { error: result.error });
        alert(`Failed to stash changes: ${result.error}`);
      }
    } catch (error) {
      logger.error("Error stashing and switching branch", {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      alert("Error stashing changes. Please check console for details.");
    } finally {
      setIsStashing(false);
    }
  }, [pendingBranch, selectedProject, setIsStashing, handleSwitchBranch, logger]);

  // Early return for no project
  if (!selectedProject) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>Select a project to view source control</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900" data-testid="git-status">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <GitBranchSelector
          currentBranch={currentBranch}
          branches={branches}
          showBranchDropdown={showBranchDropdown}
          onToggleDropdown={() => setShowBranchDropdown(!showBranchDropdown)}
          onSwitchBranch={handleSwitchBranch}
          onCreateBranch={() => {
            setShowNewBranchModal(true);
            setShowBranchDropdown(false);
          }}
          dropdownRef={dropdownRef}
        />

        <button
          onClick={() => {
            fetchGitStatus();
            fetchBranches();
          }}
          disabled={isLoading}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveView("changes")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeView === "changes"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Changes</span>
          </div>
        </button>
        <button
          onClick={() => {
            setActiveView("history");
            fetchRecentCommits();
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeView === "history"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <History className="w-4 h-4" />
            <span>History</span>
          </div>
        </button>
      </div>

      {/* Commit Input - Only in changes view */}
      {activeView === "changes" && (
        <GitCommitInput
          commitMessage={commitMessage}
          onCommitMessageChange={setCommitMessage}
          selectedFilesCount={selectedFiles.size}
          isCommitting={isCommitting}
          isGeneratingMessage={isGeneratingMessage}
          onCommit={handleCommit}
          onGenerateMessage={handleGenerateCommitMessage}
          textareaRef={textareaRef}
        />
      )}

      {/* File Selection Controls - Only in changes view */}
      {activeView === "changes" && gitStatus && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {selectedFiles.size} of {gitUtils.getFileCount(gitStatus)} files selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFiles(gitUtils.getAllChangedFiles(gitStatus))}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Select All
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Status Legend */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1"
        >
          <Info className="w-3 h-3" />
          <span>File Status Guide</span>
          {showLegend ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>

        {showLegend && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-xs">
            <div className={`${isMobile ? "grid grid-cols-2 gap-3 justify-items-center" : "flex justify-center gap-6"}`}>
              {[{status: "M", label: "Modified", color: "yellow"}, {status: "A", label: "Added", color: "green"}, {status: "D", label: "Deleted", color: "red"}, {status: "U", label: "Untracked", color: "gray"}].map(({status, label, color}) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-5 h-5 bg-${color}-100 text-${color}-700 dark:bg-${color}-900 dark:text-${color}-300 rounded border border-${color}-200 dark:border-${color}-800 font-bold text-xs`}>
                    {status}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 italic">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? "pb-20" : ""}`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : activeView === "changes" ? (
          !gitStatus || gitUtils.getFileCount(gitStatus) === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <GitCommit className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No changes detected</p>
            </div>
          ) : (
            <div className={isMobile ? "pb-4" : ""}>
              <GitFileList
                gitStatus={gitStatus}
                selectedFiles={selectedFiles}
                expandedFiles={expandedFiles}
                gitDiff={gitDiff}
                isMobile={isMobile}
                wrapText={wrapText}
                onToggleFileExpanded={handleToggleFileExpanded}
                onToggleFileSelected={handleToggleFileSelected}
                onToggleWrapText={() => setWrapText(!wrapText)}
              />
            </div>
          )
        ) : (
          recentCommits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <History className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No commits found</p>
            </div>
          ) : (
            <div className={isMobile ? "pb-4" : ""}>
              {recentCommits.map((commit) => {
                const isExpanded = expandedCommits.has(commit.hash);
                const diff = commitDiffs[commit.hash];

                return (
                  <div key={commit.hash} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div
                      className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleToggleCommitExpanded(commit.hash)}
                    >
                      <div className="mr-2 mt-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {commit.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {commit.author} • {commit.date}
                            </p>
                          </div>
                          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 flex-shrink-0">
                            {commit.hash.substring(0, 7)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded && diff && (
                      <div className="bg-gray-50 dark:bg-gray-900">
                        <div className="max-h-96 overflow-y-auto p-2">
                          <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">
                            {commit.stats}
                          </div>
                          {diff.split("\n").map((line: string, index: number) => {
                            const isAddition = line.startsWith("+") && !line.startsWith("+++");
                            const isDeletion = line.startsWith("-") && !line.startsWith("---");
                            const isHeader = line.startsWith("@@");
                            
                            return (
                              <div
                                key={index}
                                className={`font-mono text-xs whitespace-pre overflow-x-auto ${
                                  isAddition
                                    ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                                    : isDeletion
                                      ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
                                      : isHeader
                                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                        : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {line}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {showStashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setShowStashModal(false);
              setPendingBranch(null);
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold">Uncommitted Changes Detected</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You have uncommitted changes that need to be stashed before switching to branch{" "}
                <span className="font-mono font-semibold">{pendingBranch}</span>.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Would you like to stash your changes and switch branches?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStashModal(false);
                    setPendingBranch(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  disabled={isStashing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStashAndSwitch}
                  disabled={isStashing}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isStashing ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Stashing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Stash and Switch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowNewBranchModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Branch</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isCreatingBranch) {
                      handleCreateBranch();
                    }
                  }}
                  placeholder="feature/new-feature"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                This will create a new branch from the current branch ({currentBranch})
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewBranchModal(false);
                    setNewBranchName("");
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBranch}
                  disabled={!newBranchName.trim() || isCreatingBranch}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isCreatingBranch ? (
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
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
