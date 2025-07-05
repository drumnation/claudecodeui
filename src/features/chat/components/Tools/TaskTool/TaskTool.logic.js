/**
 * Parse the task content to extract structured information
 * @param {Object} taskData - The task tool data
 * @returns {Object} Parsed task information
 */
export const parseTaskContent = (taskData) => {
  if (!taskData || !taskData.prompt) {
    return {
      description: taskData?.description || 'Task',
      prompt: '',
      files: [],
      requirements: [],
      rawPrompt: taskData?.prompt || ''
    };
  }

  const prompt = taskData.prompt;
  const lines = prompt.split('\n');
  
  // Extract files to create
  const files = [];
  const fileRegex = /^\d+\.\s+(src\/[^\s]+(?:\.jsx?|\.ts|\.js))/gm;
  let match;
  while ((match = fileRegex.exec(prompt)) !== null) {
    files.push(match[1]);
  }

  // Extract key requirements
  const requirements = [];
  const requirementPatterns = [
    /- (Preserve .+)/g,
    /- (Add .+)/g,
    /- (Convert .+)/g,
    /- (Move .+)/g,
    /- (Extract .+)/g,
    /- (Update .+)/g,
  ];

  requirementPatterns.forEach(pattern => {
    let reqMatch;
    while ((reqMatch = pattern.exec(prompt)) !== null) {
      requirements.push(reqMatch[1]);
    }
  });

  return {
    description: taskData.description || 'Task',
    prompt: lines.slice(0, 5).join('\n') + (lines.length > 5 ? '...' : ''),
    files,
    requirements: requirements.slice(0, 5), // Show first 5 requirements
    rawPrompt: prompt
  };
};

/**
 * Get appropriate icon based on task type
 * @param {string} description - Task description
 * @returns {string} Icon type
 */
export const getTaskIcon = (description) => {
  const desc = description.toLowerCase();
  
  if (desc.includes('refactor')) return 'refactor';
  if (desc.includes('fix') || desc.includes('bug')) return 'bug';
  if (desc.includes('test')) return 'test';
  if (desc.includes('search') || desc.includes('find')) return 'search';
  if (desc.includes('implement') || desc.includes('create')) return 'create';
  if (desc.includes('optimize')) return 'optimize';
  
  return 'task';
};

/**
 * Format timestamp for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time
 */
export const formatTaskTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
};