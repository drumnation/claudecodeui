import {useState, useEffect, useRef, useCallback} from 'react';
import {gitApi} from '@/features/git/GitPanel.logic';
import {
  useLogger,
  sanitizeError,
  addTimestamp,
  isLevelEnabled,
} from '../../logger';

// Use project.name directly - backend expects the project name from projects list

export const useGitPanel = (
  selectedProject: any,
  externalGitStatus: any,
  onGitStatusChange: any,
) => {
  const logger = useLogger({hook: 'useGitPanel'});
  // State management - use external git status if provided
  const [gitStatus, setGitStatus] = useState(externalGitStatus || null);
  const [gitDiff, setGitDiff] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isCommitting, setIsCommitting] = useState(false);
  const [currentBranch, setCurrentBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [wrapText, setWrapText] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showNewBranchModal, setShowNewBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [activeView, setActiveView] = useState('changes');
  const [recentCommits, setRecentCommits] = useState([]);
  const [expandedCommits, setExpandedCommits] = useState(new Set());
  const [commitDiffs, setCommitDiffs] = useState({});
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [error, setError] = useState(null);

  // PR creation state
  const [isCreatingPR, setIsCreatingPR] = useState(false);
  const [prUrl, setPrUrl] = useState('');
  const [prError, setPrError] = useState('');

  // Refs
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Define fetchFileDiff first since it's used by fetchGitStatus
  const fetchFileDiff = useCallback(
    async (filePath: any) => {
      if (!selectedProject || !filePath) {
        return;
      }

      try {
        const diff = await gitApi.fetchFileDiff(selectedProject.name, filePath);

        if (diff) {
          setGitDiff((prev) => ({
            ...prev,
            [filePath]: diff,
          }));
        }
      } catch (error) {
        logger.error('Error fetching file diff', {
          error: sanitizeError(error),
          filePath,
          projectName: selectedProject?.name,
          ...addTimestamp(),
        });
      }
    },
    [selectedProject?.name],
  );

  // API Functions - Define all callbacks before effects
  const fetchGitStatus = useCallback(async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await gitApi.fetchStatus(selectedProject.name);

      if (data) {
        if (data.error) {
          logger.error('Git status error', {
            error: data.error,
            projectName: selectedProject.name,
            ...addTimestamp(),
          });
          setError(data.error);
          setGitStatus(null);
        } else {
          // Handle both old and new API response formats
          let normalizedData = data;

          // Check if we got the new format with 'staged' instead of separate arrays
          if (
            data.staged !== undefined &&
            !data.modified &&
            !data.added &&
            !data.deleted
          ) {
            normalizedData = {
              branch: data.branch,
              modified: [],
              added: [],
              deleted: [],
              untracked: data.untracked || [],
              // We might need to parse staged files differently
              files: [],
            };

            // If there are staged files, we need to handle them
            if (data.staged && Array.isArray(data.staged)) {
              data.staged.forEach((file: any) => {
                if (typeof file === 'string') {
                  normalizedData.modified.push(file);
                } else if (file && file.path) {
                  // Handle object format
                  const status = file.status || 'M';
                  if (status === 'A') {
                    normalizedData.added.push(file.path);
                  } else if (status === 'D') {
                    normalizedData.deleted.push(file.path);
                  } else {
                    normalizedData.modified.push(file.path);
                  }
                }
              });
            }
          }
          setGitStatus(normalizedData);
          setCurrentBranch(normalizedData.branch || 'main');

          // Notify parent component if callback provided
          if (onGitStatusChange) {
            onGitStatusChange(normalizedData);
          }

          // Auto-select all changed files
          const allFiles = new Set([
            ...(normalizedData.modified || []),
            ...(normalizedData.added || []),
            ...(normalizedData.deleted || []),
            ...(normalizedData.untracked || []),
          ]);
          setSelectedFiles(allFiles);

          // Fetch diffs for changed files in batch
          const filesToFetch = [
            ...(normalizedData.modified || []),
            ...(normalizedData.added || []),
          ];
          if (filesToFetch.length > 0) {
            // Fetch all diffs in parallel and update state once
            Promise.all(
              filesToFetch.map(async (file) => {
                if (!file) return null;
                try {
                  const diff = await gitApi.fetchFileDiff(
                    selectedProject.name,
                    file,
                  );
                  return {file, diff};
                } catch (error) {
                  logger.error('Error fetching diff for file', {
                    error: sanitizeError(error),
                    file,
                    projectName: selectedProject.name,
                    ...addTimestamp(),
                  });
                  return null;
                }
              }),
            ).then((results) => {
              const validResults = results.filter((r) => r && r.diff);
              if (validResults.length > 0) {
                setGitDiff((prev) => {
                  const newDiffs = {...prev};
                  validResults.forEach(({file, diff}) => {
                    newDiffs[file] = diff;
                  });
                  return newDiffs;
                });
              }
            });
          }
        }
      } else {
        setGitStatus(null);
      }
    } catch (error) {
      logger.error('Error fetching git status', {
        error: sanitizeError(error),
        projectName: selectedProject?.name,
        ...addTimestamp(),
      });
      setError(
        'Failed to fetch git status. Please check if this is a git repository.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject?.name, onGitStatusChange, fetchFileDiff]);

  const fetchBranches = useCallback(async () => {
    if (!selectedProject) return;
    try {
      // Use the project name directly, not the encoded path
      const branches = await gitApi.fetchBranches(selectedProject.name);
      setBranches(branches);
    } catch (error) {
      logger.error('Error fetching branches', {
        error: sanitizeError(error),
        projectName: selectedProject?.name,
        ...addTimestamp(),
      });
      setError('Failed to fetch branches');
    }
  }, [selectedProject?.name]);

  const fetchRecentCommits = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const commits = await gitApi.fetchRecentCommits(selectedProject.name);
      setRecentCommits(commits);
    } catch (error) {
      logger.error('Error fetching commits', {
        error: sanitizeError(error),
        projectName: selectedProject?.name,
        ...addTimestamp(),
      });
      setError('Failed to fetch commit history');
    }
  }, [selectedProject?.name]);

  // Non-callback functions
  const switchBranch = useCallback(
    async (branchName: any) => {
      if (!selectedProject) return;
      try {
        const data = await gitApi.switchBranch(
          selectedProject.name,
          branchName,
        );

        if (data.success) {
          setCurrentBranch(branchName);
          setShowBranchDropdown(false);
          fetchGitStatus();
        } else {
          logger.error('Failed to switch branch', {
            error: data.error,
            branchName,
            projectName: selectedProject.name,
            ...addTimestamp(),
          });
          setError(`Failed to switch branch: ${data.error}`);
        }
      } catch (error) {
        logger.error('Error switching branch', {
          error: sanitizeError(error),
          branchName,
          projectName: selectedProject?.name,
          ...addTimestamp(),
        });
        setError('Failed to switch branch');
      }
    },
    [selectedProject?.name, fetchGitStatus],
  );

  const createBranch = useCallback(async () => {
    if (!newBranchName.trim() || !selectedProject) return;

    setIsCreatingBranch(true);
    try {
      const data = await gitApi.createBranch(
        selectedProject.name,
        newBranchName,
      );

      if (data.success) {
        setCurrentBranch(newBranchName.trim());
        setShowNewBranchModal(false);
        setShowBranchDropdown(false);
        setNewBranchName('');
        fetchBranches();
        fetchGitStatus();
      } else {
        logger.error('Failed to create branch', {
          error: data.error,
          branchName: newBranchName,
          projectName: selectedProject.name,
          ...addTimestamp(),
        });
        setError(`Failed to create branch: ${data.error}`);
      }
    } catch (error) {
      logger.error('Error creating branch', {
        error: sanitizeError(error),
        branchName: newBranchName,
        projectName: selectedProject?.name,
        ...addTimestamp(),
      });
      setError('Failed to create branch');
    } finally {
      setIsCreatingBranch(false);
    }
  }, [selectedProject?.name, newBranchName, fetchBranches, fetchGitStatus]);

  const fetchCommitDiff = async (commitHash: any) => {
    try {
      const diff = await gitApi.fetchCommitDiff(
        selectedProject.name,
        commitHash,
      );

      if (diff) {
        setCommitDiffs((prev) => ({
          ...prev,
          [commitHash]: diff,
        }));
      }
    } catch (error) {
      logger.error('Error fetching commit diff', {
        error: sanitizeError(error),
        commitHash,
        projectName: selectedProject?.name,
        ...addTimestamp(),
      });
    }
  };

  const generateCommitMessage = async () => {
    setIsGeneratingMessage(true);
    try {
      const data = await gitApi.generateCommitMessage(
        selectedProject.name,
        Array.from(selectedFiles),
      );

      if (data.message) {
        setCommitMessage(data.message);
      } else {
        logger.error('Failed to generate commit message', {
          error: data.error,
          selectedFiles: Array.from(selectedFiles),
          projectName: selectedProject.name,
          ...addTimestamp(),
        });
        setError('Failed to generate commit message');
      }
    } catch (error) {
      logger.error('Error generating commit message', {
        error: sanitizeError(error),
        selectedFiles: Array.from(selectedFiles),
        projectName: selectedProject?.name,
        ...addTimestamp(),
      });
      setError('Failed to generate commit message');
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim() || selectedFiles.size === 0) return;

    setIsCommitting(true);
    setError(null);
    try {
      const data = await gitApi.commit(
        selectedProject.name,
        commitMessage,
        Array.from(selectedFiles),
      );

      if (data.success) {
        // Reset state after successful commit
        setCommitMessage('');
        setSelectedFiles(new Set());
        fetchGitStatus();
      } else {
        logger.error('Commit failed', {
          error: data.error,
          projectName: selectedProject.name,
          filesCount: selectedFiles.size,
          ...addTimestamp(),
        });
        setError(`Commit failed: ${data.error}`);
      }
    } catch (error) {
      logger.error('Error committing changes', {
        error: sanitizeError(error),
        projectName: selectedProject?.name,
        filesCount: selectedFiles.size,
        ...addTimestamp(),
      });
      setError('Failed to commit changes');
    } finally {
      setIsCommitting(false);
    }
  };

  // Toggle functions
  const toggleFileExpanded = async (filePath: any) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
        // Fetch diff for this file if not already fetched
        if (!gitDiff[filePath]) {
          fetchFileDiff(filePath);
        }
      }
      return newSet;
    });
  };

  // Effects - Now all callbacks are defined above
  useEffect(() => {
    if (selectedProject && !externalGitStatus) {
      fetchGitStatus();
    }
  }, [selectedProject?.name]); // Only fetch git status when project changes

  useEffect(() => {
    if (selectedProject) {
      fetchBranches();
    }
  }, [selectedProject?.name]);

  useEffect(() => {
    if (selectedProject && activeView === 'history') {
      fetchRecentCommits();
    }
  }, [selectedProject?.name, activeView]);

  // Update internal state when external git status changes
  useEffect(() => {
    if (externalGitStatus) {
      setGitStatus(externalGitStatus);
    }
  }, [externalGitStatus]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCommitExpanded = (commitHash: any) => {
    setExpandedCommits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commitHash)) {
        newSet.delete(commitHash);
      } else {
        newSet.add(commitHash);
        // Fetch diff for this commit if not already fetched
        if (!commitDiffs[commitHash]) {
          fetchCommitDiff(commitHash);
        }
      }
      return newSet;
    });
  };

  const toggleFileSelected = (filePath: any) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const selectAllFiles = () => {
    const allFiles = new Set([
      ...(gitStatus?.modified || []),
      ...(gitStatus?.added || []),
      ...(gitStatus?.deleted || []),
      ...(gitStatus?.untracked || []),
    ]);
    setSelectedFiles(allFiles);
  };

  const deselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const createPullRequest = async (targetBranch = 'main') => {
    if (!selectedProject) {
      logger.warn('No project selected for PR creation', {
        ...addTimestamp(),
      });
      return;
    }

    setIsCreatingPR(true);
    setPrError('');

    try {
      const result = await gitApi.createPullRequest(
        selectedProject.name,
        targetBranch,
      );

      if (result.error) {
        logger.error('PR creation error', {
          error: result.error,
          projectName: selectedProject.name,
          targetBranch,
          ...addTimestamp(),
        });
        setPrError(result.error);
        return;
      }

      // Store PR URL and open in new tab
      if (result.prUrl) {
        setPrUrl(result.prUrl);
        window.open(result.prUrl, '_blank');
      } else if (result.message) {
        // Handle case where branch was pushed but no PR URL was generated
        logger.info('Branch pushed successfully', {
          message: result.message,
          projectName: selectedProject.name,
          targetBranch,
          ...addTimestamp(),
        });
      }

      // Clear other error states on success
      setError(null);
    } catch (error) {
      logger.error('Error creating PR', {
        error: sanitizeError(error),
        projectName: selectedProject?.name,
        targetBranch,
        ...addTimestamp(),
      });
      setPrError('Failed to create pull request');
    } finally {
      setIsCreatingPR(false);
    }
  };

  const refresh = useCallback(() => {
    fetchGitStatus();
    fetchBranches();
    if (activeView === 'history') {
      fetchRecentCommits();
    }
  }, [fetchGitStatus, fetchBranches, fetchRecentCommits, activeView]);

  return {
    // State
    gitStatus,
    gitDiff,
    isLoading,
    commitMessage,
    expandedFiles,
    selectedFiles,
    isCommitting,
    currentBranch,
    branches,
    wrapText,
    showLegend,
    showBranchDropdown,
    showNewBranchModal,
    newBranchName,
    isCreatingBranch,
    activeView,
    recentCommits,
    expandedCommits,
    commitDiffs,
    isGeneratingMessage,
    error,
    isCreatingPR,
    prUrl,
    prError,

    // Refs
    textareaRef,
    dropdownRef,

    // Setters
    setCommitMessage,
    setWrapText,
    setShowLegend,
    setShowBranchDropdown,
    setShowNewBranchModal,
    setNewBranchName,
    setActiveView,

    // Actions
    switchBranch,
    createBranch,
    generateCommitMessage,
    handleCommit,
    toggleFileExpanded,
    toggleCommitExpanded,
    toggleFileSelected,
    selectAllFiles,
    deselectAllFiles,
    createPullRequest,
    refresh,
  };
};
