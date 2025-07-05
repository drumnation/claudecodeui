export const handleImageError = (imageElement, errorContainer) => {
  if (imageElement && errorContainer) {
    imageElement.style.display = 'none';
    errorContainer.style.display = 'block';
  }
};

export const generateImagePath = (projectName, filePath) => {
  return `/api/projects/${projectName}/files/content?path=${encodeURIComponent(filePath)}`;
};