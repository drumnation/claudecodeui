import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorHeader } from '@/shared-components/CodeEditor/components/EditorHeader';
import { EditorActions } from '@/shared-components/CodeEditor/components/EditorActions';
import { EditorFooter } from '@/shared-components/CodeEditor/components/EditorFooter';
import { 
  useCodeEditor, 
  useDiffDecorations, 
  useKeyboardShortcuts 
} from '@/shared-components/CodeEditor/CodeEditor.hook';
import {
  getLanguageExtension,
  downloadFile,
  createDiffTheme,
  getEditorConfig
} from '@/shared-components/CodeEditor/CodeEditor.logic';
import {
  EditorOverlay,
  EditorContainer,
  LoadingContainer,
  LoadingContent,
  LoadingSpinner,
  LoadingText,
  EditorWrapper,
  generateStyleTag
} from '@/shared-components/CodeEditor/CodeEditor.styles';

export const CodeEditor = ({ file, onClose, projectPath }) => {
  const {
    content,
    setContent,
    loading,
    saving,
    isFullscreen,
    isDarkMode,
    saveSuccess,
    showDiff,
    editorRef,
    handleSave,
    toggleFullscreen,
    toggleDarkMode,
    toggleShowDiff,
  } = useCodeEditor({ file, projectPath, onClose });

  const { diffField } = useDiffDecorations(
    editorRef, 
    content, 
    file.diffInfo, 
    showDiff, 
    isDarkMode
  );

  useKeyboardShortcuts(
    { save: handleSave, close: onClose },
    [content]
  );

  const handleDownload = () => downloadFile(file.name, content);

  if (loading) {
    return (
      <>
        <style>{generateStyleTag(isDarkMode)}</style>
        <EditorOverlay>
          <LoadingContainer isDarkMode={isDarkMode}>
            <LoadingContent>
              <LoadingSpinner />
              <LoadingText>Loading {file.name}...</LoadingText>
            </LoadingContent>
          </LoadingContainer>
        </EditorOverlay>
      </>
    );
  }

  return (
    <>
      <style>{generateStyleTag(isDarkMode)}</style>
      <EditorOverlay isFullscreen={isFullscreen}>
        <EditorContainer 
          className="code-editor-modal"
          isFullscreen={isFullscreen}
          isDarkMode={isDarkMode}
        >
          <EditorHeader
            file={file}
            showDiff={showDiff}
            isDarkMode={isDarkMode}
            onToggleDiff={toggleShowDiff}
            onToggleTheme={toggleDarkMode}
            onClose={onClose}
          >
            <EditorActions
              saving={saving}
              saveSuccess={saveSuccess}
              isFullscreen={isFullscreen}
              onSave={handleSave}
              onDownload={handleDownload}
              onToggleFullscreen={toggleFullscreen}
            />
          </EditorHeader>
          
          <EditorWrapper>
            <CodeMirror
              ref={editorRef}
              value={content}
              onChange={setContent}
              extensions={[
                ...getLanguageExtension(file.name),
                diffField,
                createDiffTheme()
              ]}
              theme={isDarkMode ? oneDark : undefined}
              height="100%"
              style={{
                fontSize: '14px',
                height: '100%',
              }}
              basicSetup={getEditorConfig()}
            />
          </EditorWrapper>

          <EditorFooter file={file} content={content} />
        </EditorContainer>
      </EditorOverlay>
    </>
  );
};