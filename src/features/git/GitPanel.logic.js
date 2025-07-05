// Git API logic functions
export const gitApi = {
  async fetchStatus(projectName) {
    const response = await fetch(`/api/git/status?project=${encodeURIComponent(projectName)}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Git status error:', data.error);
      return null;
    }
    
    return data;
  },

  async fetchBranches(projectName) {
    const response = await fetch(`/api/git/branches?project=${encodeURIComponent(projectName)}`);
    const data = await response.json();
    
    if (data.error || !data.branches) {
      return [];
    }
    
    return data.branches;
  },

  async switchBranch(projectName, branchName) {
    const response = await fetch('/api/git/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: projectName,
        branch: branchName
      })
    });
    
    const data = await response.json();
    return data;
  },

  async createBranch(projectName, branchName) {
    const response = await fetch('/api/git/create-branch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: projectName,
        branch: branchName.trim()
      })
    });
    
    const data = await response.json();
    return data;
  },

  async fetchFileDiff(projectName, filePath) {
    const response = await fetch(`/api/git/diff?project=${encodeURIComponent(projectName)}&file=${encodeURIComponent(filePath)}`);
    const data = await response.json();
    
    if (!data.error && data.diff) {
      return data.diff;
    }
    
    return null;
  },

  async fetchRecentCommits(projectName, limit = 10) {
    const response = await fetch(`/api/git/commits?project=${encodeURIComponent(projectName)}&limit=${limit}`);
    const data = await response.json();
    
    if (!data.error && data.commits) {
      return data.commits;
    }
    
    return [];
  },

  async fetchCommitDiff(projectName, commitHash) {
    const response = await fetch(`/api/git/commit-diff?project=${encodeURIComponent(projectName)}&commit=${commitHash}`);
    const data = await response.json();
    
    if (!data.error && data.diff) {
      return data.diff;
    }
    
    return null;
  },

  async generateCommitMessage(projectName, files) {
    const response = await fetch('/api/git/generate-commit-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: projectName,
        files: files
      })
    });
    
    const data = await response.json();
    return data;
  },

  async commit(projectName, message, files) {
    const response = await fetch('/api/git/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: projectName,
        message: message,
        files: files
      })
    });
    
    const data = await response.json();
    return data;
  }
};

// Utility functions
export const getStatusLabel = (status) => {
  switch (status) {
    case 'M': return 'Modified';
    case 'A': return 'Added';
    case 'D': return 'Deleted';
    case 'U': return 'Untracked';
    default: return status;
  }
};

export const getStatusColorClasses = (status, isDark = false) => {
  const baseClasses = {
    'M': {
      bg: isDark ? 'bg-yellow-900' : 'bg-yellow-100',
      text: isDark ? 'text-yellow-300' : 'text-yellow-700',
      border: isDark ? 'border-yellow-800' : 'border-yellow-200'
    },
    'A': {
      bg: isDark ? 'bg-green-900' : 'bg-green-100',
      text: isDark ? 'text-green-300' : 'text-green-700',
      border: isDark ? 'border-green-800' : 'border-green-200'
    },
    'D': {
      bg: isDark ? 'bg-red-900' : 'bg-red-100',
      text: isDark ? 'text-red-300' : 'text-red-700',
      border: isDark ? 'border-red-800' : 'border-red-200'
    },
    'U': {
      bg: isDark ? 'bg-gray-800' : 'bg-gray-100',
      text: isDark ? 'text-gray-300' : 'text-gray-700',
      border: isDark ? 'border-gray-600' : 'border-gray-300'
    }
  };
  
  return baseClasses[status] || baseClasses['U'];
};

export const getDiffLineClass = (line, isDark = false) => {
  const isAddition = line.startsWith('+') && !line.startsWith('+++');
  const isDeletion = line.startsWith('-') && !line.startsWith('---');
  const isHeader = line.startsWith('@@');
  
  if (isAddition) {
    return isDark ? 'bg-green-950 text-green-300' : 'bg-green-50 text-green-700';
  }
  if (isDeletion) {
    return isDark ? 'bg-red-950 text-red-300' : 'bg-red-50 text-red-700';
  }
  if (isHeader) {
    return isDark ? 'bg-blue-950 text-blue-300' : 'bg-blue-50 text-blue-700';
  }
  
  return isDark ? 'text-gray-400' : 'text-gray-600';
};