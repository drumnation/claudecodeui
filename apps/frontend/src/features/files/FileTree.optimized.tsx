import React, {memo, useMemo, useCallback, useState} from 'react';
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {CodeEditor} from '@/shared-components/CodeEditor';
import {ImageViewer} from '@/features/files/components/ImageViewer';
import {useFileTree} from '@/features/files/FileTree.hook';
import {
  isImageFile,
  getFileType,
  calculatePadding,
} from '@/features/files/FileTree.logic';
import {MinimalErrorBoundary} from '@/shared-components/ErrorBoundary';
import {useVirtualList, useIntersectionObserver} from '@/utils/performance';
import * as S from '@/features/files/FileTree.styles';
import {FileTreeComponentProps, FileNode, GitStatus} from './FileTree.types';

// Memoized file icon component
const FileIcon = memo(
  ({
    item,
    changedFiles,
    expandedDirs,
  }: {
    item: FileNode;
    changedFiles: Set<string>;
    expandedDirs: Set<string>;
  }) => {
    if (item.type === 'directory') {
      const hasChanges = useMemo(() => {
        if (!changedFiles.size) return false;
        const normalizedDirPath = `${item.path.replace(/^\//, '').replace(/\/$/, '')}/`;
        return Array.from(changedFiles).some((file) =>
          file.startsWith(normalizedDirPath),
        );
      }, [item.path, changedFiles]);

      if (expandedDirs.has(item.path)) {
        return (
          <S.FolderIconOpen hasChanges={hasChanges}>
            <FolderOpen className="w-full h-full" />
          </S.FolderIconOpen>
        );
      }
      return (
        <S.FolderIconClosed hasChanges={hasChanges}>
          <Folder className="w-full h-full" />
        </S.FolderIconClosed>
      );
    }

    const fileType = getFileType(item.name);
    const fileHasChanges = changedFiles.has(item.path.replace(/^\//, ''));

    switch (fileType) {
      case 'code':
        return (
          <S.CodeFileIcon hasChanges={fileHasChanges}>
            <FileCode className="w-full h-full" />
          </S.CodeFileIcon>
        );
      case 'document':
        return (
          <S.DocumentFileIcon hasChanges={fileHasChanges}>
            <FileText className="w-full h-full" />
          </S.DocumentFileIcon>
        );
      case 'image':
        return (
          <S.ImageFileIcon hasChanges={fileHasChanges}>
            <File className="w-full h-full" />
          </S.ImageFileIcon>
        );
      default:
        return (
          <S.GenericFileIcon hasChanges={fileHasChanges}>
            <File className="w-full h-full" />
          </S.GenericFileIcon>
        );
    }
  },
);

FileIcon.displayName = 'FileIcon';

// Memoized file tree item component
const FileTreeItem = memo(
  ({
    item,
    depth,
    changedFiles,
    expandedDirs,
    selectedFile,
    toggleDirectory,
    handleFileSelect,
    handleImageSelect,
  }: {
    item: FileNode;
    depth: number;
    changedFiles: Set<string>;
    expandedDirs: Set<string>;
    selectedFile: string | null;
    toggleDirectory: (path: string) => void;
    handleFileSelect: (path: string) => void;
    handleImageSelect: (path: string) => void;
  }) => {
    const itemRef = React.useRef<HTMLDivElement>(null);
    const isVisible = useIntersectionObserver(itemRef, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    const handleClick = useCallback(() => {
      if (item.type === 'directory') {
        toggleDirectory(item.path);
      } else if (isImageFile(item.name)) {
        handleImageSelect(item.path);
      } else {
        handleFileSelect(item.path);
      }
    }, [
      item.type,
      item.path,
      item.name,
      toggleDirectory,
      handleFileSelect,
      handleImageSelect,
    ]);

    const isSelected = selectedFile === item.path;
    const isExpanded = expandedDirs.has(item.path);

    // Don't render if not visible (virtualization)
    if (!isVisible) {
      return <div ref={itemRef} style={{height: '32px'}} />;
    }

    return (
      <div ref={itemRef}>
        <S.FileTreeItem
          onClick={handleClick}
          style={{paddingLeft: `${calculatePadding(depth)}px`}}
          isSelected={isSelected}
          isExpanded={isExpanded}
          data-testid={`file-tree-item-${item.name}`}
        >
          <FileIcon
            item={item}
            changedFiles={changedFiles}
            expandedDirs={expandedDirs}
          />
          <S.ItemName>{item.name}</S.ItemName>
        </S.FileTreeItem>
      </div>
    );
  },
);

FileTreeItem.displayName = 'FileTreeItem';

// Recursive file tree renderer with memoization
const FileTreeRenderer = memo(
  ({
    items,
    depth = 0,
    changedFiles,
    expandedDirs,
    selectedFile,
    toggleDirectory,
    handleFileSelect,
    handleImageSelect,
  }: {
    items: FileNode[];
    depth?: number;
    changedFiles: Set<string>;
    expandedDirs: Set<string>;
    selectedFile: string | null;
    toggleDirectory: (path: string) => void;
    handleFileSelect: (path: string) => void;
    handleImageSelect: (path: string) => void;
  }) => {
    const [visibleItems, setVisibleItems] = useState(50); // Start with 50 items
    const [showMore, setShowMore] = useState(false);

    const displayedItems = useMemo(() => {
      return showMore ? items : items.slice(0, visibleItems);
    }, [items, visibleItems, showMore]);

    const handleShowMore = useCallback(() => {
      setVisibleItems((prev) => prev + 50);
      if (visibleItems >= items.length) {
        setShowMore(true);
      }
    }, [visibleItems, items.length]);

    return (
      <>
        {displayedItems.map((item) => (
          <div key={item.path}>
            <FileTreeItem
              item={item}
              depth={depth}
              changedFiles={changedFiles}
              expandedDirs={expandedDirs}
              selectedFile={selectedFile}
              toggleDirectory={toggleDirectory}
              handleFileSelect={handleFileSelect}
              handleImageSelect={handleImageSelect}
            />
            {item.type === 'directory' &&
              expandedDirs.has(item.path) &&
              item.children && (
                <FileTreeRenderer
                  items={item.children}
                  depth={depth + 1}
                  changedFiles={changedFiles}
                  expandedDirs={expandedDirs}
                  selectedFile={selectedFile}
                  toggleDirectory={toggleDirectory}
                  handleFileSelect={handleFileSelect}
                  handleImageSelect={handleImageSelect}
                />
              )}
          </div>
        ))}
        {!showMore && items.length > visibleItems && (
          <S.LoadMoreButton onClick={handleShowMore}>
            Show {Math.min(50, items.length - visibleItems)} more files...
          </S.LoadMoreButton>
        )}
      </>
    );
  },
);

FileTreeRenderer.displayName = 'FileTreeRenderer';

export const OptimizedFileTree: React.FC<FileTreeComponentProps> = memo(
  ({selectedProject, gitStatus}) => {
    const {
      files,
      loading,
      error,
      expandedDirs,
      selectedFile,
      selectedImage,
      toggleDirectory,
      handleFileSelect,
      handleImageSelect,
      closeFile,
      closeImage,
      fetchFiles,
    } = useFileTree(selectedProject);

    // Memoize changed files calculation
    const changedFiles = useMemo((): Set<string> => {
      if (!gitStatus) return new Set<string>();

      const changedFiles = new Set<string>();
      const statusKeys: (keyof GitStatus)[] = [
        'modified',
        'added',
        'deleted',
        'untracked',
      ];
      statusKeys.forEach((status) => {
        if (gitStatus[status]) {
          gitStatus[status]!.forEach((file: string) => changedFiles.add(file));
        }
      });
      return changedFiles;
    }, [gitStatus]);

    // Memoize callbacks to prevent unnecessary re-renders
    const memoizedToggleDirectory = useCallback(toggleDirectory, [
      toggleDirectory,
    ]);
    const memoizedHandleFileSelect = useCallback(handleFileSelect, [
      handleFileSelect,
    ]);
    const memoizedHandleImageSelect = useCallback(handleImageSelect, [
      handleImageSelect,
    ]);

    if (loading) {
      return (
        <S.LoadingContainer>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading files...</span>
        </S.LoadingContainer>
      );
    }

    if (error) {
      return (
        <S.ErrorContainer>
          <AlertCircle className="w-6 h-6 text-red-500" />
          <span className="text-red-600">{error}</span>
          <S.RetryButton onClick={fetchFiles}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </S.RetryButton>
        </S.ErrorContainer>
      );
    }

    return (
      <S.FileTreeContainer>
        <S.FileTreeContent>
          <MinimalErrorBoundary>
            <FileTreeRenderer
              items={files}
              changedFiles={changedFiles}
              expandedDirs={expandedDirs}
              selectedFile={selectedFile}
              toggleDirectory={memoizedToggleDirectory}
              handleFileSelect={memoizedHandleFileSelect}
              handleImageSelect={memoizedHandleImageSelect}
            />
          </MinimalErrorBoundary>
        </S.FileTreeContent>

        {selectedFile && (
          <S.FileEditorOverlay>
            <S.FileEditorHeader>
              <S.FileEditorTitle>{selectedFile}</S.FileEditorTitle>
              <S.CloseButton onClick={closeFile}>×</S.CloseButton>
            </S.FileEditorHeader>
            <S.FileEditorContent>
              <CodeEditor filePath={selectedFile} />
            </S.FileEditorContent>
          </S.FileEditorOverlay>
        )}

        {selectedImage && (
          <S.ImageOverlay>
            <S.ImageHeader>
              <S.ImageTitle>{selectedImage}</S.ImageTitle>
              <S.CloseButton onClick={closeImage}>×</S.CloseButton>
            </S.ImageHeader>
            <S.ImageContent>
              <ImageViewer imagePath={selectedImage} />
            </S.ImageContent>
          </S.ImageOverlay>
        )}
      </S.FileTreeContainer>
    );
  },
);

OptimizedFileTree.displayName = 'OptimizedFileTree';
