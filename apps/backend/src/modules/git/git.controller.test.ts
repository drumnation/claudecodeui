import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { execSync } from 'child_process';
import { 
  handleGitStatus, 
  handleGitBranches, 
  handleGitDiff, 
  handleGitCommit, 
  handleGitCheckout, 
  handleGitCreateBranch 
} from './git.controller';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn(),
  exec: vi.fn(),
}));

// Mock util promisify
vi.mock('util', () => ({
  promisify: vi.fn((fn) => fn),
}));

// Mock logger
vi.mock('@kit/logger/node', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    isLevelEnabled: vi.fn().mockReturnValue(true)
  }))
}));

describe('Git Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReq = {
      params: { projectName: 'test-project' },
      body: {},
      query: {},
    };

    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleGitStatus', () => {
    it('should return git status successfully', async () => {
      const mockGitStatus = 'M  file1.txt\nA  file2.txt\n';
      (execSync as any).mockReturnValue(mockGitStatus);

      await handleGitStatus(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        status: mockGitStatus
      });
    });

    it('should handle git status errors', async () => {
      (execSync as any).mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      await handleGitStatus(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not a git repository'
      });
    });
  });

  describe('handleGitBranches', () => {
    it('should return git branches successfully', async () => {
      const mockBranches = '  main\n* feature-branch\n  development\n';
      (execSync as any).mockReturnValue(mockBranches);

      await handleGitBranches(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        branches: expect.arrayContaining([
          expect.objectContaining({ name: 'main', current: false }),
          expect.objectContaining({ name: 'feature-branch', current: true }),
          expect.objectContaining({ name: 'development', current: false }),
        ])
      });
    });

    it('should handle git branches errors', async () => {
      (execSync as any).mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      await handleGitBranches(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not a git repository'
      });
    });
  });

  describe('handleGitDiff', () => {
    it('should return git diff successfully', async () => {
      const mockDiff = 'diff --git a/file.txt b/file.txt\n+added line\n-removed line\n';
      (execSync as any).mockReturnValue(mockDiff);

      await handleGitDiff(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        diff: mockDiff
      });
    });

    it('should handle specific file diff', async () => {
      mockReq.query = { file: 'src/app.ts' };
      const mockDiff = 'diff --git a/src/app.ts b/src/app.ts\n+new code\n';
      (execSync as any).mockReturnValue(mockDiff);

      await handleGitDiff(mockReq as Request, mockRes as Response);

      expect(execSync).toHaveBeenCalledWith(
        'git diff src/app.ts',
        expect.objectContaining({
          cwd: expect.stringContaining('test-project'),
          encoding: 'utf8'
        })
      );
    });

    it('should handle git diff errors', async () => {
      (execSync as any).mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      await handleGitDiff(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not a git repository'
      });
    });
  });

  describe('handleGitCommit', () => {
    it('should commit changes successfully', async () => {
      mockReq.body = { message: 'feat: add new feature' };
      const mockCommitResult = '[main abc123] feat: add new feature\n 1 file changed, 1 insertion(+)\n';
      (execSync as any).mockReturnValue(mockCommitResult);

      await handleGitCommit(mockReq as Request, mockRes as Response);

      expect(execSync).toHaveBeenCalledWith(
        'git add . && git commit -m "feat: add new feature"',
        expect.objectContaining({
          cwd: expect.stringContaining('test-project'),
          encoding: 'utf8'
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        result: mockCommitResult
      });
    });

    it('should handle missing commit message', async () => {
      mockReq.body = {};

      await handleGitCommit(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Commit message is required'
      });
    });

    it('should handle git commit errors', async () => {
      mockReq.body = { message: 'test commit' };
      (execSync as any).mockImplementation(() => {
        throw new Error('No changes to commit');
      });

      await handleGitCommit(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'No changes to commit'
      });
    });
  });

  describe('handleGitCheckout', () => {
    it('should checkout branch successfully', async () => {
      mockReq.body = { branch: 'feature-branch' };
      const mockCheckoutResult = 'Switched to branch "feature-branch"\n';
      (execSync as any).mockReturnValue(mockCheckoutResult);

      await handleGitCheckout(mockReq as Request, mockRes as Response);

      expect(execSync).toHaveBeenCalledWith(
        'git checkout feature-branch',
        expect.objectContaining({
          cwd: expect.stringContaining('test-project'),
          encoding: 'utf8'
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        result: mockCheckoutResult
      });
    });

    it('should handle missing branch name', async () => {
      mockReq.body = {};

      await handleGitCheckout(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Branch name is required'
      });
    });

    it('should handle git checkout errors', async () => {
      mockReq.body = { branch: 'non-existent-branch' };
      (execSync as any).mockImplementation(() => {
        throw new Error('pathspec did not match any file(s) known to git');
      });

      await handleGitCheckout(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'pathspec did not match any file(s) known to git'
      });
    });
  });

  describe('handleGitCreateBranch', () => {
    it('should create and checkout new branch successfully', async () => {
      mockReq.body = { branch: 'new-feature' };
      const mockCreateResult = 'Switched to a new branch "new-feature"\n';
      (execSync as any).mockReturnValue(mockCreateResult);

      await handleGitCreateBranch(mockReq as Request, mockRes as Response);

      expect(execSync).toHaveBeenCalledWith(
        'git checkout -b new-feature',
        expect.objectContaining({
          cwd: expect.stringContaining('test-project'),
          encoding: 'utf8'
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        result: mockCreateResult
      });
    });

    it('should handle missing branch name', async () => {
      mockReq.body = {};

      await handleGitCreateBranch(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Branch name is required'
      });
    });

    it('should handle git create branch errors', async () => {
      mockReq.body = { branch: 'existing-branch' };
      (execSync as any).mockImplementation(() => {
        throw new Error('A branch named "existing-branch" already exists');
      });

      await handleGitCreateBranch(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'A branch named "existing-branch" already exists'
      });
    });
  });
});