import type { Logger } from "@kit/logger/types";
import type { GitStatus, GitCommit, GitPanelProps } from "./GitPanel.types";

export const gitApiService = {
  async fetchGitStatus(projectPath: string): Promise<GitStatus | null> {
    try {
      const response = await fetch(
        `/api/git/status?path=${encodeURIComponent(projectPath)}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching git status:', error);
      return null;
    }
  },

  async fetchBranches(projectPath: string): Promise<string[]> {
    try {
      const response = await fetch(
        `/api/git/branches?path=${encodeURIComponent(projectPath)}`
      );
      const data = await response.json();
      
      return data.error ? [] : (data.branches || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
  },

  async fetchRecentCommits(projectPath: string, limit = 10): Promise<GitCommit[]> {
    try {
      const response = await fetch(
        `/api/git/commits?path=${encodeURIComponent(projectPath)}&limit=${limit}`
      );
      const data = await response.json();
      
      return data.error ? [] : (data.commits || []);
    } catch (error) {
      console.error('Error fetching commits:', error);
      return [];
    }
  },

  async fetchFileDiff(projectPath: string, filePath: string): Promise<string | null> {
    try {
      const response = await fetch(
        `/api/git/diff?path=${encodeURIComponent(projectPath)}&file=${encodeURIComponent(filePath)}`
      );
      const data = await response.json();
      
      return data.error ? null : data.diff;
    } catch (error) {
      console.error('Error fetching file diff:', error);
      return null;
    }
  },

  async fetchCommitDiff(projectPath: string, commitHash: string): Promise<string | null> {
    try {
      const response = await fetch(
        `/api/git/commit-diff?path=${encodeURIComponent(projectPath)}&commit=${commitHash}`
      );
      const data = await response.json();
      
      return data.error ? null : data.diff;
    } catch (error) {
      console.error('Error fetching commit diff:', error);
      return null;
    }
  },

  async switchBranch(projectPath: string, branchName: string, force = false): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/git/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: projectPath,
          branch: branchName,
          force
        })
      });
      
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async createBranch(projectPath: string, branchName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/git/create-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: projectPath,
          branch: branchName
        })
      });
      
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async stashChanges(projectPath: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/git/stash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: projectPath,
          message
        })
      });
      
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async commitChanges(projectPath: string, message: string, files: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: projectPath,
          message,
          files
        })
      });
      
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async generateCommitMessage(projectPath: string, files: string[]): Promise<string | null> {
    try {
      const response = await fetch('/api/git/generate-commit-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: projectPath,
          files
        })
      });
      
      const data = await response.json();
      return data.message || null;
    } catch (error) {
      console.error('Error generating commit message:', error);
      return null;
    }
  }
};

export const gitUtils = {
  getStatusLabel(status: string): string {
    switch (status) {
      case 'M':
        return 'Modified';
      case 'A':
        return 'Added';
      case 'D':
        return 'Deleted';
      case 'U':
        return 'Untracked';
      default:
        return status;
    }
  },

  getAllChangedFiles(gitStatus: GitStatus): Set<string> {
    return new Set([
      ...(gitStatus?.modified || []),
      ...(gitStatus?.added || []),
      ...(gitStatus?.deleted || []),
      ...(gitStatus?.untracked || [])
    ]);
  },

  getFileCount(gitStatus: GitStatus): number {
    return (
      (gitStatus?.modified?.length || 0) +
      (gitStatus?.added?.length || 0) +
      (gitStatus?.deleted?.length || 0) +
      (gitStatus?.untracked?.length || 0)
    );
  }
};
