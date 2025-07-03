import { useState, useEffect, useRef, useCallback } from "react";
import { useLogger } from "@kit/logger/react";
import type { Logger } from "@kit/logger/types";
import type { GitStatus, GitCommit, GitPanelProps } from "./GitPanel.types";
import { gitApiService, gitUtils } from "./GitPanel.logic";

export function useGitPanel({ selectedProject }: Pick<GitPanelProps, 'selectedProject'>) {
  const logger: Logger = useLogger({ scope: "GitPanel" });
  
  // State
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [gitDiff, setGitDiff] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [currentBranch, setCurrentBranch] = useState<string>("");
  const [branches, setBranches] = useState<string[]>([]);
  const [wrapText, setWrapText] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState<boolean>(false);
  const [showNewBranchModal, setShowNewBranchModal] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState<string>("");
  const [isCreatingBranch, setIsCreatingBranch] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>("changes");
  const [recentCommits, setRecentCommits] = useState<GitCommit[]>([]);
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [commitDiffs, setCommitDiffs] = useState<Record<string, any>>({});
  const [isGeneratingMessage, setIsGeneratingMessage] = useState<boolean>(false);
  const [showStashModal, setShowStashModal] = useState<boolean>(false);
  const [pendingBranch, setPendingBranch] = useState<string | null>(null);
  const [isStashing, setIsStashing] = useState<boolean>(false);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch git status
  const fetchGitStatus = useCallback(async () => {
    if (!selectedProject) return;

    logger.info("Fetching git status", {
      project: selectedProject.name,
      path: selectedProject.fullPath,
    });

    setIsLoading(true);
    try {
      const data = await gitApiService.fetchGitStatus(selectedProject.fullPath);
      
      if (data) {
        setGitStatus(data);
        setCurrentBranch(data.branch || "main");

        // Auto-select all changed files
        const allFiles = gitUtils.getAllChangedFiles(data);
        setSelectedFiles(allFiles);

        // Fetch diffs for changed files
        for (const file of data.modified || []) {
          fetchFileDiff(file);
        }
        for (const file of data.added || []) {
          fetchFileDiff(file);
        }
      } else {
        setGitStatus(null);
      }
    } catch (error) {
      logger.error("Error fetching git status", {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, logger]);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    if (!selectedProject) return;
    
    try {
      const branches = await gitApiService.fetchBranches(selectedProject.fullPath);
      setBranches(branches);
    } catch (error) {
      logger.error("Error fetching branches", {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
    }
  }, [selectedProject, logger]);

  // Fetch recent commits
  const fetchRecentCommits = useCallback(async () => {
    if (!selectedProject) return;
    
    try {
      const commits = await gitApiService.fetchRecentCommits(selectedProject.fullPath);
      setRecentCommits(commits);
    } catch (error) {
      logger.error("Error fetching commits", {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
    }
  }, [selectedProject, logger]);

  // Fetch file diff
  const fetchFileDiff = useCallback(async (filePath: string) => {
    if (!selectedProject) return;
    
    try {
      const diff = await gitApiService.fetchFileDiff(selectedProject.fullPath, filePath);
      if (diff) {
        setGitDiff((prev) => ({
          ...prev,
          [filePath]: diff,
        }));
      }
    } catch (error) {
      logger.error("Error fetching file diff", {
        error: (error as Error).message,
        filePath,
      });
    }
  }, [selectedProject, logger]);

  // Fetch commit diff
  const fetchCommitDiff = useCallback(async (commitHash: string) => {
    if (!selectedProject) return;
    
    try {
      const diff = await gitApiService.fetchCommitDiff(selectedProject.fullPath, commitHash);
      if (diff) {
        setCommitDiffs((prev) => ({
          ...prev,
          [commitHash]: diff,
        }));
      }
    } catch (error) {
      logger.error("Error fetching commit diff", {
        error: (error as Error).message,
        commitHash,
      });
    }
  }, [selectedProject, logger]);

  // Effects
  useEffect(() => {
    if (selectedProject) {
      // Clear any pending fetch
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Debounce fetching to prevent rapid successive calls
      fetchTimeoutRef.current = setTimeout(() => {
        fetchGitStatus();
        fetchBranches();
        if (activeView === "history") {
          fetchRecentCommits();
        }
      }, 100);
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [selectedProject, activeView, fetchGitStatus, fetchBranches, fetchRecentCommits]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowBranchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    // State
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
    setRecentCommits,
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
    
    // Refs
    textareaRef,
    dropdownRef,
    
    // Actions
    fetchGitStatus,
    fetchBranches,
    fetchRecentCommits,
    fetchFileDiff,
    fetchCommitDiff,
    
    // Logger
    logger
  };
}
