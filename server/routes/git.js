const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();
const execAsync = promisify(exec);

// Helper function to get the actual project path from the encoded project name
async function getActualProjectPath(projectName) {
  const { getProjects } = require('../projects');
  
  // Normalize the project name by removing leading dashes
  const normalizedProjectName = projectName.replace(/^-/, '');
  console.log('🔍 Normalizing project name:', projectName, '->', normalizedProjectName);
  
  // Get all projects to find the actual path
  const projects = await getProjects();
  const project = projects.find(p => p.name === normalizedProjectName || p.name === projectName);
  
  if (project && project.fullPath) {
    // Check if the path exists, if not try case variations
    try {
      await require('fs').promises.access(project.fullPath);
      return project.fullPath;
    } catch {
      // Try case variations
      const variations = [
        project.fullPath,
        project.fullPath.replace('/Dev/', '/dev/'),
        project.fullPath.replace('/dev/', '/Dev/')
      ];
      
      for (const variation of variations) {
        try {
          await require('fs').promises.access(variation);
          return variation;
        } catch {
          // Continue to next variation
        }
      }
    }
  }
  
  // Fallback to simple conversion if project not found
  // Claude stores projects with dashes instead of slashes
  // Handle both formats: with and without leading dash
  const cleanedName = projectName.replace(/^-/, '');
  const simplePath = '/' + cleanedName.replace(/-/g, '/');
  console.log('🔍 Fallback path resolution:', projectName, '->', simplePath);
  
  // Try case variations for the simple path too
  const variations = [
    simplePath,
    simplePath.replace('/Dev/', '/dev/'),
    simplePath.replace('/dev/', '/Dev/')
  ];
  
  for (const variation of variations) {
    try {
      await require('fs').promises.access(variation);
      return variation;
    } catch {
      // Continue to next variation
    }
  }
  
  return simplePath; // Return the original if nothing works
}

// Get git status for a project
router.get('/status', async (req, res) => {
  const { project } = req.query;
  
  console.log('🔍 Git status endpoint called');
  console.log('  Query params:', req.query);
  console.log('  Project param:', project);
  
  if (!project) {
    console.error('❌ Git status: No project name provided');
    return res.status(400).json({ error: 'Project name is required' });
  }

  // Validate project parameter format
  if (typeof project !== 'string' || project.length === 0) {
    console.error('❌ Git status: Invalid project parameter format:', project);
    return res.status(400).json({ error: 'Invalid project parameter format' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    console.log('🎯 Git status request');
    console.log('  Original project param:', project);
    console.log('  Resolved path:', projectPath);
    console.log('  Current working directory:', process.cwd());
    
    // Check if directory exists
    try {
      await fs.access(projectPath);
      console.log('✅ Directory exists:', projectPath);
    } catch (err) {
      console.error('❌ Project path not found:', projectPath);
      console.error('  Error details:', err.message);
      return res.json({ error: `Project directory not found: ${projectPath}. Please ensure the project exists and is accessible.` });
    }

    // Check if it's a git repository
    try {
      await execAsync('git rev-parse --git-dir', { cwd: projectPath });
    } catch (err) {
      console.error('❌ Not a git repository:', projectPath);
      console.error('  Error details:', err.message);
      return res.json({ error: `Not a git repository: ${projectPath}. Initialize with 'git init' to use version control.` });
    }

    // Get current branch
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
    
    // Get git status
    const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: projectPath });
    console.log('📋 Git status output length:', statusOutput.length);
    console.log('📋 Git status raw output:', statusOutput ? statusOutput.substring(0, 200) : 'EMPTY');
    
    const modified = [];
    const added = [];
    const deleted = [];
    const untracked = [];
    
    statusOutput.split('\n').forEach(line => {
      if (!line.trim()) return;
      
      const status = line.substring(0, 2);
      const file = line.substring(3);
      
      console.log(`  File: "${file}" Status: "${status}"`);
      
      if (status === 'M ' || status === ' M' || status === 'MM') {
        modified.push(file);
      } else if (status === 'A ' || status === 'AM') {
        added.push(file);
      } else if (status === 'D ' || status === ' D') {
        deleted.push(file);
      } else if (status === '??') {
        untracked.push(file);
      }
    });
    
    console.log('📊 Git status summary:', {
      modified: modified.length,
      added: added.length,
      deleted: deleted.length,
      untracked: untracked.length
    });
    
    res.json({
      branch: branch.trim(),
      modified,
      added,
      deleted,
      untracked
    });
  } catch (error) {
    console.error('Git status error:', error);
    res.json({ error: error.message });
  }
});

