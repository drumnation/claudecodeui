import { useState, useEffect, useRef } from 'react';
import { gitApi } from '@/features/git/GitPanel.logic';

export const useGitPanel = (selectedProject) => {
  // State management
  const [gitStatus, setGitStatus] = useState(null);
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

  // Refs
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Effects
  useEffect(() => {
    if (selectedProject) {
      fetchGitStatus();
      fetchBranches();
      if (activeView === 'history') {
        fetchRecentCommits();
      }
    }
  }, [selectedProject, activeView]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // API Functions
  const fetchGitStatus = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    try {
      const data = await gitApi.fetchStatus(selectedProject.name);
      
      if (data) {
        setGitStatus(data);
        setCurrentBranch(data.branch || 'main');
        
        // Auto-select all changed files
        const allFiles = new Set([
          ...(data.modified || []),
          ...(data.added || []),
          ...(data.deleted || []),
          ...(data.untracked || [])
        ]);
        setSelectedFiles(allFiles);
        
        // Fetch diffs for changed files
        for (const file of [...(data.modified || []), ...(data.added || [])]) {
          fetchFileDiff(file);
        }
      } else {
        setGitStatus(null);
      }
    } catch (error) {
      console.error('Error fetching git status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const branches = await gitApi.fetchBranches(selectedProject.name);
      setBranches(branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const switchBranch = async (branchName) => {
    try {
      const data = await gitApi.switchBranch(selectedProject.name, branchName);
      
      if (data.success) {
        setCurrentBranch(branchName);
        setShowBranchDropdown(false);
        fetchGitStatus();
      } else {
        console.error('Failed to switch branch:', data.error);
      }
    } catch (error) {
      console.error('Error switching branch:', error);
    }
  };

  const createBranch = async () => {
    if (!newBranchName.trim()) return;
    
    setIsCreatingBranch(true);
    try {
      const data = await gitApi.createBranch(selectedProject.name, newBranchName);
      
      if (data.success) {
        setCurrentBranch(newBranchName.trim());
        setShowNewBranchModal(false);
        setShowBranchDropdown(false);
        setNewBranchName('');
        fetchBranches();
        fetchGitStatus();
      } else {
        console.error('Failed to create branch:', data.error);
      }
    } catch (error) {
      console.error('Error creating branch:', error);
    } finally {
      setIsCreatingBranch(false);
    }
  };

  const fetchFileDiff = async (filePath) => {
    try {
      const diff = await gitApi.fetchFileDiff(selectedProject.name, filePath);
      
      if (diff) {
        setGitDiff(prev => ({
          ...prev,
          [filePath]: diff
        }));
      }
    } catch (error) {
      console.error('Error fetching file diff:', error);
    }
  };

  const fetchRecentCommits = async () => {
    try {
      const commits = await gitApi.fetchRecentCommits(selectedProject.name);
      setRecentCommits(commits);
    } catch (error) {
      console.error('Error fetching commits:', error);
    }
  };

  const fetchCommitDiff = async (commitHash) => {
    try {
      const diff = await gitApi.fetchCommitDiff(selectedProject.name, commitHash);
      
      if (diff) {
        setCommitDiffs(prev => ({
          ...prev,
          [commitHash]: diff
        }));
      }
    } catch (error) {
      console.error('Error fetching commit diff:', error);
    }
  };

  const generateCommitMessage = async () => {
    setIsGeneratingMessage(true);
    try {
      const data = await gitApi.generateCommitMessage(selectedProject.name, Array.from(selectedFiles));
      
      if (data.message) {
        setCommitMessage(data.message);
      } else {
        console.error('Failed to generate commit message:', data.error);
      }
    } catch (error) {
      console.error('Error generating commit message:', error);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim() || selectedFiles.size === 0) return;
    
    setIsCommitting(true);
    try {
      const data = await gitApi.commit(selectedProject.name, commitMessage, Array.from(selectedFiles));
      
      if (data.success) {
        // Reset state after successful commit
        setCommitMessage('');
        setSelectedFiles(new Set());
        fetchGitStatus();
      } else {
        console.error('Commit failed:', data.error);
      }
    } catch (error) {
      console.error('Error committing changes:', error);
    } finally {
      setIsCommitting(false);
    }
  };

  // Toggle functions
  const toggleFileExpanded = (filePath) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const toggleCommitExpanded = (commitHash) => {
    setExpandedCommits(prev => {
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

  const toggleFileSelected = (filePath) => {
    setSelectedFiles(prev => {
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
      ...(gitStatus?.untracked || [])
    ]);
    setSelectedFiles(allFiles);
  };

  const deselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const refresh = () => {
    fetchGitStatus();
    fetchBranches();
    if (activeView === 'history') {
      fetchRecentCommits();
    }
  };

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
    refresh
  };
};