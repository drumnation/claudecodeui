import {Router} from 'express';
import type {Request, Response} from 'express';
import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

export const createGitRoutes = (): Router => {
  const router = Router();

  // Get git status
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const {path: repoPath} = req.query;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      // Get current branch
      const {stdout: branchOut} = await execAsync('git rev-parse --abbrev-ref HEAD', {
        cwd: repoPath,
      });
      const branch = branchOut.trim();

      // Get status
      const {stdout} = await execAsync('git status --porcelain', {
        cwd: repoPath,
      });
      
      const modified: string[] = [];
      const added: string[] = [];
      const deleted: string[] = [];
      const untracked: string[] = [];

      stdout
        .split('\n')
        .filter(Boolean)
        .forEach((line) => {
          const status = line.substring(0, 2);
          const filePath = line.substring(3);
          
          if (status === ' M' || status === 'M ' || status === 'MM') {
            modified.push(filePath);
          } else if (status === 'A ' || status === 'AM') {
            added.push(filePath);
          } else if (status === ' D' || status === 'D ') {
            deleted.push(filePath);
          } else if (status === '??') {
            untracked.push(filePath);
          } else if (status.includes('M')) {
            modified.push(filePath);
          }
        });

      res.json({
        branch,
        modified,
        added,
        deleted,
        untracked,
      });
    } catch (error: any) {
      console.error('Git status error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Get current branch
  router.get('/branch', async (req: Request, res: Response) => {
    try {
      const {path: repoPath} = req.query;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      const {stdout} = await execAsync('git rev-parse --abbrev-ref HEAD', {
        cwd: repoPath,
      });
      res.json({branch: stdout.trim()});
    } catch (error: any) {
      console.error('Git branch error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Get commit log
  router.get('/log', async (req: Request, res: Response) => {
    try {
      const {path: repoPath, limit = 10} = req.query;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      const {stdout} = await execAsync(
        `git log --pretty=format:'%H|%an|%ae|%ad|%s' -n ${limit}`,
        {cwd: repoPath},
      );

      const commits = stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [hash, author, email, date, message] = line.split('|');
          return {hash, author, email, date, message};
        });

      res.json({commits});
    } catch (error: any) {
      console.error('Git log error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Get all branches
  router.get('/branches', async (req: Request, res: Response) => {
    try {
      const {path: repoPath} = req.query;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      const {stdout} = await execAsync('git branch -a', {cwd: repoPath});
      const branches = stdout
        .split('\n')
        .filter(Boolean)
        .map((branch) => branch.trim().replace(/^\*\s*/, ''))
        .filter((branch) => !branch.includes('->'));

      res.json({branches});
    } catch (error: any) {
      console.error('Git branches error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Get commits (alias for log)
  router.get('/commits', async (req: Request, res: Response) => {
    try {
      const {path: repoPath, limit = 10} = req.query;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      const {stdout} = await execAsync(
        `git log --pretty=format:'%H|%an|%ae|%ad|%s' -n ${limit}`,
        {cwd: repoPath},
      );

      const commits = stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [hash, author, email, date, message] = line.split('|');
          return {hash, author, email, date, message};
        });

      res.json({commits});
    } catch (error: any) {
      console.error('Git commits error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Get diff for a file
  router.get('/diff', async (req: Request, res: Response) => {
    try {
      const {path: repoPath, file} = req.query;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      const command = file ? `git diff -- "${file}"` : 'git diff';

      const {stdout} = await execAsync(command, {cwd: repoPath});
      res.json({diff: stdout});
    } catch (error: any) {
      console.error('Git diff error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Get commit diff
  router.get('/commit-diff', async (req: Request, res: Response) => {
    try {
      const {path: repoPath, commit} = req.query;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      if (!commit || typeof commit !== 'string') {
        return res.status(400).json({error: 'Commit hash is required'});
      }

      const {stdout} = await execAsync(`git show --format="" ${commit}`, {
        cwd: repoPath,
      });

      res.json({diff: stdout});
    } catch (error: any) {
      console.error('Git commit-diff error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Checkout branch
  router.post('/checkout', async (req: Request, res: Response) => {
    const {path: repoPath, branch, force = false} = req.body;

    try {
      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      if (!branch || typeof branch !== 'string') {
        return res.status(400).json({error: 'Branch name is required'});
      }

      // Check for uncommitted changes
      if (!force) {
        try {
          const {stdout: statusOut} = await execAsync('git status --porcelain', {cwd: repoPath});
          if (statusOut.trim()) {
            return res.status(400).json({
              error: 'Cannot switch branch: You have uncommitted changes. Please commit or stash them before switching branches.',
              hasUncommittedChanges: true
            });
          }
        } catch (statusError: any) {
          console.error('Error checking git status:', statusError);
        }
      }

      await execAsync(`git checkout "${branch}"`, {cwd: repoPath});
      res.json({success: true, branch});
    } catch (error: any) {
      console.error('Git checkout error:', error);
      // Enhance error message for common issues
      let errorMessage = error.message;
      if (error.message.includes('pathspec') && error.message.includes('did not match')) {
        errorMessage = `Branch '${branch}' does not exist`;
      } else if (error.message.includes('Your local changes')) {
        errorMessage = 'Cannot switch branch: You have uncommitted changes. Please commit or stash them before switching branches.';
      }
      res.status(500).json({error: errorMessage});
    }
  });

  // Create new branch
  router.post('/create-branch', async (req: Request, res: Response) => {
    try {
      const {path: repoPath, branch} = req.body;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      if (!branch || typeof branch !== 'string') {
        return res.status(400).json({error: 'Branch name is required'});
      }

      await execAsync(`git checkout -b "${branch}"`, {cwd: repoPath});
      res.json({success: true, branch});
    } catch (error: any) {
      console.error('Git create-branch error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Commit changes
  router.post('/commit', async (req: Request, res: Response) => {
    try {
      const {path: repoPath, message, files} = req.body;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      if (!message || typeof message !== 'string') {
        return res.status(400).json({error: 'Commit message is required'});
      }

      // Add files to staging
      if (files && Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          await execAsync(`git add "${file}"`, {cwd: repoPath});
        }
      }

      // Commit with message
      const {stdout} = await execAsync(
        `git commit -m "${message.replace(/"/g, '\\"')}"`,
        {cwd: repoPath},
      );

      res.json({success: true, output: stdout});
    } catch (error: any) {
      console.error('Git commit error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Generate commit message (stub - would need AI integration)
  router.post(
    '/generate-commit-message',
    async (req: Request, res: Response) => {
      try {
        const {path: repoPath} = req.body;

        if (!repoPath || typeof repoPath !== 'string') {
          return res.status(400).json({error: 'Repository path is required'});
        }

        // Get staged changes
        const {stdout} = await execAsync('git diff --cached --name-status', {
          cwd: repoPath,
        });

        const files = stdout.split('\n').filter(Boolean);
        if (files.length === 0) {
          return res.json({message: 'No changes to commit'});
        }

        // Simple heuristic for commit message
        const addedFiles = files.filter((f) => f.startsWith('A')).length;
        const modifiedFiles = files.filter((f) => f.startsWith('M')).length;
        const deletedFiles = files.filter((f) => f.startsWith('D')).length;

        let message = '';
        if (addedFiles > 0) message += `Add ${addedFiles} file(s)`;
        if (modifiedFiles > 0) {
          if (message) message += ', ';
          message += `update ${modifiedFiles} file(s)`;
        }
        if (deletedFiles > 0) {
          if (message) message += ', ';
          message += `remove ${deletedFiles} file(s)`;
        }

        res.json({message: message || 'Update files'});
      } catch (error: any) {
        console.error('Git generate-commit-message error:', error);
        res.status(500).json({error: error.message});
      }
    },
  );

  // Stash changes
  router.post('/stash', async (req: Request, res: Response) => {
    try {
      const {path: repoPath, message = 'Auto-stash'} = req.body;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      // Create stash with message
      const {stdout} = await execAsync(
        `git stash push -m "${message.replace(/"/g, '\\"')}"`,
        {cwd: repoPath}
      );

      res.json({success: true, output: stdout});
    } catch (error: any) {
      console.error('Git stash error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // Apply stash
  router.post('/stash/apply', async (req: Request, res: Response) => {
    try {
      const {path: repoPath, stashIndex = 0} = req.body;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      const {stdout} = await execAsync(`git stash apply stash@{${stashIndex}}`, {
        cwd: repoPath,
      });

      res.json({success: true, output: stdout});
    } catch (error: any) {
      console.error('Git stash apply error:', error);
      res.status(500).json({error: error.message});
    }
  });

  // List stashes
  router.get('/stash/list', async (req: Request, res: Response) => {
    try {
      const {path: repoPath} = req.query;

      if (!repoPath || typeof repoPath !== 'string') {
        return res.status(400).json({error: 'Repository path is required'});
      }

      const {stdout} = await execAsync('git stash list', {cwd: repoPath});
      const stashes = stdout
        .split('\n')
        .filter(Boolean)
        .map((line, index) => {
          const match = line.match(/^(stash@\{\d+\}): (.+)$/);
          return {
            index,
            name: match ? match[1] : `stash@{${index}}`,
            message: match ? match[2] : line,
          };
        });

      res.json({stashes});
    } catch (error: any) {
      console.error('Git stash list error:', error);
      res.status(500).json({error: error.message});
    }
  });

  return router;
};
