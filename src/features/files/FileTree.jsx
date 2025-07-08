import React from 'react';
import { Folder, FolderOpen, File, FileText, FileCode, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { CodeEditor } from '@/shared-components/CodeEditor';
import { ImageViewer } from '@/features/files/components/ImageViewer';
import { useFileTree } from '@/features/files/FileTree.hook';
import { isImageFile, getFileType, calculatePadding } from '@/features/files/FileTree.logic';
import * as S from '@/features/files/FileTree.styles';

export const FileTree = ({ selectedProject, gitStatus }) => {
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
    fetchFiles
  } = useFileTree(selectedProject);

  // Get all changed file paths from git status
  const getChangedFiles = () => {
    if (!gitStatus) return new Set();
    
    const changedFiles = new Set();
    ['modified', 'added', 'deleted', 'untracked'].forEach(status => {
      if (gitStatus[status]) {
        gitStatus[status].forEach(file => changedFiles.add(file));
      }
    });
    return changedFiles;
  };

  // Check if a directory contains any changed files
  const directoryContainsChanges = (dirPath, changedFiles) => {
    if (!changedFiles.size) return false;
    
    // Remove leading slash and add trailing slash for comparison
    const normalizedDirPath = dirPath.replace(/^\//, '').replace(/\/$/, '') + '/';
    
    for (const file of changedFiles) {
      if (file.startsWith(normalizedDirPath)) {
        return true;
      }
    }
    return false;
  };

  const changedFiles = getChangedFiles();

  const renderIcon = (item) => {
    if (item.type === 'directory') {
      const hasChanges = directoryContainsChanges(item.path, changedFiles);
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
    // Check if this specific file has changes
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
          <S.DefaultFileIcon hasChanges={fileHasChanges}>
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
    if (!Array.isArray(items)) {
      console.error('FileTree: items is not an array', items);
      return null;
    }
    return items.map((item) => (
      <S.FileTreeItem key={item.path}>
        <S.FileButton
          style={{ paddingLeft: `${calculatePadding(level)}px` }}
          onClick={() => handleItemClick(item)}
        >
          <S.FileButtonContent>
            {renderIcon(item)}
            <S.FileName hasChanges={item.type === 'file' && changedFiles.has(item.path.replace(/^\//, ''))}>{item.name}</S.FileName>
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
      <S.Container>
        <S.LoadingContainer>
          <S.LoadingStateContainer>
            <S.LoadingStateIcon>
              <S.LoadingIcon>
                <Loader2 className="w-full h-full" />
              </S.LoadingIcon>
            </S.LoadingStateIcon>
            <S.LoadingStateTitle>Loading files</S.LoadingStateTitle>
            <S.LoadingStateDescription>
              Fetching project structure...
            </S.LoadingStateDescription>
          </S.LoadingStateContainer>
        </S.LoadingContainer>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.ScrollContainer className="overflow-auto">
        {error ? (
          <S.ErrorStateContainer>
            <S.ErrorStateIcon>
              <S.ErrorIcon>
                <AlertCircle className="w-full h-full" />
              </S.ErrorIcon>
            </S.ErrorStateIcon>
            <S.ErrorStateTitle>
              {error.includes('Permission denied') ? 'Access Denied' : 
               error.includes('not found') ? 'Directory Not Found' :
               error.includes('Cannot connect') ? 'Connection Failed' :
               'Failed to Load Files'}
            </S.ErrorStateTitle>
            <S.ErrorStateMessage>
              {error.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </S.ErrorStateMessage>
            {(error.includes('Permission denied') || error.includes('not found')) && (
              <S.EmptyStateDescription style={{ marginTop: '1rem' }}>
                <strong>Troubleshooting tips:</strong>
                <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                  <li>Check if the project directory exists at the expected location</li>
                  <li>Verify you have read permissions for the directory</li>
                  <li>If the project was moved, try refreshing the project list</li>
                  <li>For permission issues, check directory ownership and permissions</li>
                </ul>
              </S.EmptyStateDescription>
            )}
            {S.RefreshButton ? (
              <S.RefreshButton onClick={fetchFiles} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </S.RefreshButton>
            ) : (
              <button onClick={fetchFiles} disabled={loading} style={{ marginTop: '1rem' }}>
                Try Again
              </button>
            )}
          </S.ErrorStateContainer>
        ) : !Array.isArray(files) || files.length === 0 ? (
          <S.EmptyStateContainer>
            <S.EmptyStateIcon>
              <S.EmptyFolderIcon>
                <Folder className="w-full h-full" />
              </S.EmptyFolderIcon>
            </S.EmptyStateIcon>
            <S.EmptyStateTitle>No Files Found</S.EmptyStateTitle>
            <S.EmptyStateDescription>
              {selectedProject?.fullPath ? (
                <React.Fragment>
                  <div>Project path: <code style={{ fontSize: '0.875rem' }}>{selectedProject.fullPath}</code></div>
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Possible reasons:</strong>
                    <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                      <li>The directory is empty</li>
                      <li>All files are in excluded directories (node_modules, dist, build)</li>
                      <li>Permission issues preventing file access</li>
                      <li>The project path may have changed</li>
                    </ul>
                  </div>
                </React.Fragment>
              ) : (
                'Check if the project path is accessible'
              )}
            </S.EmptyStateDescription>
            {S.RefreshButton ? (
              <S.RefreshButton onClick={fetchFiles} disabled={loading} style={{ marginTop: '1rem' }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </S.RefreshButton>
            ) : (
              <button onClick={fetchFiles} disabled={loading} style={{ marginTop: '1rem' }}>
                Refresh
              </button>
            )}
          </S.EmptyStateContainer>
        ) : (
          <S.FileTreeContainer>
            {renderFileTree(files)}
          </S.FileTreeContainer>
        )}
      </S.ScrollContainer>
      
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