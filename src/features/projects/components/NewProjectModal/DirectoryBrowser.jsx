import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderPlus, 
  ArrowLeft, 
  Home, 
  FileText, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/shared-components/Button/Button';
import { Input } from '@/shared-components/Input/Input';
import * as S from './DirectoryBrowser.styles';

export const DirectoryBrowser = ({ 
  onSelectPath, 
  selectedPath,
  className = '' 
}) => {
  const [currentPath, setCurrentPath] = useState('');
  const [directories, setDirectories] = useState([]);
  const [files, setFiles] = useState([]);
  const [parentPath, setParentPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  // Load directory contents
  const loadDirectory = async (path = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const url = path 
        ? `/api/directories?path=${encodeURIComponent(path)}`
        : '/api/directories';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load directory');
      }
      
      setCurrentPath(data.currentPath);
      setDirectories(data.directories || []);
      setFiles(data.files || []);
      setParentPath(data.parentPath);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDirectory();
  }, []);

  // Navigate to a directory
  const navigateToDirectory = (dirPath) => {
    loadDirectory(dirPath);
  };

  // Go to parent directory
  const goToParent = () => {
    if (parentPath) {
      loadDirectory(parentPath);
    }
  };

  // Go to home directory
  const goToHome = () => {
    loadDirectory();
  };

  // Create new folder
  const createNewFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setCreating(true);
    try {
      const response = await fetch('/api/directories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: currentPath,
          name: newFolderName.trim()
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create folder');
      }
      
      // Navigate into the newly created folder
      await loadDirectory(data.path);
      
      // Reset form
      setNewFolderName('');
      setShowCreateFolder(false);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Select current path
  const selectCurrentPath = () => {
    onSelectPath(currentPath);
  };

  return (
    <S.Container className={className}>
      {/* Header with navigation */}
      <S.Header>
        <S.NavigationButtons>
          <Button
            size="sm"
            variant="ghost"
            onClick={goToHome}
            disabled={loading}
            className="h-7 w-7 p-1"
          >
            <Home className="w-3 h-3" />
          </Button>
          
          {parentPath && (
            <Button
              size="sm"
              variant="ghost"
              onClick={goToParent}
              disabled={loading}
              className="h-7 w-7 p-1"
            >
              <ArrowLeft className="w-3 h-3" />
            </Button>
          )}
        </S.NavigationButtons>
        
        <S.PathDisplay>
          <span className="text-xs text-muted-foreground truncate">
            {currentPath || 'Home'}
          </span>
        </S.PathDisplay>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowCreateFolder(!showCreateFolder)}
          disabled={loading}
          className="h-7 w-7 p-1"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </S.Header>

      {/* Create folder form */}
      {showCreateFolder && (
        <S.CreateFolderForm>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            className="text-xs h-7"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') createNewFolder();
              if (e.key === 'Escape') {
                setShowCreateFolder(false);
                setNewFolderName('');
              }
            }}
          />
          <S.CreateFolderActions>
            <Button
              size="sm"
              onClick={createNewFolder}
              disabled={!newFolderName.trim() || creating}
              className="h-6 text-xs px-2"
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCreateFolder(false);
                setNewFolderName('');
              }}
              disabled={creating}
              className="h-6 text-xs px-2"
            >
              Cancel
            </Button>
          </S.CreateFolderActions>
        </S.CreateFolderForm>
      )}

      {/* Error display */}
      {error && (
        <S.ErrorMessage>
          {error}
        </S.ErrorMessage>
      )}

      {/* Directory listing */}
      <S.DirectoryList>
        {loading ? (
          <S.LoadingState>
            Loading...
          </S.LoadingState>
        ) : (
          <>
            {/* Directories */}
            {directories.map((dir) => (
              <S.DirectoryItem
                key={dir.path}
                onClick={() => navigateToDirectory(dir.path)}
                $isHidden={dir.hidden}
              >
                <S.ItemIcon>
                  <Folder className="w-3 h-3 text-blue-500" />
                </S.ItemIcon>
                <S.ItemName>{dir.name}</S.ItemName>
                <S.ItemAction>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </S.ItemAction>
              </S.DirectoryItem>
            ))}
            
            {/* Files (limited, just for context) */}
            {files.slice(0, 3).map((file) => (
              <S.FileItem
                key={file.path}
                $isHidden={file.hidden}
              >
                <S.ItemIcon>
                  <FileText className="w-3 h-3 text-muted-foreground" />
                </S.ItemIcon>
                <S.ItemName>{file.name}</S.ItemName>
              </S.FileItem>
            ))}
            
            {files.length > 3 && (
              <S.FileInfo>
                ... and {files.length - 3} more files
              </S.FileInfo>
            )}
          </>
        )}
      </S.DirectoryList>

      {/* Footer with select button */}
      <S.Footer>
        <Button
          onClick={selectCurrentPath}
          disabled={loading || !currentPath}
          className="w-full h-8 text-xs"
        >
          Select "{currentPath?.split('/').pop() || 'Home'}"
        </Button>
      </S.Footer>
    </S.Container>
  );
};