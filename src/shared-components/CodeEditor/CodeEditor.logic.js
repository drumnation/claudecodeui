import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { Decoration, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

// Language detection logic
export const getLanguageExtension = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return [javascript({ jsx: true, typescript: ext.includes('ts') })];
    case 'py':
      return [python()];
    case 'html':
    case 'htm':
      return [html()];
    case 'css':
    case 'scss':
    case 'less':
      return [css()];
    case 'json':
      return [json()];
    case 'md':
    case 'markdown':
      return [markdown()];
    default:
      return [];
  }
};

// File operations
export const loadFileContent = async (file, projectPath) => {
  const response = await fetch(
    `/api/projects/${file.projectName}/file?filePath=${encodeURIComponent(file.path)}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.content;
};

export const saveFileContent = async (file, content) => {
  const response = await fetch(`/api/projects/${file.projectName}/file`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filePath: file.path,
      content: content
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Save failed: ${response.status}`);
  }

  return await response.json();
};

export const downloadFile = (filename, content) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Diff decorations logic
export const createDiffDecorations = (content, diffInfo, showDiff, isDarkMode) => {
  if (!diffInfo || !showDiff) return Decoration.none;
  
  const builder = new RangeSetBuilder();
  const lines = content.split('\n');
  const oldLines = diffInfo.old_string.split('\n');
  
  // Find the line where the old content starts
  let startLineIndex = -1;
  for (let i = 0; i <= lines.length - oldLines.length; i++) {
    let matches = true;
    for (let j = 0; j < oldLines.length; j++) {
      if (lines[i + j] !== oldLines[j]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      startLineIndex = i;
      break;
    }
  }

  if (startLineIndex >= 0) {
    let pos = 0;
    // Calculate position to start of old content
    for (let i = 0; i < startLineIndex; i++) {
      pos += lines[i].length + 1; // +1 for newline
    }
    
    // Highlight old lines (to be removed)
    for (let i = 0; i < oldLines.length; i++) {
      const lineStart = pos;
      const lineEnd = pos + oldLines[i].length;
      builder.add(lineStart, lineEnd, Decoration.line({
        class: isDarkMode ? 'diff-removed-dark' : 'diff-removed-light'
      }));
      pos += oldLines[i].length + 1;
    }
  }
  
  return builder.finish();
};

// Diff theme
export const createDiffTheme = () => EditorView.theme({
  '.diff-removed-light': {
    backgroundColor: '#fef2f2',
    borderLeft: '3px solid #ef4444'
  },
  '.diff-removed-dark': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeft: '3px solid #ef4444'
  },
  '.diff-added-light': {
    backgroundColor: '#f0fdf4',
    borderLeft: '3px solid #22c55e'
  },
  '.diff-added-dark': {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderLeft: '3px solid #22c55e'
  }
});

// File info utilities
export const getFileInfo = (file) => {
  const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
  const lineCount = (content) => content.split('\n').length;
  const charCount = (content) => content.length;
  
  return {
    extension,
    lineCount,
    charCount
  };
};

// Editor config
export const getEditorConfig = () => ({
  lineNumbers: true,
  foldGutter: true,
  dropCursor: false,
  allowMultipleSelections: false,
  indentOnInput: true,
  bracketMatching: true,
  closeBrackets: true,
  autocompletion: true,
  highlightSelectionMatches: true,
  searchKeymap: true,
});