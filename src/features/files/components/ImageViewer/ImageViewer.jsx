import React from 'react';
import { Button } from '@/shared-components/Button';
import { X } from 'lucide-react';
import { useImageViewer } from '@/features/files/components/ImageViewer/ImageViewer.hook';
import {
  Overlay,
  Modal,
  Header,
  Title,
  CloseButton,
  Content,
  Image,
  ErrorContainer,
  ErrorMessage,
  Footer,
  FilePath
} from '@/features/files/components/ImageViewer/ImageViewer.styles';

export const ImageViewer = ({ file, onClose }) => {
  const {
    imagePath,
    isLoading,
    hasError,
    imageRef,
    errorContainerRef,
    onImageLoad,
    onImageError
  } = useImageViewer(file);

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>{file.name}</Title>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            css={CloseButton}
          >
            <X className="h-4 w-4" />
          </Button>
        </Header>

        <Content>
          <Image
            ref={imageRef}
            src={imagePath}
            alt={file.name}
            onLoad={onImageLoad}
            onError={onImageError}
            style={{ display: hasError ? 'none' : 'block' }}
          />
          <ErrorContainer ref={errorContainerRef} show={hasError}>
            <p>Unable to load image</p>
            <ErrorMessage>{file.path}</ErrorMessage>
          </ErrorContainer>
        </Content>

        <Footer>
          <FilePath>{file.path}</FilePath>
        </Footer>
      </Modal>
    </Overlay>
  );
};