import React, { useState, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Folder, FolderOpen, File, FileText, FileCode } from "lucide-react";
import { cn } from "../lib/utils";
import CodeEditor from "./CodeEditor";
import { ImageViewer } from "./ImageViewer";
import type { Project } from "../App";

export interface FileTreeProps {
  selectedProject: Project | null;
}

interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileItem[];
}

function FileTree({ selectedProject }: FileTreeProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    path: string;
    projectPath: string;
    projectName: string;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    name: string;
    path: string;
    projectPath: string;
    projectName: string;
  } | null>(null);

  useEffect(() => {
    if (selectedProject) {
      fetchFiles();
    }
  }, [selectedProject]);

  const fetchFiles = async () => {
    if (!selectedProject) {
      return;
    }
    setLoading(true);
    try {
      // Use the project's fullPath as the dirPath parameter
      const dirPath = selectedProject.fullPath;
      const response = await fetch(
        `/api/projects/${selectedProject.name}/files?dirPath=${encodeURIComponent(dirPath)}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ File fetch failed:", response.status, errorText);
        setFiles([]);
        return;
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("❌ Error fetching files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const renderFileTree = (items: any[], level = 0) => {
    return items.map((item: any) => (
      <div key={item.path} className="select-none">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start p-2 h-auto font-normal text-left hover:bg-accent",
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          data-testid={
            item.type === "directory"
              ? `directory-${item.path}`
              : `file-${item.path}`
          }
          onClick={() => {
            if (!selectedProject) return;
            if (item.type === "directory") {
              toggleDirectory(item.path);
            } else if (isImageFile(item.name)) {
              // Open image in viewer
              setSelectedImage({
                name: item.name,
                path: item.path,
                projectPath: selectedProject.fullPath,
                projectName: selectedProject.name,
              });
            } else {
              // Open file in editor
              setSelectedFile({
                name: item.name,
                path: item.path,
                projectPath: selectedProject.fullPath,
                projectName: selectedProject.name,
              });
            }
          }}
        >
          <div className="flex items-center gap-2 min-w-0 w-full">
            {item.type === "directory" ? (
              <>
                <div
                  data-testid={`expand-${item.path}`}
                  className="flex items-center"
                >
                  {expandedDirs.has(item.path) ? (
                    <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </>
            ) : (
              getFileIcon(item.name)
            )}
            <span className="text-sm truncate text-foreground">
              {item.name}
            </span>
          </div>
        </Button>

        {item.type === "directory" &&
          expandedDirs.has(item.path) &&
          item.children &&
          item.children.length > 0 && (
            <div>{renderFileTree(item.children, level + 1)}</div>
          )}
      </div>
    ));
  };

  const isImageFile = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const imageExtensions = [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "svg",
      "webp",
      "ico",
      "bmp",
    ];
    return ext ? imageExtensions.includes(ext) : false;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();

    const codeExtensions = [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "php",
      "rb",
      "go",
      "rs",
    ];
    const docExtensions = ["md", "txt", "doc", "pdf"];
    const imageExtensions = [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "svg",
      "webp",
      "ico",
      "bmp",
    ];

    if (ext && codeExtensions.includes(ext)) {
      return <FileCode className="w-4 h-4 text-green-500 flex-shrink-0" />;
    } else if (ext && docExtensions.includes(ext)) {
      return <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    } else if (ext && imageExtensions.includes(ext)) {
      return <File className="w-4 h-4 text-purple-500 flex-shrink-0" />;
    } else {
      return <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
    }
  };

  if (loading) {
    return (
      <div
        className="h-full flex items-center justify-center"
        data-testid="file-tree-loading"
      >
        <div className="text-gray-500 dark:text-gray-400">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card" data-testid="file-tree">
      <ScrollArea className="flex-1 p-4">
        {files.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
              <Folder className="w-6 h-6 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground mb-1">No files found</h4>
            <p className="text-sm text-muted-foreground">
              Check if the project path is accessible
            </p>
          </div>
        ) : (
          <div className="space-y-1">{renderFileTree(files)}</div>
        )}
      </ScrollArea>

      {/* Code Editor Modal */}
      {selectedFile && (
        <CodeEditor
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          projectPath={selectedFile.projectPath}
        />
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <ImageViewer
          file={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

export default FileTree;
