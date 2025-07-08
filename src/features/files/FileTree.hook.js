import { useState, useEffect, useCallback } from 'react';
import { toggleExpandedDirectory, createFileObject } from '@/features/files/FileTree.logic';

/**
 * Custom hook for FileTree component
 * Manages all stateful logic including API calls and UI state
 */
export const useFileTree = (selectedProject) => {
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
    
    console.log('🌲 FileTree: Fetching files for project:', selectedProject.name);
    console.log('🌲 FileTree: Project path:', selectedProject.fullPath);
    setLoading(true);
    setError(null);
    try {
      const encodedProjectName = encodeURIComponent(selectedProject.name);
      const requestUrl = `/api/projects/${encodedProjectName}/files`;
      console.log('🌲 FileTree: Request URL:', requestUrl);
      
      const response = await fetch(requestUrl);
      console.log('🌲 FileTree: Response status:', response.status);
      console.log('🌲 FileTree: Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });
      
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
        
        console.error('❌ File fetch failed:', response.status, errorData);
        
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
      console.log('🌲 FileTree: Received file data:', data);
      console.log('🌲 FileTree: Number of items:', Array.isArray(data) ? data.length : 'Not an array');
      
      // Validate response data structure
      if (!Array.isArray(data)) {
        console.error('❌ Invalid response format: expected array, got', typeof data);
        setError('Invalid response format from server');
        setFiles([]);
        return;
      }
      
      // Validate each file object has required properties
      const validFiles = data.filter(file => {
        if (!file || typeof file !== 'object') {
          console.warn('⚠️ Invalid file object:', file);
          return false;
        }
        if (!file.name || !file.path || !file.type) {
          console.warn('⚠️ File missing required properties:', file);
          return false;
        }
        return true;
      });
      
      if (validFiles.length < data.length) {
        console.warn(`⚠️ Filtered out ${data.length - validFiles.length} invalid file objects`);
      }
      
      setFiles(validFiles);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      console.error('Stack trace:', error.stack);
      
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