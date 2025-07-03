import React, { useState, useEffect } from "react";
import { useLogger } from "@kit/logger/react";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Button } from "@/components/atoms/Button";
import { Folder, FolderOpen, File, FileText, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeEditor } from "../CodeEditor";
import { ImageViewer } from "../ImageViewer";
import type { Project } from "@/App";

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
  const logger = useLogger({ scope: 'FileTree' });
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
      logger.info('FileTree project changed, fetching files', {
        projectName: selectedProject.name,
        projectPath: selectedProject.fullPath
      });
      
      const fetchFiles = async () => {
        setLoading(true);
        const fetchStart = Date.now();
        
        try {
          // Use the project's fullPath as the dirPath parameter
          const dirPath = selectedProject.fullPath;
          logger.debug('Fetching files from API', {
            projectName: selectedProject.name,
            dirPath,
            url: `/api/projects/${selectedProject.name}/files?dirPath=${encodeURIComponent(dirPath)}`
          });

          const response = await fetch(
            `/api/projects/${selectedProject.name}/files?dirPath=${encodeURIComponent(dirPath)}`,
          );

          if (!response.ok) {
            const errorText = await response.text();
            logger.warn('File fetch failed', {
              projectName: selectedProject.name,
              projectPath: selectedProject.fullPath,
              status: response.status,
              statusText: response.statusText,
              errorText,
              dirPath,
              fetchTime: Date.now() - fetchStart
            });
            setFiles([]);
            return;
          }

          const data = await response.json();
          const fileCount = (data.files || []).length;
          setFiles(data.files || []);
          
          logger.info('Files fetched successfully', {
            projectName: selectedProject.name,
            projectPath: selectedProject.fullPath,
            fileCount,
            dirPath,
            fetchTime: Date.now() - fetchStart,
            hasChildren: data.files?.some((f: FileItem) => f.children?.length > 0)
          });
        } catch (error) {
          logger.error('Error fetching files from API', {
            projectName: selectedProject.name,
            projectPath: selectedProject.fullPath,
            error: error instanceof Error ? error.message : String(error),
            dirPath: selectedProject.fullPath,
            fetchTime: Date.now() - fetchStart
          });
          setFiles([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchFiles();
    } else {
      logger.debug('FileTree project cleared');
      setFiles([]);
    }
  }, [selectedProject]);


  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    const isExpanding = !newExpanded.has(path);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
    logger.debug('Directory expansion toggled', {
      path,
      isExpanding,
      totalExpanded: newExpanded.size,
      projectName: selectedProject?.name
    });
  };

  const handleFileSelection = (item: FileItem) => {
    if (!selectedProject) return;

    if (item.type === "directory") {
      toggleDirectory(item.path);
    } else if (isImageFile(item.name)) {
      // Open image in viewer
      logger.info('Image file selected for viewing', {
        fileName: item.name,
        filePath: item.path,
        projectName: selectedProject.name,
        fileExtension: item.name.split('.').pop()?.toLowerCase()
      });
      setSelectedImage({
        name: item.name,
        path: item.path,
        projectPath: selectedProject.fullPath,
        projectName: selectedProject.name,
      });
    } else {
      // Open file in editor
      logger.info('File selected for editing', {
        fileName: item.name,
        filePath: item.path,
        projectName: selectedProject.name,
        fileExtension: item.name.split('.').pop()?.toLowerCase(),
        fileSize: (item as any).size // If available
      });
      setSelectedFile({
        name: item.name,
        path: item.path,
        projectPath: selectedProject.fullPath,
        projectName: selectedProject.name,
      });
    }
  };

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item: FileItem) => (
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
          onClick={() => handleFileSelection(item)}
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

  const isImageFile = (filename: string): boolean => {
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
    const isImage = ext ? imageExtensions.includes(ext) : false;
    
    if (isImage) {
      logger.debug('File identified as image', {
        filename,
        extension: ext
      });
    }
    
    return isImage;
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

  const handleEditorClose = () => {
    logger.debug('Code editor closed', {
      fileName: selectedFile?.name,
      projectName: selectedProject?.name
    });
    setSelectedFile(null);
  };

  const handleImageViewerClose = () => {
    logger.debug('Image viewer closed', {
      fileName: selectedImage?.name,
      projectName: selectedProject?.name
    });
    setSelectedImage(null);
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
          onClose={handleEditorClose}
          projectPath={selectedFile.projectPath}
        />
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <ImageViewer
          file={selectedImage}
          onClose={handleImageViewerClose}
        />
      )}
    </div>
  );
}

export default FileTree;