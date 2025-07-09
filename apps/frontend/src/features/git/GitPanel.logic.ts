// Git API logic functions
export const gitApi = {
  async fetchStatus(projectName: any) {
    try {
      const url = `/api/git/status?project=${encodeURIComponent(projectName)}`;
      console.log('🌐 Fetching git status from:', url);

      const response = await fetch(url);
      console.log('📡 Git status response status:', response.status);

      const data = await response.json();
      console.log('📦 Git status data:', data);

      if (data.error) {
        console.error('Git status error:', data.error);
        return {error: data.error};
      }

      return data;
    } catch (error) {
      console.error('Git status fetch error:', error);
      return {error: 'Failed to connect to git service'};
    }
  },

  async fetchBranches(projectName: any) {
    try {
      const response = await fetch(
        `/api/git/branches?project=${encodeURIComponent(projectName)}`,
      );
      const data = await response.json();

      if (data.error || !data.branches) {
        console.error('Git branches error:', data.error);
        return [];
      }

      return data.branches;
    } catch (error) {
      console.error('Git branches fetch error:', error);
      return [];
    }
  },

  async switchBranch(projectName: any, branchName: any) {
    try {
      const response = await fetch('/api/git/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          project: projectName,
          branch: branchName,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Git switch branch error:', error);
      return {error: 'Failed to switch branch'};
    }
  },

  async createBranch(projectName: any, branchName: any) {
    try {
      const response = await fetch('/api/git/create-branch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          project: projectName,
          branch: branchName.trim(),
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Git create branch error:', error);
      return {error: 'Failed to create branch'};
    }
  },

  async fetchFileDiff(projectName: any, filePath: any) {
    try {
      const response = await fetch(
        `/api/git/diff?project=${encodeURIComponent(projectName)}&file=${encodeURIComponent(filePath)}`,
      );
      const data = await response.json();

      if (!data.error && data.diff) {
        return data.diff;
      }

      return null;
    } catch (error) {
      console.error('Git file diff error:', error);
      return null;
    }
  },

  async fetchRecentCommits(projectName: any, limit = 10) {
    try {
      const response = await fetch(
        `/api/git/commits?project=${encodeURIComponent(projectName)}&limit=${limit}`,
      );
      const data = await response.json();

      if (!data.error && data.commits) {
        return data.commits;
      }

      return [];
    } catch (error) {
      console.error('Git commits fetch error:', error);
      return [];
    }
  },

  async fetchCommitDiff(projectName: any, commitHash: any) {
    try {
      const response = await fetch(
        `/api/git/commit-diff?project=${encodeURIComponent(projectName)}&commit=${commitHash}`,
      );
      const data = await response.json();

      if (!data.error && data.diff) {
        return data.diff;
      }

      return null;
    } catch (error) {
      console.error('Git commit diff error:', error);
      return null;
    }
  },

  async generateCommitMessage(projectName: any, files: any) {
    try {
      const response = await fetch('/api/git/generate-commit-message', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          project: projectName,
          files: files,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Git generate commit message error:', error);
      return {error: 'Failed to generate commit message'};
    }
  },

  async commit(projectName: any, message: any, files: any) {
    try {
      const response = await fetch('/api/git/commit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          project: projectName,
          message: message,
          files: files,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Git commit error:', error);
      return {error: 'Failed to commit changes'};
    }
  },

  async createWorktree(projectName: any, featureName: any, customPath: any) {
    try {
      const response = await fetch('/api/git/worktree/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          project: projectName,
          featureName: featureName,
          customPath: customPath,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Create worktree error:', data.error);
        return {error: data.error};
      }

      return data;
    } catch (error) {
      console.error('Create worktree fetch error:', error);
      return {error: 'Failed to create worktree'};
    }
  },

  async removeWorktree(projectName: any, worktreePath: any) {
    try {
      const response = await fetch('/api/git/worktree/remove', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          project: projectName,
          worktreePath: worktreePath,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Remove worktree error:', data.error);
        return {error: data.error};
      }

      return data;
    } catch (error) {
      console.error('Remove worktree fetch error:', error);
      return {error: 'Failed to remove worktree'};
    }
  },

  async createPullRequest(projectName: any, targetBranch = 'main') {
    try {
      const response = await fetch('/api/git/pr/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          project: projectName,
          targetBranch: targetBranch,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Create PR error:', data.error);
        return {error: data.error};
      }

      return data;
    } catch (error) {
      console.error('Create PR fetch error:', error);
      return {error: 'Failed to create pull request'};
    }
  },
};

// Utility functions
export const getStatusLabel = (status: any) => {
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
};

export const getStatusColorClasses = (status: any, isDark = false) => {
  const baseClasses = {
    M: {
      bg: isDark ? 'bg-yellow-900' : 'bg-yellow-100',
      text: isDark ? 'text-yellow-300' : 'text-yellow-700',
      border: isDark ? 'border-yellow-800' : 'border-yellow-200',
    },
    A: {
      bg: isDark ? 'bg-green-900' : 'bg-green-100',
      text: isDark ? 'text-green-300' : 'text-green-700',
      border: isDark ? 'border-green-800' : 'border-green-200',
    },
    D: {
      bg: isDark ? 'bg-red-900' : 'bg-red-100',
      text: isDark ? 'text-red-300' : 'text-red-700',
      border: isDark ? 'border-red-800' : 'border-red-200',
    },
    U: {
      bg: isDark ? 'bg-gray-800' : 'bg-gray-100',
      text: isDark ? 'text-gray-300' : 'text-gray-700',
      border: isDark ? 'border-gray-600' : 'border-gray-300',
    },
  };

  return baseClasses[status] || baseClasses['U'];
};

export const getDiffLineClass = (line: any, isDark = false) => {
  const isAddition = line.startsWith('+') && !line.startsWith('+++');
  const isDeletion = line.startsWith('-') && !line.startsWith('---');
  const isHeader = line.startsWith('@@');

  if (isAddition) {
    return isDark
      ? 'bg-green-950 text-green-300'
      : 'bg-green-50 text-green-700';
  }
  if (isDeletion) {
    return isDark ? 'bg-red-950 text-red-300' : 'bg-red-50 text-red-700';
  }
  if (isHeader) {
    return isDark ? 'bg-blue-950 text-blue-300' : 'bg-blue-50 text-blue-700';
  }

  return isDark ? 'text-gray-400' : 'text-gray-600';
};
