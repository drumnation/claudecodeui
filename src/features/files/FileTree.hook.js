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
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${selectedProject.name}/files`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ File fetch failed:', response.status, errorText);
        setError(`Failed to load files: ${response.status} ${errorText || response.statusText}`);
        setFiles([]);
        return;
      }
      
      const data = await response.json();
      setFiles(data);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      setError(`Failed to connect to server: ${error.message}`);
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
    closeImage
  };
};