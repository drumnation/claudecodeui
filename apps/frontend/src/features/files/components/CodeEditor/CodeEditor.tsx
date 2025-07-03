import React, { useState, useEffect, useRef } from "react";
import { useLogger } from "@kit/logger/react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, Decoration } from "@codemirror/view";
import { StateField, StateEffect, RangeSetBuilder } from "@codemirror/state";
import {
  X,
  Save,
  Download,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from "lucide-react";

export interface CodeEditorProps {
  file: any;
  onClose: () => void;
  projectPath?: string;
}

function CodeEditor({
  file,
  onClose,
  projectPath,
}: CodeEditorProps) {
  const logger = useLogger({ scope: 'CodeEditor' });
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDiff, setShowDiff] = useState(!!file.diffInfo);

  // Log initial file opening
  useEffect(() => {
    logger.info('CodeEditor opened', {
      fileName: file.name,
      filePath: file.path,
      projectName: file.projectName,
      projectPath,
      hasDiffInfo: !!file.diffInfo,
      showDiff: !!file.diffInfo
    });
  }, [file, projectPath, logger]);

  // Create diff highlighting
  const diffEffect = StateEffect.define<any>();

  const diffField = StateField.define({
    create() {
      return Decoration.none;
    },
    update(decorations, tr) {
      decorations = decorations.map(tr.changes);

      for (const effect of tr.effects) {
        if (effect.is(diffEffect)) {
          decorations = effect.value || Decoration.none;
        }
      }
      return decorations;
    },
    provide: (f) => EditorView.decorations.from(f),
  });

  const createDiffDecorations = (content: string, diffInfo: any) => {
    if (!diffInfo || !showDiff) {
      const emptyBuilder = new RangeSetBuilder();
      return emptyBuilder.finish();
    }

    logger.debug('Creating diff decorations', {
      fileName: file.name,
      oldStringLength: diffInfo.old_string?.length || 0,
      contentLength: content.length,
      showDiff
    });

    const builder = new RangeSetBuilder();
    const lines = content.split("\n");
    const oldLines = diffInfo.old_string.split("\n");

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
        pos += (lines[i]?.length || 0) + 1; // +1 for newline
      }

      // Highlight old lines (to be removed)
      for (let i = 0; i < oldLines.length; i++) {
        const lineStart = pos;
        const lineEnd = pos + oldLines[i].length;
        builder.add(
          lineStart,
          lineEnd,
          Decoration.line({
            class: isDarkMode ? "diff-removed-dark" : "diff-removed-light",
          }),
        );
        pos += oldLines[i].length + 1;
      }

      logger.debug('Diff decorations created', {
        fileName: file.name,
        startLineIndex,
        oldLinesCount: oldLines.length,
        decorationsApplied: true
      });
    } else {
      logger.warn('Could not find matching content for diff highlighting', {
        fileName: file.name,
        oldLinesCount: oldLines.length,
        totalLines: lines.length
      });
    }

    return builder.finish();
  };

  // Diff decoration theme
  const diffTheme = EditorView.theme({
    ".diff-removed-light": {
      backgroundColor: "#fef2f2",
      borderLeft: "3px solid #ef4444",
    },
    ".diff-removed-dark": {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      borderLeft: "3px solid #ef4444",
    },
    ".diff-added-light": {
      backgroundColor: "#f0fdf4",
      borderLeft: "3px solid #22c55e",
    },
    ".diff-added-dark": {
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      borderLeft: "3px solid #22c55e",
    },
  });

  // Get language extension based on file extension
  const getLanguageExtension = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    logger.debug('Determining language extension', {
      fileName: filename,
      extension: ext
    });

    switch (ext) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return [javascript({ jsx: true, typescript: ext.includes("ts") })];
      case "py":
        return [python()];
      case "html":
      case "htm":
        return [html()];
      case "css":
      case "scss":
      case "less":
        return [css()];
      case "json":
        return [json()];
      case "md":
      case "markdown":
        return [markdown()];
      default:
        logger.debug('No specific language extension found, using plain text', { extension: ext });
        return [];
    }
  };

  // Load file content
  useEffect(() => {
    const loadFileContent = async () => {
      try {
        setLoading(true);
        logger.debug('Loading file content', {
          fileName: file.name,
          filePath: file.path,
          projectName: file.projectName
        });

        const response = await fetch(
          `/api/projects/${file.projectName}/file?filePath=${encodeURIComponent(file.path)}`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load file: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        setContent(data.content);
        logger.info('File content loaded successfully', {
          fileName: file.name,
          filePath: file.path,
          projectName: file.projectName,
          contentLength: data.content.length,
          lineCount: data.content.split('\n').length
        });
      } catch (error) {
        logger.error('Failed to load file content', {
          fileName: file.name,
          filePath: file.path,
          projectName: file.projectName,
          error: error instanceof Error ? error.message : String(error)
        });
        setContent(
          `// Error loading file: ${(error as Error).message}\n// File: ${file.name}\n// Path: ${file.path}`,
        );
      } finally {
        setLoading(false);
      }
    };

    loadFileContent();
  }, [file, projectPath, logger]);

  // Update diff decorations when content or diff info changes
  const editorRef = useRef<{ view?: EditorView }>(null);

  useEffect(() => {
    if (editorRef.current && content && file.diffInfo && showDiff) {
      const decorations = createDiffDecorations(content, file.diffInfo);
      const view = editorRef.current.view;
      if (view) {
        view.dispatch({
          effects: diffEffect.of(decorations),
        });
        logger.debug('Diff decorations applied to editor view', {
          fileName: file.name,
          showDiff
        });
      }
    }
  }, [content, file.diffInfo, showDiff, isDarkMode]);

  const handleSave = async () => {
    setSaving(true);
    const saveStartTime = Date.now();
    
    try {
      logger.debug('Initiating file save', {
        fileName: file.name,
        filePath: file.path,
        projectName: file.projectName,
        contentLength: content.length
      });

      const response = await fetch(`/api/projects/${file.projectName}/file`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath: file.path,
          content: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Save failed: ${response.status}`);
      }

      const result = await response.json();
      const saveTime = Date.now() - saveStartTime;

      // Show success feedback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000); // Hide after 2 seconds
      
      logger.info('File saved successfully', {
        fileName: file.name,
        filePath: file.path,
        projectName: file.projectName,
        contentLength: content.length,
        saveTime,
        backupCreated: result.backupCreated
      });
    } catch (error) {
      logger.error('Failed to save file', {
        fileName: file.name,
        filePath: file.path,
        projectName: file.projectName,
        error: error instanceof Error ? error.message : String(error),
        contentLength: content.length,
        saveTime: Date.now() - saveStartTime
      });
      alert(`Error saving file: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    logger.debug('File download initiated', {
      fileName: file.name,
      filePath: file.path,
      contentLength: content.length,
      contentType: 'text/plain'
    });
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logger.debug('File download completed', { fileName: file.name });
  };

  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    logger.debug('Fullscreen mode toggled', {
      fileName: file.name,
      isFullscreen: newState,
      viewport: { width: window.innerWidth, height: window.innerHeight }
    });
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    logger.debug('Editor theme toggled', {
      fileName: file.name,
      isDarkMode: newMode
    });
  };

  const toggleDiffView = () => {
    const newShowDiff = !showDiff;
    setShowDiff(newShowDiff);
    logger.debug('Diff view toggled', {
      fileName: file.name,
      showDiff: newShowDiff,
      hasDiffInfo: !!file.diffInfo
    });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "s") {
          e.preventDefault();
          logger.debug('Save keyboard shortcut triggered', { fileName: file.name });
          handleSave();
        } else if (e.key === "Escape") {
          e.preventDefault();
          logger.debug('Close keyboard shortcut triggered', { fileName: file.name });
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [content, file.name, logger]);

  // Track content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Log content changes occasionally to avoid spam
    if (Math.random() < 0.1) { // 10% chance to log
      logger.debug('Content modified', {
        fileName: file.name,
        newLength: newContent.length,
        hasChanges: newContent !== content,
        lineCount: newContent.split('\n').length
      });
    }
  };

  // Handle editor close
  const handleClose = () => {
    logger.info('CodeEditor closing', {
      fileName: file.name,
      filePath: file.path,
      projectName: file.projectName,
      hadUnsavedChanges: content !== "", // This is simplified, in real app you'd track if content differs from original
      finalContentLength: content.length
    });
    onClose();
  };

  if (loading) {
    return (
      <>
        <style>
          {`
            .code-editor-loading {
              background-color: ${isDarkMode ? "#111827" : "#ffffff"} !important;
            }
            .code-editor-loading:hover {
              background-color: ${isDarkMode ? "#111827" : "#ffffff"} !important;
            }
          `}
        </style>
        <div className="fixed inset-0 z-50 md:bg-black/50 md:flex md:items-center md:justify-center">
          <div className="code-editor-loading w-full h-full md:rounded-lg md:w-auto md:h-auto p-8 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white">
                Loading {file.name}...
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          .code-editor-modal {
            background-color: ${isDarkMode ? "#111827" : "#ffffff"} !important;
          }
          .code-editor-modal:hover {
            background-color: ${isDarkMode ? "#111827" : "#ffffff"} !important;
          }
        `}
      </style>
      <div
        className={`fixed inset-0 z-50 ${
          // Mobile: native fullscreen, Desktop: modal with backdrop
          "md:bg-black/50 md:flex md:items-center md:justify-center md:p-4"
        } ${isFullscreen ? "md:p-0" : ""}`}
      >
        <div
          className={`code-editor-modal shadow-2xl flex flex-col ${
            // Mobile: always fullscreen, Desktop: modal sizing
            "w-full h-full md:rounded-lg md:shadow-2xl" +
            (isFullscreen
              ? " md:w-full md:h-full md:rounded-none"
              : " md:w-full md:max-w-6xl md:h-[80vh] md:max-h-[80vh]")
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-mono">
                  {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </h3>
                  {file.diffInfo && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded whitespace-nowrap">
                      📝 Has changes
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {file.path}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {file.diffInfo && (
                <button
                  onClick={toggleDiffView}
                  className="p-2 md:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                  title={
                    showDiff
                      ? "Hide diff highlighting"
                      : "Show diff highlighting"
                  }
                >
                  {showDiff ? (
                    <EyeOff className="w-5 h-5 md:w-4 md:h-4" />
                  ) : (
                    <Eye className="w-5 h-5 md:w-4 md:h-4" />
                  )}
                </button>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 md:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                title="Toggle theme"
              >
                <span className="text-lg md:text-base">
                  {isDarkMode ? "☀️" : "🌙"}
                </span>
              </button>

              <button
                onClick={handleDownload}
                className="p-2 md:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                title="Download file"
              >
                <Download className="w-5 h-5 md:w-4 md:h-4" />
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-3 py-2 text-white rounded-md disabled:opacity-50 flex items-center gap-2 transition-colors min-h-[44px] md:min-h-0 ${
                  saveSuccess
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saveSuccess ? (
                  <>
                    <svg
                      className="w-5 h-5 md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="hidden sm:inline">Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">
                      {saving ? "Saving..." : "Save"}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={toggleFullscreen}
                className="hidden md:flex p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 items-center justify-center"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleClose}
                className="p-2 md:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                title="Close"
              >
                <X className="w-6 h-6 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeMirror
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              extensions={[
                ...getLanguageExtension(file.name),
                diffField,
                diffTheme,
              ]}
              {...(isDarkMode && { theme: oneDark })}
              height="100%"
              style={{
                fontSize: "14px",
                height: "100%",
              }}
              basicSetup={{
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
              }}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Lines: {content.split("\n").length}</span>
              <span>Characters: {content.length}</span>
              <span>
                Language: {file.name.split(".").pop()?.toUpperCase() || "Text"}
              </span>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Press Ctrl+S to save • Esc to close
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CodeEditor;