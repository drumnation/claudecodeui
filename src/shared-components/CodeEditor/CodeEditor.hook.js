import { useState, useEffect, useRef } from 'react';
import { StateEffect, StateField } from '@codemirror/state';
import { EditorView, Decoration } from '@codemirror/view';
import { 
  loadFileContent, 
  saveFileContent, 
  createDiffDecorations 
} from '@/shared-components/CodeEditor/CodeEditor.logic';

// Custom hook for managing editor state
export const useCodeEditor = ({ file, projectPath, onClose }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDiff, setShowDiff] = useState(!!file.diffInfo);
  
  const editorRef = useRef(null);

  // Load file content on mount
  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        const fileContent = await loadFileContent(file, projectPath);
        setContent(fileContent);
      } catch (error) {
        console.error('Error loading file:', error);
        setContent(
          `// Error loading file: ${error.message}\n// File: ${file.name}\n// Path: ${file.path}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [file, projectPath]);

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFileContent(file, content);
      
      // Show success feedback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving file:', error);
      alert(`Error saving file: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle functions
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleShowDiff = () => setShowDiff(!showDiff);

  return {
    // State
    content,
    setContent,
    loading,
    saving,
    isFullscreen,
    isDarkMode,
    saveSuccess,
    showDiff,
    editorRef,
    
    // Actions
    handleSave,
    toggleFullscreen,
    toggleDarkMode,
    toggleShowDiff,
  };
};

// Custom hook for diff decorations
export const useDiffDecorations = (editorRef, content, diffInfo, showDiff, isDarkMode) => {
  const diffEffect = StateEffect.define();
  
  const diffField = StateField.define({
    create() {
      return Decoration.none;
    },
    update(decorations, tr) {
      decorations = decorations.map(tr.changes);
      
      for (let effect of tr.effects) {
        if (effect.is(diffEffect)) {
          decorations = effect.value;
        }
      }
      return decorations;
    },
    provide: f => EditorView.decorations.from(f)
  });

  // Update diff decorations when dependencies change
  useEffect(() => {
    if (editorRef.current && content && diffInfo && showDiff) {
      const decorations = createDiffDecorations(content, diffInfo, showDiff, isDarkMode);
      const view = editorRef.current.view;
      if (view) {
        view.dispatch({
          effects: diffEffect.of(decorations)
        });
      }
    }
  }, [content, diffInfo, showDiff, isDarkMode]);

  return { diffField, diffEffect };
};

// Custom hook for keyboard shortcuts
export const useKeyboardShortcuts = (actions, dependencies) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          actions.save();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          actions.close();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, dependencies);
};