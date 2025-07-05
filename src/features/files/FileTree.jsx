import React from 'react';
import { Folder, FolderOpen, File, FileText, FileCode } from 'lucide-react';
import { ScrollArea } from '@/shared-components/ScrollArea';
import { CodeEditor } from '@/shared-components/CodeEditor';
import { ImageViewer } from '@/features/files/components/ImageViewer';
import { useFileTree } from '@/features/files/FileTree.hook';
import { isImageFile, getFileType, calculatePadding } from '@/features/files/FileTree.logic';
import * as S from '@/features/files/FileTree.styles';

export const FileTree = ({ selectedProject }) => {
  const {
    files,
    loading,
    expandedDirs,
    selectedFile,
    selectedImage,
    toggleDirectory,
    handleFileSelect,
    handleImageSelect,
    closeFile,
    closeImage
  } = useFileTree(selectedProject);

  const renderIcon = (item) => {
    if (item.type === 'directory') {
      if (expandedDirs.has(item.path)) {
        return (
          <S.FolderIconOpen>
            <FolderOpen className="w-full h-full" />
          </S.FolderIconOpen>
        );
      }
      return (
        <S.FolderIconClosed>
          <Folder className="w-full h-full" />
        </S.FolderIconClosed>
      );
    }

    const fileType = getFileType(item.name);
    switch (fileType) {
      case 'code':
        return (
          <S.CodeFileIcon>
            <FileCode className="w-full h-full" />
          </S.CodeFileIcon>
        );
      case 'document':
        return (
          <S.DocumentFileIcon>
            <FileText className="w-full h-full" />
          </S.DocumentFileIcon>
        );
      case 'image':
        return (
          <S.ImageFileIcon>
            <File className="w-full h-full" />
          </S.ImageFileIcon>
        );
      default:
        return (
          <S.DefaultFileIcon>
            <File className="w-full h-full" />
          </S.DefaultFileIcon>
        );
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'directory') {
      toggleDirectory(item.path);
    } else if (isImageFile(item.name)) {
      handleImageSelect(item);
    } else {
      handleFileSelect(item);
    }
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => (
      <S.FileTreeItem key={item.path}>
        <S.FileButton
          style={{ paddingLeft: `${calculatePadding(level)}px` }}
          onClick={() => handleItemClick(item)}
        >
          <S.FileButtonContent>
            {renderIcon(item)}
            <S.FileName>{item.name}</S.FileName>
          </S.FileButtonContent>
        </S.FileButton>
        
        {item.type === 'directory' && 
         expandedDirs.has(item.path) && 
         item.children && 
         item.children.length > 0 && (
          <div>{renderFileTree(item.children, level + 1)}</div>
        )}
      </S.FileTreeItem>
    ));
  };

  if (loading) {
    return (
      <S.LoadingContainer>
        <S.LoadingText>Loading files...</S.LoadingText>
      </S.LoadingContainer>
    );
  }

  return (
    <S.Container>
      <ScrollArea className="flex-1 p-4">
        {files.length === 0 ? (
          <S.EmptyStateContainer>
            <S.EmptyStateIcon>
              <S.EmptyFolderIcon>
                <Folder className="w-full h-full" />
              </S.EmptyFolderIcon>
            </S.EmptyStateIcon>
            <S.EmptyStateTitle>No files found</S.EmptyStateTitle>
            <S.EmptyStateDescription>
              Check if the project path is accessible
            </S.EmptyStateDescription>
          </S.EmptyStateContainer>
        ) : (
          <S.FileTreeContainer>
            {renderFileTree(files)}
          </S.FileTreeContainer>
        )}
      </ScrollArea>
      
      {selectedFile && (
        <CodeEditor
          file={selectedFile}
          onClose={closeFile}
          projectPath={selectedFile.projectPath}
        />
      )}
      
      {selectedImage && (
        <ImageViewer
          file={selectedImage}
          onClose={closeImage}
        />
      )}
    </S.Container>
  );
};