import { useState, useEffect, useCallback } from 'react';
import { toggleExpandedDirectory, createFileObject } from '@/features/files/FileTree.logic';

/**
 * Custom hook for FileTree component
 * Manages all stateful logic including API calls and UI state
 */
export const useFileTree = (selectedProject) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
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
    try {
      const response = await fetch(`/api/projects/${selectedProject.name}/files`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ File fetch failed:', response.status, errorText);
        setFiles([]);
        return;
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
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