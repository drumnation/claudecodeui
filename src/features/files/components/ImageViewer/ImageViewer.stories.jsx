import React from 'react';
import { ImageViewer as OriginalImageViewer } from '@/features/files/components/ImageViewer/ImageViewer';
import { Button } from '@/shared-components/Button';
import { X } from 'lucide-react';
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

// Storybook wrapper that uses real image URLs
// TODO: Consider using MSW (Mock Service Worker) for proper API mocking
// This is a temporary solution to show real images in Storybook
const StorybookImageViewer = ({ file, onClose }) => {
  const [hasError, setHasError] = React.useState(false);
  
  // Map file paths to real images
  const imageMap = {
    '/images/sample.jpg': 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&h=600&fit=crop',
    '/images/landscape.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
    '/images/portrait.jpg': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop',
    '/images/code-screenshot.png': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=800&fit=crop',
    '/images/dark-mode-sample.jpg': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop'
  };
  
  const imageSrc = imageMap[file.path] || file.path;
  
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
            src={imageSrc}
            alt={file.name}
            onError={() => setHasError(true)}
            style={{ display: hasError ? 'none' : 'block' }}
          />
          
          {hasError && (
            <ErrorContainer style={{ display: 'block' }}>
              <ErrorMessage>Unable to load image</ErrorMessage>
            </ErrorContainer>
          )}
        </Content>

        <Footer>
          <FilePath>{file.path}</FilePath>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default {
  title: 'Features/Files/components/ImageViewer',
  component: StorybookImageViewer,
  parameters: {
    docs: {
      description: {
        component: 'A modal component for viewing images with error handling and loading states.'
      }
    }
  },
  argTypes: {
    file: {
      description: 'File object containing projectName, path, and name',
      control: { type: 'object' }
    },
    onClose: {
      description: 'Callback function called when closing the viewer',
      action: 'closed'
    }
  }
};

const Template = (args) => <StorybookImageViewer {...args} />;

export const Default = Template.bind({});
Default.args = {
  file: {
    projectName: 'my-project',
    path: '/images/sample.jpg',
    name: 'cute-dog.jpg'
  }
};
Default.parameters = {
  docs: {
    description: {
      story: 'A cute dog photo demonstrating the default image viewer'
    }
  }
};

export const Landscape = Template.bind({});
Landscape.args = {
  file: {
    projectName: 'my-project',
    path: '/images/landscape.jpg',
    name: 'mountain-landscape.jpg'
  }
};
Landscape.parameters = {
  docs: {
    description: {
      story: 'A wide landscape image showing how the viewer handles different aspect ratios'
    }
  }
};

export const WithError = Template.bind({});
WithError.args = {
  file: {
    projectName: 'my-project',
    path: '/images/non-existent.jpg',
    name: 'non-existent.jpg'
  }
};
WithError.parameters = {
  docs: {
    description: {
      story: 'Shows the error state when an image fails to load'
    }
  }
};

export const Portrait = Template.bind({});
Portrait.args = {
  file: {
    projectName: 'my-project',
    path: '/images/portrait.jpg',
    name: 'person-portrait.jpg'
  }
};
Portrait.parameters = {
  docs: {
    description: {
      story: 'A portrait image demonstrating vertical aspect ratio handling'
    }
  }
};

export const CodeScreenshot = Template.bind({});
CodeScreenshot.args = {
  file: {
    projectName: 'my-project',
    path: '/images/code-screenshot.png',
    name: 'code-editor-screenshot.png'
  }
};
CodeScreenshot.parameters = {
  docs: {
    description: {
      story: 'A code editor screenshot showing how the viewer handles PNG files'
    }
  }
};

export const LongFileName = Template.bind({});
LongFileName.args = {
  file: {
    projectName: 'my-project',
    path: '/images/landscape.jpg',
    name: 'this-is-a-very-long-file-name-that-might-cause-overflow-in-the-header-area.jpg'
  }
};
LongFileName.parameters = {
  docs: {
    description: {
      story: 'Tests how the viewer handles very long file names in the header'
    }
  }
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  file: {
    projectName: 'my-project',
    path: '/images/dark-mode-sample.jpg',
    name: 'ocean-at-night.jpg'
  }
};
DarkMode.parameters = {
  backgrounds: { default: 'dark' },
  docs: {
    description: {
      story: 'ImageViewer in dark mode with an ocean night scene'
    }
  }
};