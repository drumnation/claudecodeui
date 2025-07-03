import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { GitStatus } from "../GitPanel.types";
import { gitUtils } from "../GitPanel.logic";

interface GitFileListProps {
  gitStatus: GitStatus;
  selectedFiles: Set<string>;
  expandedFiles: Set<string>;
  gitDiff: Record<string, any>;
  isMobile: boolean;
  wrapText: boolean;
  onToggleFileExpanded: (filePath: string) => void;
  onToggleFileSelected: (filePath: string) => void;
  onToggleWrapText: () => void;
}

export function GitFileList({
  gitStatus,
  selectedFiles,
  expandedFiles,
  gitDiff,
  isMobile,
  wrapText,
  onToggleFileExpanded,
  onToggleFileSelected,
  onToggleWrapText
}: GitFileListProps) {
  const renderDiffLine = (line: string, index: number) => {
    const isAddition = line.startsWith("+") && !line.startsWith("+++");
    const isDeletion = line.startsWith("-") && !line.startsWith("---");
    const isHeader = line.startsWith("@@");

    return (
      <div
        key={index}
        className={`font-mono text-xs ${
          isMobile && wrapText
            ? "whitespace-pre-wrap break-all"
            : "whitespace-pre overflow-x-auto"
        } ${
          isAddition
            ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
            : isDeletion
              ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
              : isHeader
                ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {line}
      </div>
    );
  };

  const renderFileItem = (filePath: string, status: string) => {
    const isExpanded = expandedFiles.has(filePath);
    const isSelected = selectedFiles.has(filePath);
    const diff = gitDiff[filePath];

    return (
      <div
        key={filePath}
        className="border-b border-gray-200 dark:border-gray-700 last:border-0"
        data-testid={`git-file-${filePath}`}
      >
        <div className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleFileSelected(filePath)}
            onClick={(e) => e.stopPropagation()}
            className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:checked:bg-blue-600"
            data-testid={`git-file-checkbox-${filePath}`}
          />
          <div
            className="flex items-center flex-1 cursor-pointer"
            onClick={() => onToggleFileExpanded(filePath)}
          >
            <div className="mr-2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </div>
            <span className="flex-1 text-sm truncate">{filePath}</span>
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold border ${
                status === "M"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                  : status === "A"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                    : status === "D"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              }`}
              title={gitUtils.getStatusLabel(status)}
            >
              {status}
            </span>
          </div>
        </div>
        {isExpanded && diff && (
          <div className="bg-gray-50 dark:bg-gray-900">
            {isMobile && (
              <div className="flex justify-end p-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWrapText();
                  }}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title={wrapText ? "Switch to horizontal scroll" : "Switch to text wrap"}
                >
                  {wrapText ? "↔️ Scroll" : "↩️ Wrap"}
                </button>
              </div>
            )}
            <div className="max-h-96 overflow-y-auto p-2">
              {diff.split("\n").map((line: string, index: number) => renderDiffLine(line, index))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {gitStatus.modified?.map((file) => renderFileItem(file, "M"))}
      {gitStatus.added?.map((file) => renderFileItem(file, "A"))}
      {gitStatus.deleted?.map((file) => renderFileItem(file, "D"))}
      {gitStatus.untracked?.map((file) => renderFileItem(file, "U"))}
    </div>
  );
}
