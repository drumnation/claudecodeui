import React from "react";
import { useLogger } from "@kit/logger/react";
import { Button } from "@/components/atoms/Button";
import { X } from "lucide-react";

export interface FileInfo {
  name: string;
  path: string;
  projectName: string;
}

export interface ImageViewerProps {
  file: FileInfo;
  onClose: () => void;
}

function ImageViewer({ file, onClose }: ImageViewerProps) {
  const logger = useLogger({ scope: 'ImageViewer' });
  const imagePath = `/api/projects/${file.projectName}/files/content?path=${encodeURIComponent(file.path)}`;

  React.useEffect(() => {
    logger.info('ImageViewer opened', {
      fileName: file.name,
      filePath: file.path,
      projectName: file.projectName,
      imagePath,
      fileExtension: file.name.split('.').pop()?.toLowerCase()
    });
  }, [file, imagePath, logger]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    logger.info('Image loaded successfully', {
      fileName: file.name,
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      displayWidth: target.width,
      displayHeight: target.height,
      imagePath
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const nextSibling = target.nextSibling as HTMLElement;
    target.style.display = "none";
    if (nextSibling) {
      nextSibling.style.display = "block";
    }
    
    logger.error('Failed to load image', {
      fileName: file.name,
      filePath: file.path,
      projectName: file.projectName,
      imagePath,
      error: 'Image failed to load from server'
    });
  };

  const handleClose = () => {
    logger.debug('ImageViewer closing', {
      fileName: file.name,
      projectName: file.projectName
    });
    onClose();
  };

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      logger.debug('ImageViewer closed via Escape key', {
        fileName: file.name
      });
      onClose();
    }
  }, [onClose, file.name, logger]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {file.name}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 flex justify-center items-center bg-gray-50 dark:bg-gray-900 min-h-[400px]">
          <img
            src={imagePath}
            alt={file.name}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <div
            className="text-center text-gray-500 dark:text-gray-400"
            style={{ display: "none" }}
          >
            <p>Unable to load image</p>
            <p className="text-sm mt-2">{file.path}</p>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {file.path}
          </p>
        </div>
      </div>
    </div>
  );
}

export { ImageViewer };