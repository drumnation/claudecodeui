import { describe, it, expect } from 'vitest';
import { filterFiles } from './InputArea.logic.js';

describe('filterFiles', () => {
  const mockFileList = [
    { name: 'index.js', path: '/src/index.js' },
    { name: 'App.jsx', path: '/src/App.jsx' },
    { name: 'utils.js', path: '/src/utils/utils.js' },
    { name: 'config.json', path: '/config.json' },
    { name: 'README.md', path: '/README.md' },
    { name: 'package.json', path: '/package.json' },
    { name: 'main.css', path: '/src/styles/main.css' },
    { name: 'Button.jsx', path: '/src/components/Button.jsx' },
    { name: 'Header.jsx', path: '/src/components/Header.jsx' },
    { name: 'Footer.jsx', path: '/src/components/Footer.jsx' },
    { name: 'api.js', path: '/src/services/api.js' },
    { name: 'auth.js', path: '/src/services/auth.js' },
  ];

  it('should return first 10 files when query is empty', () => {
    const result = filterFiles(mockFileList, '');
    expect(result).toHaveLength(10);
    expect(result).toEqual(mockFileList.slice(0, 10));
  });

  it('should filter files by name when query is provided', () => {
    const result = filterFiles(mockFileList, 'jsx');
    expect(result).toHaveLength(4);
    expect(result.every(file => file.name.includes('jsx'))).toBe(true);
  });

  it('should filter files by path when query is provided', () => {
    const result = filterFiles(mockFileList, 'components');
    expect(result).toHaveLength(3);
    expect(result.every(file => file.path.includes('components'))).toBe(true);
  });

  it('should be case insensitive', () => {
    const result = filterFiles(mockFileList, 'APP');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('App.jsx');
  });

  it('should return empty array when no files match the query', () => {
    const result = filterFiles(mockFileList, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('should return empty array when file list is empty', () => {
    const result = filterFiles([], 'test');
    expect(result).toHaveLength(0);
  });

  it('should limit results to 10 items even when more match', () => {
    const largeFileList = Array(20).fill(null).map((_, i) => ({
      name: `file${i}.js`,
      path: `/src/file${i}.js`
    }));
    const result = filterFiles(largeFileList, 'file');
    expect(result).toHaveLength(10);
  });

  it('should handle undefined or null file list gracefully', () => {
    expect(() => filterFiles(undefined, 'test')).not.toThrow();
    expect(() => filterFiles(null, 'test')).not.toThrow();
  });
});