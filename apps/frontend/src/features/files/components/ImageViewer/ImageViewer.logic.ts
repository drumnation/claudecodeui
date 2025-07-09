export const handleImageError = (imageElement: any, errorContainer: any) => {
  if (imageElement && errorContainer) {
    imageElement.style.display = 'none';
    errorContainer.style.display = 'block';
  }
};

export const generateImagePath = (projectName: any, filePath: any) => {
  return `/api/projects/${projectName}/files/content?path=${encodeURIComponent(filePath)}`;
};
