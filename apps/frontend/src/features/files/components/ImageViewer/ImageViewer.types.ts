export interface ImageFile {
  name: string;
  path: string;
  projectPath?: string;
  size?: number;
  type?: string;
}

export interface ImageViewerProps {
  file: ImageFile;
  onClose: () => void;
}

export interface ImageViewerHookReturn {
  imagePath: string;
  isLoading: boolean;
  hasError: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
  errorContainerRef: React.RefObject<HTMLDivElement>;
  onImageLoad: () => void;
  onImageError: () => void;
}
