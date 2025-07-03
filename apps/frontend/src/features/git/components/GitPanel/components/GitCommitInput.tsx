import React from "react";
import { Check, RefreshCw, Sparkles } from "lucide-react";
import { MicButton } from "@/features/chat";

interface GitCommitInputProps {
  commitMessage: string;
  onCommitMessageChange: (message: string) => void;
  selectedFilesCount: number;
  isCommitting: boolean;
  isGeneratingMessage: boolean;
  onCommit: () => void;
  onGenerateMessage: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function GitCommitInput({
  commitMessage,
  onCommitMessageChange,
  selectedFilesCount,
  isCommitting,
  isGeneratingMessage,
  onCommit,
  onGenerateMessage,
  textareaRef
}: GitCommitInputProps) {
  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={commitMessage}
          onChange={(e) => onCommitMessageChange(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit)"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 resize-none pr-20"
          rows={3}
          data-testid="commit-message-input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              onCommit();
            }
          }}
        />
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            onClick={onGenerateMessage}
            disabled={selectedFilesCount === 0 || isGeneratingMessage}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate commit message"
            data-testid="generate-commit-message-button"
          >
            {isGeneratingMessage ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
          <MicButton
            onTranscript={(transcript) => onCommitMessageChange(transcript)}
            className="p-1.5"
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">
          {selectedFilesCount} file{selectedFilesCount !== 1 ? "s" : ""} selected
        </span>
        <button
          onClick={onCommit}
          disabled={!commitMessage.trim() || selectedFilesCount === 0 || isCommitting}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          data-testid="commit-button"
        >
          <Check className="w-3 h-3" />
          <span>{isCommitting ? "Committing..." : "Commit"}</span>
        </button>
      </div>
    </div>
  );
}
