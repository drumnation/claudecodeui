import { useState, useRef, useCallback } from 'react';
import { handleImageError, generateImagePath } from '@/features/files/components/ImageViewer/ImageViewer.logic';

export const useImageViewer = (file) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef(null);
  const errorContainerRef = useRef(null);

  const imagePath = generateImagePath(file.projectName, file.path);

  const onImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const onImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    handleImageError(imageRef.current, errorContainerRef.current);
  }, []);

  return {
    imagePath,
    isLoading,
    hasError,
    imageRef,
    errorContainerRef,
    onImageLoad,
    onImageError
  };
};