// Get diff for a specific file
router.get('/diff', async (req, res) => {
  const { project, file } = req.query;
  
  if (!project || !file) {
    return res.status(400).json({ error: 'Project name and file path are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Check if file is untracked
    const { stdout: statusOutput } = await execAsync(`git status --porcelain "${file}"`, { cwd: projectPath });
    const isUntracked = statusOutput.startsWith('??');
    
    let diff;
    if (isUntracked) {
      // For untracked files, show the entire file content as additions
      const fileContent = await fs.readFile(path.join(projectPath, file), 'utf-8');
      const lines = fileContent.split('\n');
      diff = `--- /dev/null\n+++ b/${file}\n@@ -0,0 +1,${lines.length} @@\n` + 
             lines.map(line => `+${line}`).join('\n');
    } else {
      // Get diff for tracked files
      const { stdout } = await execAsync(`git diff HEAD -- "${file}"`, { cwd: projectPath });
      diff = stdout || '';
      
      // If no unstaged changes, check for staged changes
      if (!diff) {
        const { stdout: stagedDiff } = await execAsync(`git diff --cached -- "${file}"`, { cwd: projectPath });
        diff = stagedDiff;
      }
    }
    
    res.json({ diff });
  } catch (error) {
    console.error('Git diff error:', error);
    res.json({ error: error.message });
  }
});

// Commit changes
router.post('/commit', async (req, res) => {
  const { project, message, files } = req.body;
  
  if (!project || !message || !files || files.length === 0) {
    return res.status(400).json({ error: 'Project name, commit message, and files are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Stage selected files
    for (const file of files) {
      await execAsync(`git add "${file}"`, { cwd: projectPath });
    }
    
    // Commit with message
    const { stdout } = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: projectPath });
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Git commit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get list of branches
router.get('/branches', async (req, res) => {
  const { project } = req.query;
  
  if (!project) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    console.log('Git branches for project:', project, '-> path:', projectPath);
    
    // Get all branches
    const { stdout } = await execAsync('git branch -a', { cwd: projectPath });
    
    // Parse branches
    const branches = stdout
      .split('\n')
      .map(branch => branch.trim())
      .filter(branch => branch && !branch.includes('->')) // Remove empty lines and HEAD pointer
      .map(branch => {
        // Remove asterisk from current branch
        if (branch.startsWith('* ')) {
          return branch.substring(2);
        }
        // Remove remotes/ prefix
        if (branch.startsWith('remotes/origin/')) {
          return branch.substring(15);
        }
        return branch;
      })
      .filter((branch, index, self) => self.indexOf(branch) === index); // Remove duplicates
    
    res.json({ branches });
  } catch (error) {
    console.error('Git branches error:', error);
    res.json({ error: error.message });
  }
});

// Checkout branch
router.post('/checkout', async (req, res) => {
  const { project, branch } = req.body;
  
  if (!project || !branch) {
    return res.status(400).json({ error: 'Project name and branch are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Checkout the branch
    const { stdout } = await execAsync(`git checkout "${branch}"`, { cwd: projectPath });
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Git checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new branch
router.post('/create-branch', async (req, res) => {
  const { project, branch } = req.body;
  
  if (!project || !branch) {
    return res.status(400).json({ error: 'Project name and branch name are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Create and checkout new branch
    const { stdout } = await execAsync(`git checkout -b "${branch}"`, { cwd: projectPath });
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Git create branch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent commits
router.get('/commits', async (req, res) => {
  const { project, limit = 10 } = req.query;
  
  if (!project) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Get commit log with stats
    const { stdout } = await execAsync(
      `git log --pretty=format:'%H|%an|%ae|%ad|%s' --date=relative -n ${limit}`,
      { cwd: projectPath }
    );
    
    const commits = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, author, email, date, ...messageParts] = line.split('|');
        return {
          hash,
          author,
          email,
          date,
          message: messageParts.join('|')
        };
      });
    
    // Get stats for each commit
    for (const commit of commits) {
      try {
        const { stdout: stats } = await execAsync(
          `git show --stat --format='' ${commit.hash}`,
          { cwd: projectPath }
        );
        commit.stats = stats.trim().split('\n').pop(); // Get the summary line
      } catch (error) {
        commit.stats = '';
      }
    }
    
    res.json({ commits });
  } catch (error) {
    console.error('Git commits error:', error);
    res.json({ error: error.message });
  }
});

// Get diff for a specific commit
router.get('/commit-diff', async (req, res) => {
  const { project, commit } = req.query;
  
  if (!project || !commit) {
    return res.status(400).json({ error: 'Project name and commit hash are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Get diff for the commit
    const { stdout } = await execAsync(
      `git show ${commit}`,
      { cwd: projectPath }
    );
    
    res.json({ diff: stdout });
  } catch (error) {
    console.error('Git commit diff error:', error);
    res.json({ error: error.message });
  }
});

// Generate commit message based on staged changes
router.post('/generate-commit-message', async (req, res) => {
  const { project, files } = req.body;
  
  if (!project || !files || files.length === 0) {
    return res.status(400).json({ error: 'Project name and files are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Get diff for selected files
    let combinedDiff = '';
    for (const file of files) {
      try {
        const { stdout } = await execAsync(
          `git diff HEAD -- "${file}"`,
          { cwd: projectPath }
        );
        if (stdout) {
          combinedDiff += `\n--- ${file} ---\n${stdout}`;
        }
      } catch (error) {
        console.error(`Error getting diff for ${file}:`, error);
      }
    }
    
    // Use AI to generate commit message (simple implementation)
    // In a real implementation, you might want to use GPT or Claude API
    const message = generateSimpleCommitMessage(files, combinedDiff);
    
    res.json({ message });
  } catch (error) {
    console.error('Generate commit message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple commit message generator (can be replaced with AI)
function generateSimpleCommitMessage(files, diff) {
  const fileCount = files.length;
  const isMultipleFiles = fileCount > 1;
  
  // Analyze the diff to determine the type of change
  const additions = (diff.match(/^\+[^+]/gm) || []).length;
  const deletions = (diff.match(/^-[^-]/gm) || []).length;
  
  // Determine the primary action
  let action = 'Update';
  if (additions > 0 && deletions === 0) {
    action = 'Add';
  } else if (deletions > 0 && additions === 0) {
    action = 'Remove';
  } else if (additions > deletions * 2) {
    action = 'Enhance';
  } else if (deletions > additions * 2) {
    action = 'Refactor';
  }
  
  // Generate message based on files
  if (isMultipleFiles) {
    const components = new Set(files.map(f => {
      const parts = f.split('/');
      return parts[parts.length - 2] || parts[0];
    }));
    
    if (components.size === 1) {
      return `${action} ${[...components][0]} component`;
    } else {
      return `${action} multiple components`;
    }
  } else {
    const fileName = files[0].split('/').pop();
    const componentName = fileName.replace(/\.(jsx?|tsx?|css|scss)$/, '');
    return `${action} ${componentName}`;
  }
}

// Create new git worktree
router.post('/worktree/create', async (req, res) => {
  const { project, featureName, customPath } = req.body;
  
  if (!project || !featureName) {
    return res.status(400).json({ error: 'Project name and feature name are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Validate project is a git repository
    try {
      await execAsync('git rev-parse --git-dir', { cwd: projectPath });
    } catch (err) {
      return res.status(400).json({ error: `Not a git repository: ${projectPath}` });
    }

    // Generate worktree path
    const projectDir = path.dirname(projectPath);
    const projectName = path.basename(projectPath);
    const worktreePath = customPath || path.join(projectDir, `${projectName}-${featureName}`);
    
    console.log('Creating worktree:', {
      project,
      featureName,
      projectPath,
      worktreePath
    });

    // Check if worktree path already exists
    try {
      await fs.access(worktreePath);
      return res.status(400).json({ error: `Directory already exists: ${worktreePath}` });
    } catch {
      // Path doesn't exist, which is good
    }

    // Create worktree with new branch
    const { stdout } = await execAsync(
      `git worktree add -b "${featureName}" "${worktreePath}"`,
      { cwd: projectPath }
    );
    
    console.log('Worktree created successfully:', stdout);
    
    res.json({
      success: true,
      fullPath: worktreePath,
      branch: featureName,
      output: stdout
    });
  } catch (error) {
    console.error('Create worktree error:', error);
    
    // Handle specific git errors
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: `Branch '${featureName}' already exists` });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Remove git worktree
router.delete('/worktree/remove', async (req, res) => {
  const { project, worktreePath } = req.body;
  
  if (!project || !worktreePath) {
    return res.status(400).json({ error: 'Project name and worktree path are required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    console.log('Removing worktree:', {
      project,
      projectPath,
      worktreePath
    });

    // Remove worktree
    const { stdout } = await execAsync(
      `git worktree remove "${worktreePath}"`,
      { cwd: projectPath }
    );
    
    console.log('Worktree removed successfully:', stdout);
    
    res.json({
      success: true,
      output: stdout
    });
  } catch (error) {
    console.error('Remove worktree error:', error);
    
    // Handle specific git errors
    if (error.message.includes('is dirty')) {
      return res.status(400).json({ 
        error: 'Worktree has uncommitted changes. Please commit or stash changes before removing.' 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Create pull request
router.post('/pr/create', async (req, res) => {
  const { project, targetBranch = 'main' } = req.body;
  
  if (!project) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const projectPath = await getActualProjectPath(project);
    
    // Get current branch
    const { stdout: currentBranch } = await execAsync(
      'git rev-parse --abbrev-ref HEAD',
      { cwd: projectPath }
    );
    
    const branch = currentBranch.trim();
    
    if (branch === targetBranch) {
      return res.status(400).json({ 
        error: `Cannot create PR from ${targetBranch} to ${targetBranch}` 
      });
    }

    console.log('Creating PR:', {
      project,
      currentBranch: branch,
      targetBranch,
      projectPath
    });

    // Push the branch to origin
    try {
      const { stdout: pushOutput } = await execAsync(
        `git push -u origin "${branch}"`,
        { cwd: projectPath }
      );
      console.log('Branch pushed successfully:', pushOutput);
    } catch (pushError) {
      console.error('Push error:', pushError);
      return res.status(500).json({ 
        error: `Failed to push branch: ${pushError.message}` 
      });
    }

    // Get remote URL to construct PR URL
    try {
      const { stdout: remoteUrl } = await execAsync(
        'git remote get-url origin',
        { cwd: projectPath }
      );
      
      const url = remoteUrl.trim();
      let prUrl = '';
      
      // Parse GitHub URL
      if (url.includes('github.com')) {
        const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (match) {
          const [, owner, repo] = match;
          prUrl = `https://github.com/${owner}/${repo}/compare/${targetBranch}...${branch}`;
        }
      }
      // Parse GitLab URL
      else if (url.includes('gitlab.com')) {
        const match = url.match(/gitlab\.com[:/]([^/]+)\/([^/.]+)/);
        if (match) {
          const [, owner, repo] = match;
          prUrl = `https://gitlab.com/${owner}/${repo}/-/merge_requests/new?merge_request[source_branch]=${branch}&merge_request[target_branch]=${targetBranch}`;
        }
      }
      
      res.json({
        success: true,
        prUrl,
        pushedBranch: branch,
        targetBranch,
        remoteUrl: url
      });
    } catch (remoteError) {
      console.error('Remote URL error:', remoteError);
      res.json({
        success: true,
        pushedBranch: branch,
        targetBranch,
        message: 'Branch pushed successfully, but could not determine remote URL for PR creation'
      });
    }
  } catch (error) {
    console.error('Create PR error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;