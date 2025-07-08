import { useState, useEffect, useRef } from 'react';
import { gitApi } from '@/features/git/GitPanel.logic';
import { encodeProjectPath } from '@/lib/projectUtils';

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
  const [error, setError] = useState(null);

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
    setError(null);
    try {
      // Convert project path to the format expected by the server
      // The backend expects project names with a leading dash
      const encodedPath = encodeProjectPath(selectedProject.fullPath);
      const projectName = '-' + encodedPath;
      console.log('🔍 Fetching git status for project:', projectName);
      console.log('🔍 Original path:', selectedProject.fullPath);
      console.log('🔍 Encoded path:', encodedPath);
      
      const data = await gitApi.fetchStatus(projectName);
      console.log('📦 Git status response:', data);
      
      if (data) {
        if (data.error) {
          console.error('❌ Git status error:', data.error);
          setError(data.error);
          setGitStatus(null);
        } else {
          // Handle both old and new API response formats
          let normalizedData = data;
          
          // Check if we got the new format with 'staged' instead of separate arrays
          if (data.staged !== undefined && !data.modified && !data.added && !data.deleted) {
            console.log('⚠️ Detected new API format, normalizing...');
            normalizedData = {
              branch: data.branch,
              modified: [],
              added: [],
              deleted: [],
              untracked: data.untracked || [],
              // We might need to parse staged files differently
              files: []
            };
            
            // If there are staged files, we need to handle them
            if (data.staged && Array.isArray(data.staged)) {
              data.staged.forEach(file => {
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
          
          console.log('✅ Setting git status with files:', {
            modified: normalizedData.modified?.length || 0,
            added: normalizedData.added?.length || 0,
            deleted: normalizedData.deleted?.length || 0,
            untracked: normalizedData.untracked?.length || 0
          });
          setGitStatus(normalizedData);
          setCurrentBranch(normalizedData.branch || 'main');
          
          // Auto-select all changed files
          const allFiles = new Set([
            ...(normalizedData.modified || []),
            ...(normalizedData.added || []),
            ...(normalizedData.deleted || []),
            ...(normalizedData.untracked || [])
          ]);
          setSelectedFiles(allFiles);
          
          // Fetch diffs for changed files
          for (const file of [...(data.modified || []), ...(data.added || [])]) {
            fetchFileDiff(file);
          }
        }
      } else {
        setGitStatus(null);
      }
    } catch (error) {
      console.error('Error fetching git status:', error);
      setError('Failed to fetch git status. Please check if this is a git repository.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const projectName = encodeProjectPath(selectedProject.fullPath);
      const branches = await gitApi.fetchBranches(projectName);
      setBranches(branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setError('Failed to fetch branches');
    }
  };

  const switchBranch = async (branchName) => {
    try {
      const projectName = encodeProjectPath(selectedProject.fullPath);
      const data = await gitApi.switchBranch(projectName, branchName);
      
      if (data.success) {
        setCurrentBranch(branchName);
        setShowBranchDropdown(false);
        fetchGitStatus();
      } else {
        console.error('Failed to switch branch:', data.error);
        setError(`Failed to switch branch: ${data.error}`);
      }
    } catch (error) {
      console.error('Error switching branch:', error);
      setError('Failed to switch branch');
    }
  };

  const createBranch = async () => {
    if (!newBranchName.trim()) return;
    
    setIsCreatingBranch(true);
    try {
      const projectName = encodeProjectPath(selectedProject.fullPath);
      const data = await gitApi.createBranch(projectName, newBranchName);
      
      if (data.success) {
        setCurrentBranch(newBranchName.trim());
        setShowNewBranchModal(false);
        setShowBranchDropdown(false);
        setNewBranchName('');
        fetchBranches();
        fetchGitStatus();
      } else {
        console.error('Failed to create branch:', data.error);
        setError(`Failed to create branch: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      setError('Failed to create branch');
    } finally {
      setIsCreatingBranch(false);
    }
  };


  const fetchRecentCommits = async () => {
    try {
      const projectName = encodeProjectPath(selectedProject.fullPath);
      const commits = await gitApi.fetchRecentCommits(projectName);
      setRecentCommits(commits);
    } catch (error) {
      console.error('Error fetching commits:', error);
      setError('Failed to fetch commit history');
    }
  };

  const fetchCommitDiff = async (commitHash) => {
    try {
      const projectName = encodeProjectPath(selectedProject.fullPath);
      const diff = await gitApi.fetchCommitDiff(projectName, commitHash);
      
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
      const projectName = encodeProjectPath(selectedProject.fullPath);
      const data = await gitApi.generateCommitMessage(projectName, Array.from(selectedFiles));
      
      if (data.message) {
        setCommitMessage(data.message);
      } else {
        console.error('Failed to generate commit message:', data.error);
        setError('Failed to generate commit message');
      }
    } catch (error) {
      console.error('Error generating commit message:', error);
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
      const projectName = encodeProjectPath(selectedProject.fullPath);
      const data = await gitApi.commit(projectName, commitMessage, Array.from(selectedFiles));
      
      if (data.success) {
        // Reset state after successful commit
        setCommitMessage('');
        setSelectedFiles(new Set());
        fetchGitStatus();
      } else {
        console.error('Commit failed:', data.error);
        setError(`Commit failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error committing changes:', error);
      setError('Failed to commit changes');
    } finally {
      setIsCommitting(false);
    }
  };

  // Toggle functions
  const toggleFileExpanded = async (filePath) => {
    setExpandedFiles(prev => {
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
  
  const fetchFileDiff = async (filePath) => {
    if (!selectedProject) return;
    
    try {
      // The backend expects project names with a leading dash
      const encodedPath = encodeProjectPath(selectedProject.fullPath);
      const projectName = '-' + encodedPath;
      
      console.log('🔍 Fetching diff for file:', filePath);
      console.log('🔍 Project name:', projectName);
      const diff = await gitApi.fetchFileDiff(projectName, filePath);
      console.log('📦 Diff response:', diff);
      
      if (diff) {
        setGitDiff(prev => {
          const newDiffs = {
            ...prev,
            [filePath]: diff
          };
          console.log('📋 Updated gitDiff state:', newDiffs);
          return newDiffs;
        });
      } else {
        console.warn('⚠️ No diff returned for file:', filePath);
      }
    } catch (error) {
      console.error('❌ Error fetching file diff:', error);
    }
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
    error,
    
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