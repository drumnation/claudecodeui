import { useState, useEffect, useCallback } from 'react';
import { toggleExpandedDirectory, createFileObject } from '@/features/files/FileTree.logic';
import { useLogger, sanitizeError, addTimestamp, isLevelEnabled } from '../../logger';

/**
 * Custom hook for FileTree component
 * Manages all stateful logic including API calls and UI state
 */
export const useFileTree = (selectedProject) => {
  const logger = useLogger({ hook: 'useFileTree' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch files when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchFiles();
    }
  }, [selectedProject]);

  const fetchFiles = useCallback(async () => {
    if (!selectedProject) return;
    
    logger.debug('Fetching files for project', {
      projectName: selectedProject.name,
      displayName: selectedProject.displayName,
      fullPath: selectedProject.fullPath,
      path: selectedProject.path,
      ...addTimestamp()
    });
    setLoading(true);
    setError(null);
    try {
      const encodedProjectName = encodeURIComponent(selectedProject.name);
      const requestUrl = `/api/projects/${encodedProjectName}/files`;
      if (isLevelEnabled(logger, 'debug')) {
        logger.debug('API request details', {
          requestUrl,
          encodedProjectName,
          projectName: selectedProject.name,
          ...addTimestamp()
        });
      }
      
      const response = await fetch(requestUrl);
      if (isLevelEnabled(logger, 'debug')) {
        logger.debug('API response details', {
          status: response.status,
          headers: {
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length')
          },
          projectName: selectedProject.name,
          ...addTimestamp()
        });
      }
      
      if (!response.ok) {
        let errorData;
        try {
          // Try to parse JSON error response
          errorData = await response.json();
        } catch (e) {
          // Fallback to generic error if JSON parsing fails
          // Cannot read text() after json() attempt failed
          errorData = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        
        logger.error('File fetch failed', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          projectName: selectedProject.name,
          requestUrl,
          ...addTimestamp()
        });
        
        // Provide specific error messages based on status code
        let errorMessage;
        if (response.status === 404) {
          if (errorData.error?.includes('Project not found')) {
            errorMessage = 'Project not found. It may have been deleted or renamed.';
          } else if (errorData.error?.includes('directory not found')) {
            errorMessage = `Directory not found: ${errorData.error.split(':')[1]?.trim() || selectedProject.fullPath}\n${errorData.suggestion || 'The project may have been moved or deleted.'}`;
          } else {
            errorMessage = errorData.error || 'Project directory not found';
          }
        } else if (response.status === 403) {
          errorMessage = `Permission denied: Cannot access project directory.\n${errorData.suggestion || 'Check directory permissions.'}`;
        } else if (response.status === 400) {
          errorMessage = `Invalid project path: ${errorData.error}\n${errorData.type === 'file' ? 'The path points to a file, not a directory.' : ''}`;
        } else {
          errorMessage = errorData.error || `Server error: ${response.statusText}`;
        }
        
        setError(errorMessage);
        setFiles([]);
        return;
      }
      
      const data = await response.json();
      if (isLevelEnabled(logger, 'debug')) {
        logger.debug('Received file data', {
          dataType: typeof data,
          isArray: Array.isArray(data),
          itemCount: Array.isArray(data) ? data.length : 0,
          projectName: selectedProject.name,
          ...addTimestamp()
        });
      }
      
      // Validate response data structure
      if (!Array.isArray(data)) {
        logger.error('Invalid response format', {
          expectedType: 'array',
          actualType: typeof data,
          projectName: selectedProject.name,
          requestUrl,
          ...addTimestamp()
        });
        setError('Invalid response format from server');
        setFiles([]);
        return;
      }
      
      // Validate each file object has required properties
      const validFiles = data.filter(file => {
        if (!file || typeof file !== 'object') {
          logger.warn('Invalid file object', {
            file,
            fileType: typeof file,
            projectName: selectedProject.name,
            ...addTimestamp()
          });
          return false;
        }
        if (!file.name || !file.path || !file.type) {
          logger.warn('File missing required properties', {
            file,
            missingProperties: {
              name: !file.name,
              path: !file.path,
              type: !file.type
            },
            projectName: selectedProject.name,
            ...addTimestamp()
          });
          return false;
        }
        return true;
      });
      
      if (validFiles.length < data.length) {
        logger.warn('Filtered out invalid file objects', {
          totalFiles: data.length,
          validFiles: validFiles.length,
          filteredCount: data.length - validFiles.length,
          projectName: selectedProject.name,
          ...addTimestamp()
        });
      }
      
      setFiles(validFiles);
      setError(null);
      
      logger.info('Files loaded successfully', {
        fileCount: validFiles.length,
        projectName: selectedProject.name,
        ...addTimestamp()
      });
    } catch (error) {
      logger.error('Error fetching files', {
        error: sanitizeError(error),
        projectName: selectedProject.name,
        requestUrl: `/api/projects/${encodeURIComponent(selectedProject.name)}/files`,
        ...addTimestamp()
      });
      
      // Provide specific error messages for common network issues
      let errorMessage;
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to server. Please check if the server is running.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The server may be slow or unresponsive.';
      } else {
        errorMessage = `Failed to load files: ${error.message}`;
      }
      
      setError(errorMessage);
      setFiles([]);
      
      logger.error('File fetch operation failed', {
        errorMessage,
        errorType: error.name,
        projectName: selectedProject.name,
        networkError: error.name === 'TypeError' && error.message === 'Failed to fetch',
        ...addTimestamp()
      });
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  const toggleDirectory = useCallback((path) => {
    setExpandedDirs(prev => toggleExpandedDirectory(prev, path));
  }, []);

  const handleFileSelect = useCallback((item) => {
    const fileObject = createFileObject(item, selectedProject);
    setSelectedFile(fileObject);
  }, [selectedProject]);

  const handleImageSelect = useCallback((item) => {
    const imageObject = createFileObject(item, selectedProject);
    setSelectedImage(imageObject);
  }, [selectedProject]);

  const closeFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const closeImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return {
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
  };
};