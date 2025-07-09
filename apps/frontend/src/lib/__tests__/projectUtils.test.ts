// @ts-expect-error TS(2792): Cannot find module 'vitest'. Did you mean to set t... Remove this comment to see the full error message
import {describe, it, expect} from 'vitest';
import {
  encodeProjectPath,
  decodeProjectPath,
  normalizeProjectId,
  isValidEncodedProjectName,
  getProjectNameFromPath,
} from '../projectUtils';

describe('projectUtils', () => {
  describe('encodeProjectPath', () => {
    it('should replace forward slashes with dashes', () => {
      const path = '/Users/dmieloch/Dev/experiments/cc-ui/claudecodeui';
      const encoded = encodeProjectPath(path);
      expect(encoded).toBe('Users-dmieloch-Dev-experiments-cc-ui-claudecodeui');
    });

    it('should remove leading slash', () => {
      const path = '/home/user/projects/myapp';
      const encoded = encodeProjectPath(path);
      expect(encoded).toBe('home-user-projects-myapp');
    });

    it('should handle paths without leading slash', () => {
      const path = 'Users/dmieloch/Dev/project';
      const encoded = encodeProjectPath(path);
      expect(encoded).toBe('Users-dmieloch-Dev-project');
    });

    it('should handle empty string', () => {
      const encoded = encodeProjectPath('');
      expect(encoded).toBe('');
    });

    it('should handle single slash', () => {
      const encoded = encodeProjectPath('/');
      expect(encoded).toBe('');
    });

    it('should handle paths with spaces', () => {
      const path = '/Users/name with spaces/my project';
      const encoded = encodeProjectPath(path);
      expect(encoded).toBe('Users-name with spaces-my project');
    });

    it('should handle paths with special characters', () => {
      const path = '/Users/user.name/project-123/sub_folder';
      const encoded = encodeProjectPath(path);
      expect(encoded).toBe('Users-user.name-project-123-sub_folder');
    });

    it('should handle Windows-style paths', () => {
      const path = 'C:/Users/dmieloch/projects/myapp';
      const encoded = encodeProjectPath(path);
      expect(encoded).toBe('C:-Users-dmieloch-projects-myapp');
    });

    it('should handle multiple consecutive slashes', () => {
      const path = '/Users//dmieloch///Dev/project';
      const encoded = encodeProjectPath(path);
      expect(encoded).toBe('Users--dmieloch---Dev-project');
    });

    it('should handle paths with trailing slash', () => {
      const path = '/Users/dmieloch/Dev/project/';
      const encoded = encodeProjectPath(path);
      expect(encoded).toBe('Users-dmieloch-Dev-project-');
    });
  });

  describe('decodeProjectPath', () => {
    it('should replace dashes with forward slashes', () => {
      const encoded = 'Users-dmieloch-Dev-experiments-cc-ui-claudecodeui';
      const decoded = decodeProjectPath(encoded);
      // Note: ALL dashes become slashes - this is a known limitation
      expect(decoded).toBe(
        '/Users/dmieloch/Dev/experiments/cc/ui/claudecodeui',
      );
    });

    it('should add leading slash', () => {
      const encoded = 'home-user-projects-myapp';
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe('/home/user/projects/myapp');
    });

    it('should handle empty string', () => {
      const decoded = decodeProjectPath('');
      expect(decoded).toBe('');
    });

    it('should handle encoded paths with spaces', () => {
      const encoded = 'Users-name with spaces-my project';
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe('/Users/name with spaces/my project');
    });

    it('should handle encoded paths with special characters', () => {
      const encoded = 'Users-user.name-project-123-sub_folder';
      const decoded = decodeProjectPath(encoded);
      // Note: ALL dashes become slashes - this is a known limitation
      expect(decoded).toBe('/Users/user.name/project/123/sub_folder');
    });

    it('should handle Windows-style encoded paths', () => {
      const encoded = 'C:-Users-dmieloch-projects-myapp';
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe('/C:/Users/dmieloch/projects/myapp');
    });

    it('should handle multiple consecutive dashes', () => {
      const encoded = 'Users--dmieloch---Dev-project';
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe('/Users//dmieloch///Dev/project');
    });

    it('should handle encoded paths with trailing dash', () => {
      const encoded = 'Users-dmieloch-Dev-project-';
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe('/Users/dmieloch/Dev/project/');
    });

    it('should handle leading dash format', () => {
      const encoded = '-Users-dmieloch-Dev-project';
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe('/Users/dmieloch/Dev/project');
    });
  });

  describe('round-trip encoding/decoding', () => {
    // Note: Round-trip is not perfect because dashes in original paths become slashes
    // This is by design - the encoding is lossy for paths containing dashes

    it('should correctly round-trip simple paths without dashes', () => {
      const paths = [
        '/Users/dmieloch/Dev/experiments/claudecodeui',
        '/home/user/projects/myapp',
        '/Users/username/Documents/Projects',
      ];

      paths.forEach((originalPath) => {
        const encoded = encodeProjectPath(originalPath);
        const decoded = decodeProjectPath(encoded);
        expect(decoded).toBe(originalPath);
      });
    });

    it('should handle paths with spaces correctly', () => {
      const path = '/Users/name with spaces/my project';
      const encoded = encodeProjectPath(path);
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe(path);
    });

    it('should handle empty paths', () => {
      expect(decodeProjectPath(encodeProjectPath(''))).toBe('');
    });

    it('should handle root path', () => {
      const encoded = encodeProjectPath('/');
      expect(encoded).toBe('');
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe('');
    });

    it('should normalize multiple slashes', () => {
      const path = '/Users//dmieloch///Dev/project';
      const encoded = encodeProjectPath(path);
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe('/Users//dmieloch///Dev/project');
    });

    it('should preserve trailing slashes', () => {
      const path = '/Users/dmieloch/Dev/project/';
      const encoded = encodeProjectPath(path);
      const decoded = decodeProjectPath(encoded);
      expect(decoded).toBe(path);
    });

    it('should demonstrate lossy encoding for paths with dashes', () => {
      // This test documents the known limitation
      const pathWithDashes = '/Users/user-name/project-123/sub-folder';
      const encoded = encodeProjectPath(pathWithDashes);
      const decoded = decodeProjectPath(encoded);
      // Dashes become slashes, so the path changes
      expect(decoded).toBe('/Users/user/name/project/123/sub/folder');
      expect(decoded).not.toBe(pathWithDashes);
    });
  });

  describe('edge cases', () => {
    it('should handle null input', () => {
      expect(encodeProjectPath(null)).toBe('');
      expect(decodeProjectPath(null)).toBe('');
    });

    it('should handle undefined input', () => {
      expect(encodeProjectPath(undefined)).toBe('');
      expect(decodeProjectPath(undefined)).toBe('');
    });

    it('should handle non-string input', () => {
      expect(encodeProjectPath(123)).toBe('');
      expect(decodeProjectPath(123)).toBe('');
    });
  });

  describe('real-world scenarios', () => {
    it('should encode current project path correctly', () => {
      const currentProjectPath =
        '/Users/dmieloch/Dev/experiments/cc-ui/claudecodeui';
      const encoded = encodeProjectPath(currentProjectPath);
      expect(encoded).toBe('Users-dmieloch-Dev-experiments-cc-ui-claudecodeui');
      expect(encoded).not.toContain('/');
      expect(encoded.startsWith('-')).toBe(false);
    });

    it('should handle macOS paths', () => {
      const macPaths = [
        '/Users/username/Documents/Projects/my-app',
        '/Applications/Visual Studio Code.app/Contents',
        '/System/Library/Frameworks/Foundation.framework',
      ];

      macPaths.forEach((path) => {
        const encoded = encodeProjectPath(path);
        expect(encoded).not.toContain('/');
        expect(encoded.startsWith('-')).toBe(false);
      });
    });

    it('should handle Linux paths', () => {
      const linuxPaths = [
        '/home/username/projects/webapp',
        '/var/www/html/mysite',
        '/opt/lampp/htdocs/project',
      ];

      linuxPaths.forEach((path) => {
        const encoded = encodeProjectPath(path);
        expect(encoded).not.toContain('/');
        expect(encoded.startsWith('-')).toBe(false);
      });
    });

    it('should handle deeply nested paths', () => {
      const deepPath = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z';
      const encoded = encodeProjectPath(deepPath);
      expect(encoded).toBe(
        'a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z',
      );
      expect(encoded.split('-').length).toBe(26);
    });
  });

  describe('normalizeProjectId', () => {
    it('should remove leading dash', () => {
      expect(normalizeProjectId('-Users-dmieloch-Dev')).toBe(
        'Users-dmieloch-Dev',
      );
    });

    it('should handle strings without leading dash', () => {
      expect(normalizeProjectId('Users-dmieloch-Dev')).toBe(
        'Users-dmieloch-Dev',
      );
    });

    it('should handle empty string', () => {
      expect(normalizeProjectId('')).toBe('');
    });

    it('should handle null/undefined/non-string', () => {
      expect(normalizeProjectId(null)).toBe('');
      expect(normalizeProjectId(undefined)).toBe('');
      expect(normalizeProjectId(123)).toBe('');
    });

    it('should only remove first dash', () => {
      expect(normalizeProjectId('--Users-dmieloch')).toBe('-Users-dmieloch');
    });
  });

  describe('isValidEncodedProjectName', () => {
    it('should accept valid encoded names', () => {
      expect(isValidEncodedProjectName('Users-dmieloch-Dev-project')).toBe(
        true,
      );
      expect(isValidEncodedProjectName('project-123')).toBe(true);
      expect(isValidEncodedProjectName('my_project')).toBe(true);
      expect(isValidEncodedProjectName('project.name')).toBe(true);
      expect(isValidEncodedProjectName('a-b-c')).toBe(true);
    });

    it('should reject invalid encoded names', () => {
      expect(isValidEncodedProjectName('project--name')).toBe(false); // consecutive dashes
      expect(isValidEncodedProjectName('project-')).toBe(false); // ends with dash
      expect(isValidEncodedProjectName('project name')).toBe(false); // contains space
      expect(isValidEncodedProjectName('project/name')).toBe(false); // contains slash
      expect(isValidEncodedProjectName('project@name')).toBe(false); // contains special char
    });

    it('should reject empty or invalid input', () => {
      expect(isValidEncodedProjectName('')).toBe(false);
      expect(isValidEncodedProjectName(null)).toBe(false);
      expect(isValidEncodedProjectName(undefined)).toBe(false);
      expect(isValidEncodedProjectName(123)).toBe(false);
    });
  });

  describe('getProjectNameFromPath', () => {
    it('should extract last segment from path', () => {
      expect(getProjectNameFromPath('/Users/dmieloch/Dev/claudecodeui')).toBe(
        'claudecodeui',
      );
      expect(getProjectNameFromPath('/home/user/projects/my-app')).toBe(
        'my-app',
      );
      expect(getProjectNameFromPath('/var/www/html')).toBe('html');
    });

    it('should handle paths with trailing slash', () => {
      expect(getProjectNameFromPath('/Users/dmieloch/Dev/project/')).toBe(
        'project',
      );
    });

    it('should handle single segment paths', () => {
      expect(getProjectNameFromPath('/project')).toBe('project');
      expect(getProjectNameFromPath('project')).toBe('project');
    });

    it('should handle empty or invalid input', () => {
      expect(getProjectNameFromPath('')).toBe('');
      expect(getProjectNameFromPath('/')).toBe('');
      expect(getProjectNameFromPath(null)).toBe('');
      expect(getProjectNameFromPath(undefined)).toBe('');
      expect(getProjectNameFromPath(123)).toBe('');
    });

    it('should handle paths with multiple slashes', () => {
      expect(getProjectNameFromPath('/Users//dmieloch///project//')).toBe(
        'project',
      );
    });
  });
});
